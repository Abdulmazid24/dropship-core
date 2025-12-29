import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { User } from './user.model';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/middleware/error.middleware';
import { AppError } from '../../shared/middleware/error.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const signupSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/signup',
    asyncHandler(async (req: Request, res: Response) => {
        const { name, email, password } = signupSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            passwordHash: password, // Will be hashed by pre-save hook
            role: 'USER',
        });

        // Generate tokens
        const tokens = AuthService.generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set HTTP-only cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                accessToken: tokens.accessToken,
            },
        });
    })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/login',
    asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);

        // Find user
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Generate tokens
        const tokens = AuthService.generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set HTTP-only cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                accessToken: tokens.accessToken,
            },
        });
    })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    asyncHandler(async (_req: Request, res: Response) => {
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const user = await User.findById(req.user?.userId);

        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        res.json({
            success: true,
            data: { user: user.toJSON() },
        });
    })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh',
    asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
        }

        // Verify refresh token
        const decoded = AuthService.verifyRefreshToken(refreshToken);

        // Generate new access token
        const accessToken = AuthService.generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });

        // Set new access token cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { accessToken },
        });
    })
);

export default router;

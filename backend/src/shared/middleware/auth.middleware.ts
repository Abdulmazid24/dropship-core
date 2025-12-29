import { Request, Response, NextFunction } from 'express';
import { AuthService, IJWTPayload } from '../../modules/auth/auth.service';
import { AppError } from './error.middleware';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IJWTPayload;
        }
    }
}

/**
 * Authenticate user from JWT token in cookies or Authorization header
 */
export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Try to get token from cookies first
        let token = req.cookies?.accessToken;

        // If not in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new AppError('Authentication required', 401, 'NO_TOKEN');
        }

        // Verify token
        const decoded = AuthService.verifyAccessToken(token);

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
};

/**
 * Authorize user based on roles
 */
export const authorize = (...allowedRoles: Array<'USER' | 'ADMIN'>) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(
                new AppError(
                    'Authentication required',
                    401,
                    'AUTHENTICATION_REQUIRED'
                )
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403,
                    'FORBIDDEN'
                )
            );
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.substring(7);

        if (token) {
            const decoded = AuthService.verifyAccessToken(token);
            req.user = decoded;
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next();
};

import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface IJWTPayload {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export class AuthService {
    /**
     * Generate access token (short-lived)
     */
    static generateAccessToken(payload: IJWTPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });
    }

    /**
     * Generate refresh token (long-lived)
     */
    static generateRefreshToken(payload: IJWTPayload): string {
        return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
            expiresIn: '30d',
        });
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): IJWTPayload {
        return jwt.verify(token, env.JWT_SECRET) as IJWTPayload;
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): IJWTPayload {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as IJWTPayload;
    }

    /**
     * Generate both access and refresh tokens
     */
    static generateTokenPair(payload: IJWTPayload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
}

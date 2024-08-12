import { JwtPayload } from 'jsonwebtoken';

export interface ResetTokenPayload {
    email: string;
}

export const isResetTokenPayload = (
    value: JwtPayload | string
): value is ResetTokenPayload => typeof value !== 'string' && 'email' in value;

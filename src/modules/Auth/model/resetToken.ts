import { z } from 'zod';
import { Brand } from '../../../utility/brand';
import { JwtPayload } from 'jsonwebtoken';

export type ResetToken = Brand<string, 'ResetToken'>;

export const isResetToken = (value: string): value is ResetToken =>
    value.length === 64;

export const zodResetToken = z.string().refine(isResetToken);

export interface ResetPasswordToken extends JwtPayload {
    email: string
}
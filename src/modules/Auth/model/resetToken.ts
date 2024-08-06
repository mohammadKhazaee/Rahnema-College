import { z } from 'zod';
import { Brand } from '../../../utility/brand';

export type ResetToken = Brand<string, 'ResetToken'>;

export const isResetToken = (value: string): value is ResetToken =>
    value.length === 64;

export const zodUserId = z.string().refine(isResetToken);

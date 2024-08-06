import { ResetToken } from './resetToken';

export interface authData {
    username: string;
    resetToken: ResetToken;
    resetTokenExp: number;
}

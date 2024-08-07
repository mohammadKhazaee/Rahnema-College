import { User } from '../User/model/user';
import { UserRepository } from '../User/user.repository';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/logindto';
import { HttpError, NotFoundError } from '../../utility/errors';
import { ResetPaswordDto } from './dto/resetpassword-dto';
const { OAuth2 } = require('googleapis').auth;
import nodemailer from "nodemailer";

const oauth2Client = new OAuth2(
    '288101966109 - dd3lfoi3t08m8e0pkvr0fthn55gasfr3.apps.googleusercontent.com',
    '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',
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({ refresh_token: '1//04VaiSbR1m0xzCgYIARAAGAQSNwF-L9Irvzi59ha1N3VYcFsXqWj0GfTbz9Awt5eNecgYtgpkVRiAOc4zKbwJB3xE_zQZV7id2wI' });


/// ============= classes
export class AuthService {
    constructor(
        private authRepo: AuthRepository, private userRepo: UserRepository) { }

    async login(dto: LoginDto) {
        let user: User | null;
        if ('username' in dto)
            user = await this.userRepo.findByUsername(dto.username);
        else user = await this.userRepo.findByEmail(dto.email);

        if (!user) {
            throw new Error('401 , username or password not found');
        }
        if (dto.password !== user.password) {
            throw new Error('401, passwort is wrong');
        }
        const token = this.authRepo.generateTokenForLogin(user);
        return token;
    }

    async resetPassword(dto: ResetPaswordDto) {
        let user: User | null
        if ("username" in dto) {
            user = await this.userRepo.findByUsername(dto.username)
            if (!user) {
                throw new NotFoundError()
            }

            if (dto.username !== user.username) {
                throw new NotFoundError()
            }
        } else {
            user = await this.userRepo.findByEmail(dto.email)

            if (!user) {
                throw new NotFoundError()
            }

            if (dto.email !== user.email) {
                throw new NotFoundError()
            }
        }
        const accessToken = await oauth2Client.getAccessToken();
        const resetToken = this.authRepo.generateTokenForReset(user)
        const resetLink = `https://RebuildersGeram.com/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: 'ehsunhagh86@gmail.com',
                clientId: '288101966109 - dd3lfoi3t08m8e0pkvr0fthn55gasfr3.apps.googleusercontent.com',
                clientSecret: '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',
                refreshToken: '1//04VaiSbR1m0xzCgYIARAAGAQSNwF-L9Irvzi59ha1N3VYcFsXqWj0GfTbz9Awt5eNecgYtgpkVRiAOc4zKbwJB3xE_zQZV7id2wI',
                accessToken: accessToken.token
            }

        })

        const mailOptions = {
            from: "ehsunhagh86@gmail.com",
            to: user.email,
            subject: "Reset Your Password - RebuildersGeram",
            text: `
        Hi,

        We received a request to reset your password for your account on MyApp.

        Click the link below to reset your password:
        ${resetLink}

        If you didn't request a password reset, please ignore this email. If you have any issues, contact our support team at support@myapp.com.

        Best regards,
        The MyApp Team

        For more information about how we handle your data, please see our Privacy Policy at https://www.myapp.com/privacy-policy.
      `
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
    }
}
import { Jwt, JwtPayload } from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

type MailOption = {
    from: string;
    to: string;
    subject: string;
    text: string;
};

export class GmailHandler {
    createMailOption(resetToken: string, receiverEmail: string): MailOption {
        return {
            from: 'mohammad.test.p@gmail.com',
            to: receiverEmail,
            subject: 'Reset Your Password - RebuildersGeram',
            text: `
                Hi,

                We received a request to reset your password for your account on MyApp.

                Click the link below to reset your password:
                ${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}

                If you didn't request a password reset, please ignore this email. If you have any issues, contact our support team at support@myapp.com.

                Best regards,
                The MyApp Team

                For more information about how we handle your data, please see our Privacy Policy at https://www.myapp.com/privacy-policy.
            `,
        };
    }

    async send(mailOption: MailOption) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.RESET_PASS_GMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        return transporter.sendMail(mailOption);
    }
}

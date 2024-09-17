import { LoginDto } from './dto/logindto';
import { ResetPaswordDto } from './dto/resetpassword-dto';
import { GmailHandler } from '../../utility/gmail-handler';
import jwt, { JwtPayload, sign } from 'jsonwebtoken';
import { ConfirmPasswordDto } from './dto/confrimpassword-dto';
import { UserService } from '../User/user.service';
import { isResetTokenPayload } from './model/resetToken';
import { CreateUser, User } from '../User/model/user';
import * as bcrypt from 'bcrypt';
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthenticatedError,
} from '../../utility/errors/userFacingError';
import {
    LoginUserReason,
    ResetPasswordReason,
    SendResetEmailReason,
    SignupUserReason,
} from '../../utility/errors/error-reason';

export class AuthService {
    constructor(private userService: UserService, private gmailHandler: GmailHandler) {}

    async login(dto: LoginDto): Promise<
        | {
              token: string;
          }
        | UnauthenticatedError
    > {
        const user = await this.userService.fetchUser(dto);

        if (!user) return new UnauthenticatedError(LoginUserReason.InvalidEmail, 'User not found');

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid)
            return new UnauthenticatedError(LoginUserReason.WrongPassword, 'Password is wrong');

        const token = this.generateTokenForLogin(user, dto.rememberMe);
        return { token };
    }

    async signup(dto: CreateUser): Promise<{ message: string } | ConflictError> {
        const userWithEmail = await this.userService.doesUserExists({
            email: dto.email,
        });
        const userWithUsername = await this.userService.doesUserExists({
            username: dto.username,
        });

        if (userWithEmail || userWithUsername)
            return new ConflictError(
                SignupUserReason.DupUser,
                'account with this credential already exists'
            );

        const hashPassword = await bcrypt.hash(dto.password, 12);
        const hashDto = { ...dto, password: hashPassword };

        await this.userService.createUser(hashDto);

        return { message: 'user created successfully!' };
    }

    async resetPassword(dto: ResetPaswordDto): Promise<
        | NotFoundError
        | {
              message: string;
          }
    > {
        const user = await this.userService.fetchUser(dto);

        if (!user)
            return new NotFoundError(
                SendResetEmailReason.NonExistUser,
                'no user with this credentials was found'
            );

        const resetToken = this.generateTokenForReset(user);
        const mailOption = this.gmailHandler.createMailOption(resetToken, user.email);
        await this.gmailHandler.send(mailOption);

        return { message: 'email has been sent' };
    }

    async changePassword(
        dto: ConfirmPasswordDto,
        token: string
    ): Promise<
        | BadRequestError
        | {
              message: string;
          }
    > {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!isResetTokenPayload(payload))
            return new BadRequestError(
                ResetPasswordReason.InvalidToken,
                'Invalid reset password token'
            );

        const user = await this.userService.fetchUser({ email: payload.email });
        if (!user) return new BadRequestError(ResetPasswordReason.NonExistUser);

        user.password = await bcrypt.hash(dto.newPassword, 12);
        await this.userService.updateUser(user);
        return { message: 'Password updated' };
    }

    private generateTokenForLogin(user: User, rememberMe?: boolean) {
        const expiresIn = rememberMe ? '30d' : '1w';
        const payload = { username: user.username, email: user.email };
        return sign(payload, process.env.JWT_SECRET!, { expiresIn });
    }

    private generateTokenForReset(user: User) {
        return jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '24h',
        });
    }
}

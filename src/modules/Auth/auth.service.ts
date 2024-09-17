import { LoginDto } from './dto/logindto';
import { HttpError, NotFoundError } from '../../utility/errors';
import { ResetPaswordDto } from './dto/resetpassword-dto';
import { GmailHandler } from '../../utility/gmail-handler';
import jwt, { JwtPayload, sign } from 'jsonwebtoken';
import { ConfirmPasswordDto } from './dto/confrimpassword-dto';
import { UserService } from '../User/user.service';
import { isResetTokenPayload } from './model/resetToken';
import { CreateUser, User } from '../User/model/user';
import * as bcrypt from 'bcrypt';

export class AuthService {
    constructor(private userService: UserService, private gmailHandler: GmailHandler) {}

    async login(dto: LoginDto) {
        const user = await this.userService.fetchUser(dto);

        if (!user) throw new HttpError(401, 'User not found');

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) throw new HttpError(401, 'Password is wrong');

        const token = this.generateTokenForLogin(user, dto.rememberMe);
        return token;
    }

    async signup(dto: CreateUser) {
        const userWithEmail = await this.userService.doesUserExists({
            email: dto.email,
        });
        const userWithUsername = await this.userService.doesUserExists({
            username: dto.username,
        });

        if (userWithEmail || userWithUsername)
            throw new HttpError(409, 'account with this credential already exists');

        const hashPassword = await bcrypt.hash(dto.password, 12);
        const hashDto = { ...dto, password: hashPassword };

        await this.userService.createUser(hashDto);

        return 'user created successfully!';
    }

    async resetPassword(dto: ResetPaswordDto) {
        const user = await this.userService.fetchUser(dto);

        if (!user) throw new NotFoundError('no user with this credentials was found');

        const resetToken = this.generateTokenForReset(user);
        const mailOption = this.gmailHandler.createMailOption(resetToken, user.email);
        await this.gmailHandler.send(mailOption);

        return 'email has been sent';
    }

    async changePassword(dto: ConfirmPasswordDto, token: string) {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!isResetTokenPayload(payload)) throw new HttpError(400, 'Invalid reset password token');

        const user = await this.userService.fetchUser({ email: payload.email });
        if (!user) throw new NotFoundError();

        user.password = await bcrypt.hash(dto.newPassword, 12);
        await this.userService.updateUser(user);
        return 'Password updated';
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

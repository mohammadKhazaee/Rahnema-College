import { Router } from 'express';
import { isAuthenticated } from '../login-middleware';
import { AuthService } from '../modules/Auth/auth.service';
import { confirmpassworddto } from '../modules/Auth/dto/confrimpassword-dto';
import { logindto } from '../modules/Auth/dto/logindto';
import { resetPasswordDto } from '../modules/Auth/dto/resetpassword-dto';
import { signupDto } from '../modules/Auth/dto/signup-dto';
import { handleExpress } from '../utility/handle-express';

export const authRouter = (authService: AuthService) => {
    const app = Router();

    app.post('/signup', (req, res, next) => {
        const { confirmPassword, ...dto } = signupDto.parse(req.body);
        handleExpress(res, 201, next, async () => ({
            message: authService.signup(dto),
        }));
    });

    app.post('/login', (req, res, next) => {
        const dto = logindto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            token: authService.login(dto),
        }));
    });

    app.post('/send-reset', (req, res, next) => {
        const dto = resetPasswordDto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            message: authService.resetPassword(dto),
        }));
    });

    app.post('/reset-pass/:resetToken', async (req, res, next) => {
        const resetToken = req.params.resetToken;
        const dto = confirmpassworddto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            message: authService.changePassword(dto, resetToken),
        }));
    });

    return app;
};

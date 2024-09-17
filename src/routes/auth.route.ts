import { Router } from 'express';
import { AuthService } from '../modules/Auth/auth.service';
import { confirmpassworddto } from '../modules/Auth/dto/confrimpassword-dto';
import { loginValidator } from '../modules/Auth/dto/logindto';
import { resetPasswordValidator } from '../modules/Auth/dto/resetpassword-dto';
import { signupValidator } from '../modules/Auth/dto/signup-dto';
import { handleExpress } from '../utility/handle-express';

export const authRouter = (authService: AuthService) => {
    const app = Router();

    app.post('/signup', (req, res, next) => {
        const { confirmPassword, ...dto } = signupValidator(req.body)!;
        handleExpress(res, 201, next, () => authService.signup(dto));
    });

    app.post('/login', (req, res, next) => {
        const dto = loginValidator(req.body)!;
        handleExpress(res, 200, next, () => authService.login(dto));
    });

    app.post('/send-reset', (req, res, next) => {
        const dto = resetPasswordValidator(req.body)!;
        handleExpress(res, 200, next, () => authService.resetPassword(dto));
    });

    app.post('/reset-pass/:resetToken', async (req, res, next) => {
        const resetToken = req.params.resetToken;
        const dto = confirmpassworddto.parse(req.body);
        handleExpress(res, 200, next, () => authService.changePassword(dto, resetToken));
    });

    return app;
};

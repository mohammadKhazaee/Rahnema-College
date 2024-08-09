import { Router } from 'express';
import { logindto } from '../modules/Auth/dto/logindto';
import { handleExpress } from '../utility/handle-express';
import { signupDto } from '../modules/Auth/dto/signup-dto';
import { AuthService } from '../modules/Auth/auth.service';
import { GmailHandler } from '../utility/gmail-handler';
import { resetPasswordDto } from '../modules/Auth/dto/resetpassword-dto';
import { isAuthenticated } from '../login-middleware';
import { confirmpassworddto } from '../modules/Auth/dto/confrimpassword-dto';


export const authRouter = (
    authService: AuthService,
    gmailHandler: GmailHandler
) => {
    const app = Router();

    app.post('/signup', (req, res, next) => {
        const { confirmPassword, ...dto } = signupDto.parse(req.body);
        handleExpress(res, 201, next, async () => authService.signup(dto));
    });

    app.post('/login', (req, res, next) => {
        const dto = logindto.parse(req.body);
        handleExpress(res, 200, next, async () => authService.login(dto));
    });

    app.get('/user-info', isAuthenticated, (req, res, next) => {
        handleExpress(res, 200, next, async () =>
            authService.getProfileInfo(req.username)
        );
    });

    app.post('/send-reset', (req, res, next) => {
        const dto = resetPasswordDto.parse(req.body);
        handleExpress(res, 200, next, async () =>
            authService.resetPassword(dto, gmailHandler)
        );
    });

    app.post('/reset-pass/:resetToken', async (req, res, next) => {
        const resetToken = req.params.resetToken
        const dto = confirmpassworddto.parse(req.body)
        handleExpress(res, 200, next, () => authService.changePassword(dto, resetToken))
    });

    return app;
};

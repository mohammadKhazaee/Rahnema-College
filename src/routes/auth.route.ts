import { Router } from 'express';
import { logindto } from '../modules/Auth/dto/logindto';
import { handleExpress } from '../utility/handle-express';
import { signupDto } from '../modules/Auth/dto/signup-dto';
import { AuthService } from '../modules/Auth/auth.service';

export const authRouter = (authService: AuthService) => {
    const app = Router();

    app.post('/signup', (req, res) => {
        const { confirmPassword, ...dto } = signupDto.parse(req.body);
        handleExpress(res, 201, async () => authService.signup(dto));
    });

    app.post('/login', (req, res) => {
        const dto = logindto.parse(req.body);
        handleExpress(res, 200, async () => authService.login(dto));
    });

    app.get('/user-info');

    app.post('/send-reset');

    app.post('/reset-pass');

    return app;
};

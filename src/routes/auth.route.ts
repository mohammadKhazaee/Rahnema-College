import { Router } from 'express';
import { logindto } from '../modules/Auth/dto/logindto';
import { handleExpress } from '../utility/handle-express';

export const authRouter = () => {
    const app = Router();

    app.post('/signup');

    app.post(
        '/login',
        /*loginmiddleware,*/(req, res) => {
            const dto = logindto.parse(req.body);
            handleExpress(res, async () => console.log("this feature does not work yet"));
        }
    );

    app.get('/user-info');

    app.post('/send-reset');

    app.post('/reset-pass');

    return app;
};
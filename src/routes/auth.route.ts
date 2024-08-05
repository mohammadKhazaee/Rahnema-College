import { Router } from 'express';

export const authRouter = () => {
    const app = Router();

    app.post('/signup');

    app.post('/login');

    app.get('/user-info');

    app.post('/send-reset');

    app.post('/reset-pass');

    return app;
};

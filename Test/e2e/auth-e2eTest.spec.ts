import request from 'supertest';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import { generateTokenForReset, loginTest } from './utility';
import { ResetPaswordDto } from '../../src/modules/Auth/dto/resetpassword-dto';
import { User } from '../../src/modules/User/model/user';
import { UserRepository } from '../../src/modules/User/user.repository';
import { UserEntity } from '../../src/modules/User/entity/user.entity';
import { LoginDto } from '../../src/modules/Auth/dto/logindto';

describe('CollegeGram Test Suit', () => {
    const userRepo = new UserRepository(AppDataSource);
    // @ts-ignore
    let app: Express;
    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = appFactory(dataSource);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Auth parts', () => {
        const newUser = {
            username: 'test1245',
            email: 'test1245@gamil.com',
            password: 'teste1245786',
            confirmPassword: 'teste1245786',
        };

        it.skip('sould signup', async () => {
            const { body: user } = await request(app)
                .post('/auth/signup')
                .send(newUser)
                .expect(201);
        });

        it.skip('should login', async () => {
            const loggedinUserToken = await loginTest(app, {
                username: 'test1245',
                password: 'teste1245786',
                rememberMe: true,
            });
        });

        it.skip('should get user informations', async () => {
            const loggedinUserToken = await loginTest(app, {
                email: newUser.email,
                password: newUser.password,
                rememberMe: false,
            });

            const { body: user } = await request(app)
                .get(`/${newUser.username}`)
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200);
        });

        it.skip('should send reset password email', async () => {
            const dto: ResetPaswordDto = { email: newUser.email };
            const { text: message } = await request(app)
                .post('/auth/send-reset')
                .send(dto)
                .expect(200);
        });

        it.skip('should change password', async () => {
            const user = (await userRepo.findByUsername('silam')) as User;

            const token = generateTokenForReset(user);
            const newPassword = 'ehsanhaghshenas';
            const confirmPassword = 'ehsanhaghshenas';

            const item = await request(app)
                .post('/auth/reset-pass/' + token)
                .send({
                    newPassword,
                    confirmPassword,
                })
                .expect(200);
        });
    });
});

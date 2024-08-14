import request from 'supertest';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import { generateTokenForReset, loginTest } from './utility';
import { ResetPaswordDto } from '../../src/modules/Auth/dto/resetpassword-dto';
import { User } from '../../src/modules/User/model/user';
import { UserRepository } from '../../src/modules/User/user.repository';
import { UserEntity } from '../../src/modules/User/entity/user.entity';

describe('CollegeGram Test Suit', () => {
    const userRepo = new UserRepository(AppDataSource);
    // @ts-ignore
    let app: Express;
    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        dataSource.getRepository(UserEntity).delete({});
        app = appFactory(dataSource);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Auth parts', () => {
        const newUser = {
            username: 'silam',
            email: 'canIpetThatdawwwwg@gamil.com',
            password: '1593578426',
            confirmPassword: '1593578426',
        };

        it('sould signup', async () => {
            const { body: user } = await request(app)
                .post('/auth/signup')
                .send(newUser)
                .expect(201);
            console.log(user);
        });

        it('should login', async () => {
            const loggedinUserToken = await loginTest(app, {
                email: newUser.email,
                password: newUser.password,
                rememberMe: false,
            });
            console.log(loggedinUserToken);
        });

        it('should get user informations', async () => {
            const loggedinUserToken = await loginTest(app, {
                email: newUser.email,
                password: newUser.password,
                rememberMe: false,
            });
            console.log(loggedinUserToken);

            const { body: user } = await request(app)
                .get('/user-info')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200);
            console.log(user);
        });

        it('should send reset password email', async () => {
            const dto: ResetPaswordDto = { email: newUser.email };
            const { text: message } = await request(app)
                .post('/auth/send-reset')
                .send(dto)
                .expect(200);
            console.log(message);
        });

        it('should change password', async () => {
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
            console.log(item);
        });
    });
});

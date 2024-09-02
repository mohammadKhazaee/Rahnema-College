import { LoginDto } from '../../src/modules/Auth/dto/logindto';
import request from 'supertest';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import { followReqTest, generateTokenForReset, loginTest, singupTest } from './utility';
import { ResetPaswordDto } from '../../src/modules/Auth/dto/resetpassword-dto';
import { User } from '../../src/modules/User/model/user';
import { UserRepository } from '../../src/modules/User/user.repository';
import { UserEntity } from '../../src/modules/User/entity/user.entity';
import { EditProfileDto } from '../../src/modules/User/dto/edit-profile-dto';
import { SimpleConsoleLogger } from 'typeorm';
import { SignupDto } from '../../src/modules/Auth/dto/signup-dto';

describe('Profile Route Test Suit', () => {
    const userRepo = new UserRepository(AppDataSource);
    // @ts-ignore
    let app: Express;
    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = appFactory(dataSource);
    });

    beforeEach(async () => {
        await AppDataSource.getRepository(UserEntity).delete({});
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('proflile tests', () => {
        const loginUser: LoginDto = {
            username: 'test1245',
            password: 'test1386',
            rememberMe: true,
        };
        it.skip('should follow', async () => {
            const loggedinUserToken = await loginTest(app, loginUser);
            console.log(loggedinUserToken);
            const { body: item } = await request(app)
                .patch('/follow/test1245')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200);
            console.log(item);
        });

        it.skip('should unfallow', async () => {
            const loggedinUserToken = await loginTest(app, loginUser);
            const item = await request(app)
                .patch('/unfollow/ehsAnhAq86')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200);
            console.log(item.body);
        });

        it.skip('should get user info', async () => {
            const user = await request(app).get('/ehsan').expect(200);
            console.log(user.body);
        });

        it.skip('should edit profile', async () => {
            const loggedinUserToken = await loginTest(app, loginUser);
            const editProfile: EditProfileDto = {
                email: 'ehsunhaq86@gmail.com',
                fName: 'احسان',
                lName: 'حق شناس',
                bio: 'داداشت هی رفت بالا هی رفت بالا',
                isPrivate: false,
                password: '123456789',
                confirmPassword: '123456789',
            };
            const user = await request(app)
                .put('/edit-profile')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .send(editProfile);
            console.log(user.body);
        });

        it.skip('should get user followers list', async () => {
            const followers = await request(app).get('/ehsan/followers');
            console.log(followers.body);
        });

        it.skip('should get user followings list', async () => {
            const followings = await request(app).get('/ehsAnhAq86/followings');
            console.log(followings.body);
        });

        it.skip('should block a user', async () => {
            const loggedinUserToken = await loginTest(app, loginUser);
            const blocked = await request(app)
                .post('/ehsAnhAq86/block')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200);
            console.log(blocked.body);
        });

        describe.skip('Follow related routes', () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyUser2: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            let tokenUser1: string, tokenUser2: string;

            beforeEach(async () => {
                await singupTest(app, dummyUser, 201);
                await singupTest(app, dummyUser2, 201);

                tokenUser1 = await loginTest(app, {
                    username: dummyUser.username,
                    password: dummyUser.password,
                    rememberMe: false,
                });

                tokenUser2 = await loginTest(app, {
                    username: dummyUser.username,
                    password: dummyUser.password,
                    rememberMe: false,
                });
            });

            describe('Send follow request', () => {
                it('should create user relation & notif entities', async () => {
                    /**
                        /:username/follow/req
                        /:username/follow/cancel
                        /:username/follow/accept
                    */

                    await followReqTest(app, dummyUser.username, tokenUser2, 200);

                    // expect(comments[0].likeCount).toBe(1);
                    // expect(comments[0].replays[0].likeCount).toBe(1);
                });
            });
        });
    });
});

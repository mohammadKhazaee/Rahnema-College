import { LoginDto } from '../../src/modules/Auth/dto/logindto';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import { acceptFollowTest, blockTest, closeFriendTest, followReqTest, loginTest, removeFriendTest, singupTest } from './utility';
import { UserRepository } from '../../src/modules/User/user.repository';
import { UserEntity } from '../../src/modules/User/entity/user.entity';
import { EditProfileDto } from '../../src/modules/User/dto/edit-profile-dto';
import { SignupDto } from '../../src/modules/Auth/dto/signup-dto';
import { UserRelationEntity } from '../../src/modules/UserRelation/entity/user-relation.entity';
import { PostEntity } from '../../src/modules/Post/entity/post.entity';
import request from 'supertest';

describe('Profile Route Test Suit', () => {
    const userRepo = new UserRepository(AppDataSource);
    // @ts-ignore
    let app: Express;
    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = appFactory(dataSource);
    });

    beforeEach(async () => {
        await AppDataSource.getRepository(UserEntity).delete({})
        await AppDataSource.getRepository(UserRelationEntity).delete({})
        await AppDataSource.getRepository(PostEntity).delete({})
    })

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('proflile tests', () => {
        const loginUser: LoginDto = {
            username: 'test1',
            password: 'test12345678901',
            rememberMe: false,
        };

        it('should follow and then block the follower', async () => {
            const signupUserTest1: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            }

            const signupUserTest2: SignupDto = {
                username: 'test2',
                email: 'testedovom@gamil.com',
                password: 'test12345678902',
                confirmPassword: 'test12345678902',
            }

            await singupTest(app, signupUserTest1, 201)
            await singupTest(app, signupUserTest2, 201)

            const userTest1: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };

            const userTest2: LoginDto = {
                username: 'test2',
                password: 'test12345678902',
                rememberMe: false
            }


            const testYekToken = await loginTest(app, userTest1);
            const testDoToken = await loginTest(app, userTest2)

            const request = await followReqTest(app, 'test2', testYekToken, 200)
            const accept = await acceptFollowTest(app, 'test1', testDoToken, 200)

            const blocked = await blockTest(app, 'test1', testDoToken, 200)
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

        it.skip('should add and remove to close friend', async () => {
            const signupUser = {
                username: 'dummy',
                email: 'dummyUser123@gamil.com',
                password: 'passAlaki1234',
                confirmPassword: 'passAlaki1234',
            }

            const signupUser2 = {
                username: 'dummy22',
                email: 'dummyUser22@gamil.com',
                password: 'passAlaki22',
                confirmPassword: 'passAlaki22',
            }

            await singupTest(app, signupUser2, 201)
            await singupTest(app, signupUser, 201)

            const loginUser: LoginDto = {
                username: 'dummy',
                password: 'passAlaki1234',
                rememberMe: false
            }

            const loginUer22: LoginDto = {
                username: 'dummy22',
                password: 'passAlaki22',
                rememberMe: false
            }

            const dummyLoggedinToken = await loginTest(app, loginUser)
            const dummy22LoggedinToken = await loginTest(app, loginUer22)

            await followReqTest(app, 'dummy22', dummyLoggedinToken, 200)
            await acceptFollowTest(app, 'dummy', dummy22LoggedinToken, 200)
            await closeFriendTest(app, 'dummy', dummy22LoggedinToken, 200)
            await removeFriendTest(app, 'dummy', dummy22LoggedinToken, 200)
        })
    })
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

        describe.skip('Send follow request', () => {
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
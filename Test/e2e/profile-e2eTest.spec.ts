import { LoginDto } from '../../src/modules/Auth/dto/logindto';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import {
    acceptFollowTest,
    blockTest,
    closeFriendListTest,
    closeFriendTest,
    editProfileTest,
    followersListTest,
    followingsListTest,
    followReqTest,
    loginTest,
    removeFriendTest,
    singupTest,
    unfollowTest,
    userInfoTest,
} from './utility';
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
        await AppDataSource.getRepository(UserEntity).delete({});
        await AppDataSource.getRepository(UserRelationEntity).delete({});
        await AppDataSource.getRepository(PostEntity).delete({});
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('proflile tests', () => {
        const loginUser: LoginDto = {
            username: 'test1',
            password: 'test12345678901',
            rememberMe: false,
        };

        it("should follow a user that didn't followed before", async () => {
            const signupUserTest1: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };

            const signupUserTest2: SignupDto = {
                username: 'test2',
                email: 'testedovom@gamil.com',
                password: 'test12345678902',
                confirmPassword: 'test12345678902',
            };

            await singupTest(app, signupUserTest1, 201);
            await singupTest(app, signupUserTest2, 201);

            const userTest1: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };

            const userTest2: LoginDto = {
                username: 'test2',
                password: 'test12345678902',
                rememberMe: false,
            };

            const testYekToken = await loginTest(app, userTest1);
            const testDoToken = await loginTest(app, userTest2);

            const request = await followReqTest(app, 'test2', testYekToken, 200);
            const accept = await acceptFollowTest(app, 'test1', testDoToken, 200);

            // const blocked = await blockTest(app, 'test1', testDoToken, 200)
        });

        it('should unfallow a user that followed before', async () => {
            const signupUserTest1: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };

            const signupUserTest2: SignupDto = {
                username: 'test2',
                email: 'testedovom@gamil.com',
                password: 'test12345678902',
                confirmPassword: 'test12345678902',
            };

            await singupTest(app, signupUserTest1, 201);
            await singupTest(app, signupUserTest2, 201);

            const userTest1: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };

            const userTest2: LoginDto = {
                username: 'test2',
                password: 'test12345678902',
                rememberMe: false,
            };

            const user1Token = await loginTest(app, userTest1);
            const user2Token = await loginTest(app, userTest2);

            await followReqTest(app, 'test2', user1Token, 200);
            await acceptFollowTest(app, 'test1', user2Token, 200);

            const folowersList = await followersListTest(app, 'test2', user2Token, 200);

            const unfallowed = await unfollowTest(app, 'test2', user1Token, 200);
        });

        it('should get user info', async () => {
            const user: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };
            await singupTest(app, user, 201);

            const userTest: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };
            const userToken = await loginTest(app, userTest);
            const infos = await userInfoTest(app, 'test1', userToken, 200);
        });

        it('should edit profile', async () => {
            const user: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };
            await singupTest(app, user, 201);

            const userTest: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };
            const userToken = await loginTest(app, userTest);

            const editedProfile: EditProfileDto = {
                email: 'ehsunhaq86@gmail.com',
                fName: 'احسان',
                lName: 'حق شناس',
                bio: 'داداشت هی رفت بالا هی رفت بالا',
                isPrivate: false,
                password: '123456789',
                confirmPassword: '123456789',
            };

            const edited = await editProfileTest(app, userToken, editedProfile, 200);
        });

        it('should get user followers list', async () => {
            const user: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };

            await singupTest(app, user, 201);

            const userTest: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };
            const userToken = await loginTest(app, userTest);

            const followers = await followersListTest(app, user.username, userToken, 200);
        });

        it('should get user followings list', async () => {
            const user: SignupDto = {
                username: 'test1',
                email: 'testeaval@gamil.com',
                password: 'test12345678901',
                confirmPassword: 'test12345678901',
            };

            await singupTest(app, user, 201);

            const userTest: LoginDto = {
                username: 'test1',
                password: 'test12345678901',
                rememberMe: false,
            };
            const userToken = await loginTest(app, userTest);

            const followings = await followingsListTest(app, user.username, userToken, 200);
        });

        it('should add a follower to close friend', async () => {
            const signupUser = {
                username: 'dummy',
                email: 'dummyUser123@gamil.com',
                password: 'passAlaki1234',
                confirmPassword: 'passAlaki1234',
            };

            const signupUser2 = {
                username: 'dummy22',
                email: 'dummyUser22@gamil.com',
                password: 'passAlaki22',
                confirmPassword: 'passAlaki22',
            };

            await singupTest(app, signupUser2, 201);
            await singupTest(app, signupUser, 201);

            const loginUser: LoginDto = {
                username: 'dummy',
                password: 'passAlaki1234',
                rememberMe: false,
            };

            const loginUer22: LoginDto = {
                username: 'dummy22',
                password: 'passAlaki22',
                rememberMe: false,
            };

            const dummyLoggedinToken = await loginTest(app, loginUser);
            const dummy22LoggedinToken = await loginTest(app, loginUer22);

            await followReqTest(app, 'dummy22', dummyLoggedinToken, 200);
            await acceptFollowTest(app, 'dummy', dummy22LoggedinToken, 200);
            await closeFriendTest(app, 'dummy', dummy22LoggedinToken, 200);
        });
    });

    it('should remove a user from closefriends', async () => {
        const user = {
            username: 'dummy',
            email: 'dummyUser123@gamil.com',
            password: 'passAlaki1234',
            confirmPassword: 'passAlaki1234',
        };

        const user2 = {
            username: 'dummy22',
            email: 'dummyUser22@gamil.com',
            password: 'passAlaki22',
            confirmPassword: 'passAlaki22',
        };

        await singupTest(app, user2, 201);
        await singupTest(app, user, 201);

        const loginUser: LoginDto = {
            username: 'dummy',
            password: 'passAlaki1234',
            rememberMe: false,
        };

        const loginUer2: LoginDto = {
            username: 'dummy22',
            password: 'passAlaki22',
            rememberMe: false,
        };

        const dummyToken = await loginTest(app, loginUser);
        const dummy22Token = await loginTest(app, loginUer2);

        await followReqTest(app, user2.username, dummyToken, 200);
        await acceptFollowTest(app, user.username, dummy22Token, 200);

        await closeFriendTest(app, user.username, dummy22Token, 200);
        await closeFriendListTest(app, dummyToken, 200);
        await removeFriendTest(app, user.username, dummy22Token, 200);
    });

    it('should block a user with no relation from before', async () => {
        const user: SignupDto = {
            username: 'test1',
            email: 'testeaval@gmail.com',
            password: 'test12345678901',
            confirmPassword: 'test12345678901',
        };

        const user2: SignupDto = {
            username: 'test2',
            email: 'testedovom@gmail.com',
            password: 'test12345678902',
            confirmPassword: 'test12345678902',
        };

        await singupTest(app, user, 201);
        await singupTest(app, user2, 201);

        const loginUser: LoginDto = {
            username: 'test1',
            password: 'test12345678901',
            rememberMe: false,
        };

        const loginUser2: LoginDto = {
            username: 'test2',
            password: 'test12345678902',
            rememberMe: false,
        };

        const user2Token = await loginTest(app, loginUser2);
        await blockTest(app, user.username, user2Token, 200);
    });

    it('should follow a user then block the follower', async () => {
        const signupUserTest1: SignupDto = {
            username: 'test1',
            email: 'testeaval@gamil.com',
            password: 'test12345678901',
            confirmPassword: 'test12345678901',
        };

        const signupUserTest2: SignupDto = {
            username: 'test2',
            email: 'testedovom@gamil.com',
            password: 'test12345678902',
            confirmPassword: 'test12345678902',
        };

        await singupTest(app, signupUserTest1, 201);
        await singupTest(app, signupUserTest2, 201);

        const userTest1: LoginDto = {
            username: 'test1',
            password: 'test12345678901',
            rememberMe: false,
        };

        const userTest2: LoginDto = {
            username: 'test2',
            password: 'test12345678902',
            rememberMe: false,
        };

        const testYekToken = await loginTest(app, userTest1);
        const testDoToken = await loginTest(app, userTest2);

        await followReqTest(app, 'test2', testYekToken, 200);
        await acceptFollowTest(app, 'test1', testDoToken, 200);
        await blockTest(app, 'test1', testDoToken, 200);
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

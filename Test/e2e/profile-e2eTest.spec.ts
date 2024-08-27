import { LoginDto } from "../../src/modules/Auth/dto/logindto";
import request from 'supertest';
import { appFactory } from '../../src/api';
import { AppDataSource } from '../../src/data-source';
import { generateTokenForReset, loginTest } from './utility';
import { ResetPaswordDto } from '../../src/modules/Auth/dto/resetpassword-dto';
import { User } from '../../src/modules/User/model/user';
import { UserRepository } from '../../src/modules/User/user.repository';
import { UserEntity } from '../../src/modules/User/entity/user.entity';
import { EditProfileDto } from "../../src/modules/User/dto/edit-profile-dto";
import { SimpleConsoleLogger } from "typeorm";

describe('Profile Route Test Suit', () => {
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
    describe('proflile tests', () => {
        const loginUser: LoginDto = {
            username: 'test1245',
            password: 'teste1245786',
            rememberMe: true
        };
        it.skip('should follow', async () => {
            const loggedinUserToken = await loginTest(app, loginUser)
            console.log(loggedinUserToken)
            const { body: item } = await request(app)
                .patch('/follow/ehsAnhAq86')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200)
            console.log(item)

        })

        it.skip('should unfallow', async () => {
            const loggedinUserToken = await loginTest(app, loginUser)
            const item = await request(app)
                .patch('/unfollow/ehsAnhAq86')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .expect(200)
            console.log(item.body)
        })

        it.skip('should get user info', async () => {
            const user = await request(app)
                .get('/ehsan')
                .expect(200)
            console.log(user.body)
        })

        it.skip('should edit profile', async () => {
            const loggedinUserToken = await loginTest(app, loginUser)
            const editProfile: EditProfileDto = {
                email: 'ehsunhaq86@gmail.com',
                fName: 'احسان',
                lName: 'حق شناس',
                bio: "داداشت هی رفت بالا هی رفت بالا",
                isPrivate: false,
                password: '123456789',
                confirmPassword: '123456789',
            }
            const user = await request(app)
                .put('/edit-profile')
                .set('Authorization', 'Bearer ' + loggedinUserToken)
                .send(editProfile)
            console.log(user.body)
        })

        it.skip('should get user followers list', async () => {
            const followers = await request(app)
                .get('/ehsan/followers')
            console.log(followers.body)
        })

        it.skip('should get user followings list', async () => {
            const followings = await request(app)
                .get('/ehsAnhAq86/followings')
            console.log(followings.body)
        })

    })
})
import request from 'supertest'
import { appFactory } from '../../src/api'
import { AppDataSource } from "../../src/data-source"
import { generateTokenForReset, loginTest } from './utility'
import { ResetPaswordDto } from '../../src/modules/Auth/dto/resetpassword-dto'
import { User } from '../../src/modules/User/model/user'
import { UserRepository } from '../../src/modules/User/user.repository'

describe('CollegeGram Test Suit', () => {
    const userRepo = new UserRepository(AppDataSource)
    // @ts-ignore 
    let app: Express;
    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = appFactory(dataSource);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });
    describe("Auth parts", () => {
        it.skip("sould signup", async () => {
            const newUser = {
                username: "silam",
                email: "chizmoheministTeste@gamil.com",
                password: "mirzakoochakKhan2826",
                confirmPassword: "mirzakoochakKhan2826"
            }
            const { body: user } = await request(app)
                .post('/auth/signup')
                .send(newUser)
                .expect(201)
            console.log(user)
        })

        it.skip("should login", async () => {
            const loggedinUserToken = await loginTest(app, {
                email: 'canIpetThatdawwwwg@gamil.com',
                password: "1593578426",
                rememberMe: false
            })
            console.log(loggedinUserToken)
        })

        it.skip("should get user informations", async () => {
            const loggedinUserToken = await loginTest(app, {
                email: 'canIpetThatdawwwwg@gamil.com',
                password: "1593578426",
                rememberMe: false
            })
            console.log(loggedinUserToken)

            const { body: user } = await request(app)
                .get('/auth/user-info')
                .set("Authorization", 'Bearer ' + loggedinUserToken)
                .send('dawwwgg')
                .expect(200)
            console.log(user)
        })

        it.skip("should send reset password email", async () => {
            const dto: ResetPaswordDto = { email: 'ehsunhagh86@gmail.com' }
            const { text: message } = await request(app)
                .post('/auth/send-reset')
                .send(dto)
                .expect(200)
            console.log(message)
        })


        it("should change password", async () => {
            const user = await userRepo.findByUsername('dawwwgg') as User

            // const token = "sagjassniashdfasufwebscnbvasnfbfleopwperawbabvsfa7rg5a618asdc6SDC"
            const token = generateTokenForReset(user)
            const newPassword = 'ehsanhaghshenas'
            const confirmPassword = 'ehsanhaghshenas'


            const item = await request(app)
                .post('/auth/reset-pass/' + token)
                .send({
                    newPassword,
                    confirmPassword
                })
                .expect(200)
            console.log(item)

        })
    })
})

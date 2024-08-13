import { LoginDto } from "../../src/modules/Auth/dto/logindto"
import request from "supertest"
import { User } from "../../src/modules/User/model/user"
import jwt from "jsonwebtoken"
//@ts-ignore
export const loginTest = async (app: Express, dto: LoginDto) => {
    const { body: userToken } = await request(app)
        .post("/auth/login")
        .send(dto)
        .expect(200)
    return userToken.token
}

export const generateTokenForReset = (user: User) => {
    return jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
    });
}
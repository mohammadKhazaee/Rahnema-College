import * as path from 'path';

import { LoginDto } from '../../src/modules/Auth/dto/logindto';
import request from 'supertest';
import { User } from '../../src/modules/User/model/user';
import jwt from 'jsonwebtoken';
import { SignupDto } from '../../src/modules/Auth/dto/signup-dto';
import { CreatePostDto } from '../../src/modules/Post/dto/create-post-dto';
import { CreateCommentDto } from '../../src/modules/Post/dto/create-comment.dto';

export const singupTest = async (
    //@ts-ignore
    app: Express,
    dto: SignupDto,
    statusCode: number
) => {
    await request(app).post('/auth/signup').send(dto).expect(statusCode);
};

//@ts-ignore
export const loginTest = async (app: Express, dto: LoginDto) => {
    const { body: userToken } = await request(app)
        .post('/auth/login')
        .send(dto)
        .expect(200);
    return userToken.token;
};

export const createPostTest = async (
    //@ts-ignore
    app: Express,
    dto: CreatePostDto,
    jwt: string,
    statusCode: number
) => {
    const partialRequest = request(app)
        .post('/posts')
        .set('Authorization', 'Bearer ' + jwt)
        .field('caption', dto.caption)
        .attach('images', path.resolve(__dirname, '../files/test_image.png'))
        .attach(
            'images',
            path.resolve(__dirname, '../', 'files', 'test_image3.png')
        );
    for (let i = 0; i < dto.mentions.length; i++) {
        partialRequest.field(`mentions[${i}]`, dto.mentions[i]);
    }
    const { body: result } = await partialRequest.expect(statusCode);

    return result;
};

export const createCommentTest = async (
    //@ts-ignore
    app: Express,
    dto: CreateCommentDto,
    jwt: string,
    statusCode: number
) => {
    const { body: createdComment } = await request(app)
        .post('/posts/' + dto.postId + '/comments')
        .set('Authorization', 'Bearer ' + jwt)
        .send(dto)
        .expect(statusCode);

    return createdComment;
};

export const generateTokenForReset = (user: User) => {
    return jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
    });
};

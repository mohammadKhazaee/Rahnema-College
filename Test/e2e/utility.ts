import * as path from 'path';
import { LoginDto } from '../../src/modules/Auth/dto/logindto';
import request from 'supertest';
import { User } from '../../src/modules/User/model/user';
import jwt from 'jsonwebtoken';
import { SignupDto } from '../../src/modules/Auth/dto/signup-dto';
import { CreatePostDto } from '../../src/modules/Post/dto/create-post-dto';
import { CreateCommentDto } from '../../src/modules/Post/dto/create-comment.dto';
import { appFactory } from '../../src/api';
import { EditProfileDto } from '../../src/modules/User/dto/edit-profile-dto';

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
    const { body: userToken } = await request(app).post('/auth/login').send(dto).expect(200);
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
        .attach('images', path.resolve(__dirname, '../', 'files', 'test_image3.png'));
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

export const followReqTest = (
    //@ts-ignore
    app: Express,
    followedId: string,
    followerToken: string,
    statusCode: number
) => {
    return request(app)
        .post(`/user-relations/follow/${followedId}/req`)
        .set('Authorization', 'Bearer ' + followerToken)
        .expect(statusCode);
};

export const closeFriendTest = async (
    //@ts-ignore
    app: Express,
    followerId: string,
    closeFriendToken: string,
    statusCode: number
) => {
    const closeFriend = await request(app)
        .post(`/user-relations/friends/${followerId}`)
        .set('Authorization', 'Bearer ' + closeFriendToken)
        .expect(statusCode);
    return closeFriend;
};

export const removeFriendTest = async (
    //@ts-ignore
    app: Express,
    friendName: string,
    userToken: string,
    statusCode: number
) => {
    const removed = await request(app)
        .delete(`/user-relations/friends/${friendName}`)
        .set('Authorization', 'Bearer ' + userToken)
        .expect(statusCode);
    return removed;
};

export const acceptFollowTest = async (
    //@ts-ignore
    app: Express,
    followerName: string,
    userToken: string,
    statusCode: number
) => {
    const accepted = await request(app)
        .post(`/user-relations/follow/${followerName}`)
        .set('Authorization', 'Bearer ' + userToken)
        .expect(statusCode);
    return accepted;
};

export const blockTest = async (
    //@ts-ignore
    app: Express,
    blockedId: string,
    currentUserToken: string,
    statusCode: number
) => {
    const blocked = await request(app)
        .post(`/user-relations/blocks/${blockedId}`)
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return blocked;
};

export const followersListTest = async (
    //@ts-ignore
    app: Express,
    username: string,
    currentUserToken: string,
    statusCode: number
) => {
    const followersList = await request(app)
        .get(`/user-relations/followers/${username}`)
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return followersList;
};

export const followingsListTest = async (
    //@ts-ignore
    app: Express,
    username: string,
    currentUserToken: string,
    statusCode: number
) => {
    const followingsList = await request(app)
        .get(`/user-relations/followings/${username}`)
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return followingsList;
};

export const unfollowTest = async (
    //@ts-ignore
    app: Express,
    username: string,
    currentUserToken: string,
    statusCode: number
) => {
    const unfollowed = await request(app)
        .delete(`/user-relations/followings/${username}`)
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return unfollowed;
};

export const userInfoTest = async (
    //@ts-ignore
    app: Express,
    username: string,
    currentUserToken: string,
    statusCode: number
) => {
    const userInfos = await request(app)
        .get(`/dashboard/profile-info/${username}`)
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return userInfos;
};

export const editProfileTest = async (
    //@ts-ignore
    app: Express,
    currentUserToken: string,
    editDto: EditProfileDto,
    statusCode: number
) => {
    const edited = await request(app)
        .put('/dashboard/edit-profile')
        .set('Authorization', 'Bearer ' + currentUserToken)
        .send(editDto)
        .expect(statusCode);
    return edited;
};

export const closeFriendListTest = async (
    //@ts-ignore
    app: Express,
    currentUserToken: string,
    statusCode: number
) => {
    const friendsList = await request(app)
        .get('/user-relations/friends')
        .set('Authorization', 'Bearer ' + currentUserToken)
        .expect(statusCode);
    return friendsList;
};

export const generateTokenForReset = (user: User) => {
    return jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
    });
};

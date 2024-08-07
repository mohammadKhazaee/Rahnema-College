import { Repository, DataSource } from 'typeorm';
import { User } from '../User/model/user';
import { sign } from 'jsonwebtoken';
import Jwt from 'jsonwebtoken';
import { ResetPaswordDto } from './dto/resetpassword-dto';
const { OAuth2 } = require('googleapis').auth;
import nodemailer from "nodemailer";
import { HttpError } from '../../utility/errors';
import { z } from 'zod';

const oauth2Client = new OAuth2(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token: 'YOUR_REFRESH_TOKEN' });


export class AuthRepository {
    private userRepo: Repository<any>;

    constructor(dataSource: DataSource) {
        this.userRepo = dataSource.getRepository({} as any);
    }

    public generateTokenForLogin(user: User, rememberMe?: boolean) {
        const expiresIn = rememberMe ? '30d' : '1w';
        const secret = 'Rebuilders';
        const payload = { username: user.username, email: user.email };
        return sign(payload, secret, { expiresIn });
    }


    public generateTokenForReset(user: User) {
        const secretKey = 'randomsecretkeydorresetpass1593574862'
        return Jwt.sign({ email: user.email }, secretKey, { expiresIn: '24h' })
    }
}

import { Repository, DataSource } from 'typeorm';
import { User } from '../User/model/user';
import { sign } from 'jsonwebtoken';
import Jwt from 'jsonwebtoken';

export class AuthRepository {
    private userRepo: Repository<any>;

    constructor(dataSource: DataSource) {
        this.userRepo = dataSource.getRepository({} as any);
    }

    public generateTokenForLogin(user: User, rememberMe?: boolean) {
        const expiresIn = rememberMe ? '30d' : '1w';
        const payload = { username: user.username, email: user.email };
        return sign(payload, process.env.JWT_SECRET!, { expiresIn });
    }

    public generateTokenForReset(user: User) {
        return Jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '24h',
        });
    }
}

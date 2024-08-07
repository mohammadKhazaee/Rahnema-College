import { Repository, DataSource } from 'typeorm';
import { User } from '../User/model/user';
import { sign } from 'jsonwebtoken';

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
}

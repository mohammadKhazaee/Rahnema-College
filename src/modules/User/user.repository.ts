import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { User } from './model/user';

export class UserRepository {
    private userRepo: Repository<UserEntity>;

    constructor(dataSource: DataSource) {
        this.userRepo = dataSource.getRepository(UserEntity);
    }

    findOne(username: string): Promise<User | null> {
        return this.userRepo.findOneBy({ username });
    }

    findById(id: string): Promise<User | null> {
        return this.userRepo.findOneBy({ id });
    }
}

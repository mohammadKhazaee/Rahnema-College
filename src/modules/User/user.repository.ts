import { DataSource, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { User } from './model/user';
import { UpdateUser } from './model/update-user';

export class UserRepository {
    private userRepo: Repository<UserEntity>;

    constructor(dataSource: DataSource) {
        this.userRepo = dataSource.getRepository(UserEntity);
    }

    findByUsername(username: string): Promise<User | null> {
        return this.userRepo.findOneBy({ username });
    }

    findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOneBy({ email });
    }

    create(user: User): Promise<User> {
        return this.userRepo.save(user);
    }

    upadte(user: UpdateUser): Promise<User> {
        return this.userRepo.save(user);
    }
}

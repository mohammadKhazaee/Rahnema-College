import { DataSource, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { User, UpdateUser, UserSearchResult } from './model/user';

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
    async searchUsers(
        query: string,
        currentUserId: string,
        page: number,
        count: number
    ): Promise<UserEntity[]> {
        const lowerQuery = query.toLowerCase();
        return this.userRepo
            .createQueryBuilder('user')
            .where(
                'LOWER(user.fName) LIKE :query OR LOWER(user.lName) LIKE :query OR LOWER(user.username) LIKE :query',
                { query: `%${lowerQuery}%` }
            )
            .andWhere('user.username != :currentUserId', { currentUserId })
            .select(['user.username', 'user.imageUrl', 'user.fName', 'user.lName'])
            .skip((page - 1) * count)
            .take(count)
            .getMany();
    }
}

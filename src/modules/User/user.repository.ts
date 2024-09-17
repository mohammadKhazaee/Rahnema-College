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
        currentUsername: string,
        page: number,
        count: number
    ): Promise<{ entities: UserEntity[]; raw: any[] }> {
        const lowerQuery = query.toLowerCase();
        const allMatchingUsers = await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect(
                'user.followers',
                'followers',
                'followers.status IN (:...followStatuses)'
            )
            .leftJoinAndSelect(
                'user.followers',
                'blockers',
                'blockers.status = :blockedStatus AND blockers.followerId = :currentUsername'
            )
            .where(
                '(LOWER(user.fName) LIKE :query OR LOWER(user.lName) LIKE :query OR LOWER(user.username) LIKE :query)',
                { query: `%${lowerQuery}%` }
            )
            .andWhere('user.username != :currentUsername')
            .andWhere('blockers.followerId IS NULL')
            .select(['user.username', 'user.imageUrl', 'user.fName', 'user.lName'])
            .addSelect(
                'COUNT(DISTINCT CASE WHEN followers.status IN (:...followStatuses) THEN followers.followerId END)',
                'followersCount'
            )
            .setParameter('followStatuses', ['follow', 'friend'])
            .setParameter('blockedStatus', 'blocked')
            .setParameter('currentUsername', currentUsername)
            .setParameter('query', `%${lowerQuery}%`)
            .groupBy('user.username')
            .orderBy('followersCount', 'DESC')
            .getRawAndEntities();

        const startIndex = (page - 1) * count;
        const paginatedEntities = allMatchingUsers.entities.slice(startIndex, startIndex + count);
        const paginatedRaw = allMatchingUsers.raw.slice(startIndex, startIndex + count);

        return {
            entities: paginatedEntities,
            raw: paginatedRaw,
        };
    }
}

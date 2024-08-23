import { DataSource, Repository } from 'typeorm';
import { FollowingEntity } from './entity/following.entity';
import { FindFollowing } from './model/follow';

export class FollowRepository {
    private followRepo: Repository<FollowingEntity>;

    constructor(dataSource: DataSource) {
        this.followRepo = dataSource.getRepository(FollowingEntity);
    }

    create(following: FindFollowing) {
        return this.followRepo.save(following);
    }

    delete({ followedId, followerId }: FindFollowing) {
        return this.followRepo.delete({ followedId, followerId });
    }

    followersCount(username: string) {
        return this.followRepo.count({ where: { followedId: username } });
    }

    followingsCount(username: string) {
        return this.followRepo.count({ where: { followerId: username } });
    }

    fetchFollowing({ followedId, followerId }: FindFollowing) {
        return this.followRepo.findOne({ where: { followerId, followedId } });
    }

    getFollowers(username: string, count: number, skipCount: number) {
        return this.followRepo.find({
            select: {
                followed: {},
                follower: { username: true, imageUrl: true },
            },
            where: { followedId: username },
            take: count,
            skip: skipCount,
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }

    getFollowings(username: string, count: number, skipCount: number) {
        return this.followRepo.find({
            select: {
                followed: { username: true, imageUrl: true },
                follower: {},
            },
            where: { followerId: username },
            take: count,
            skip: skipCount,
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }
}

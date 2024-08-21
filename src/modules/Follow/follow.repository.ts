import { DataSource, Repository } from "typeorm";
import { FollowingEntity } from "./entity/following.entity";
import { Following } from "./model/follow";
import { User } from "../User/model/user";

export class FollowRepository {
    private followRepo: Repository<FollowingEntity>;

    constructor(dataSource: DataSource) {
        this.followRepo = dataSource.getRepository(FollowingEntity);
    }


    create(following: Following) {
        return this.followRepo.save(following)
    }


    delete(following: Following) {
        return this.followRepo.delete({
            followedId: following.followedId,
            followerId: following.followerId,
        })
    }


    followersCount(username: string) {
        return this.followRepo.count({ where: { followedId: username, } })
    }

    followingsCount(username: string) {
        return this.followRepo.count({ where: { followerId: username } })
    }

    fetchFollowing(following: Following) {
        return this.followRepo.findOne({ where: { followerId: following.followerId, followedId: following.followedId, }, });
    }

}
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { UserRelationEntity } from './entity/user-relation.entity';
import {
    CreateUserRelation,
    FindUserRelation,
    UserRelation,
    UserRelationId,
    UserRelationStatus,
} from './model/user-relation';
import { FollowNotifEntity } from '../Notification/entity/follow-notif.entity';
import { NotificationEntity } from '../Notification/entity/notification.entity';

export class UserRelationRepository {
    private followRepo: Repository<UserRelationEntity>;

    constructor(private dataSource: DataSource) {
        this.followRepo = this.dataSource.getRepository(UserRelationEntity);
    }

    create(createRelationData: CreateUserRelation) {
        return this.followRepo.save(createRelationData);
    }

    createEntity(createRelationData: CreateUserRelation) {
        return this.followRepo.create(createRelationData);
    }

    upadte({ followedId, followerId }: UserRelationId) {
        return this.followRepo.save({ followedId, followerId });
    }

    delete({ followedId, followerId }: UserRelationId) {
        return this.followRepo.delete({ followedId, followerId });
    }

    createFollowRequest(relation: UserRelationEntity): Promise<void> {
        return this.dataSource.transaction(async (entityManager) => {
            // insert follow request relation
            await entityManager.insert(UserRelationEntity, relation);

            // save base notif record
            const createdNotif = await entityManager.save(NotificationEntity, {
                type: 'incommingReq',
                emiterId: relation.followerId,
            });

            // save follow notif
            await entityManager.save(FollowNotifEntity, {
                notifId: createdNotif.notifId,
                followId: relation.relationId,
            });
        });
    }

    acceptRequestedFollow(relation: UserRelationEntity): Promise<void> {
        return this.dataSource.transaction(async (entityManager) => {
            const followNotif = await entityManager.findOneBy(FollowNotifEntity, {
                followId: relation.relationId,
            });
            if (!followNotif) throw new Error();

            // update relation status to follow
            await entityManager.update(UserRelationEntity, relation.relationId, {
                status: 'follow',
            });

            // notif follow entity
            // await entityManager.update(FollowNotifEntity, relation);

            // delete base notif entity
            await entityManager.update(NotificationEntity, followNotif.notifId, {
                type: 'acceptedFollow',
                emiterId: relation.followedId,
            });
        });
    }

    deleteRequestedFollow(relation: UserRelationEntity): Promise<void> {
        return this.dataSource.transaction(async (entityManager) => {
            const deletedFollowNotif = await entityManager.findOneBy(FollowNotifEntity, {
                followId: relation.relationId,
            });
            if (!deletedFollowNotif) throw new Error();

            // delete pending follow & notif follow entity with cascade
            await entityManager.remove(UserRelationEntity, relation);

            // delete base notif entity
            entityManager.delete(NotificationEntity, deletedFollowNotif.notifId);
        });
    }

    followersCount(username: string) {
        return this.followRepo.count({
            where: { followedId: username, status: 'follow' },
        });
    }

    followingsCount(username: string) {
        return this.followRepo.count({
            where: { followerId: username, status: 'follow' },
        });
    }

    fetchRelation({ followedId, followerId, status = [] }: FindUserRelation) {
        const where: FindOptionsWhere<UserRelationEntity> = {
            followedId,
            followerId,
        };
        if (status.length > 0) where.status = In(status);

        return this.followRepo.findOne({ where });
    }

    async doesRelationExist({ followedId, followerId, status = [] }: FindUserRelation) {
        const where: FindOptionsWhere<UserRelationEntity> = {
            followedId,
            followerId,
        };
        if (status.length > 0) where.status = In(status);

        const count = await this.followRepo.count({ where });
        return count > 0;
    }

    getFollowers(username: string, count: number, skipCount: number) {
        return this.followRepo.find({
            select: {
                followed: {},
                follower: { imageUrl: true },
            },
            where: { followedId: username, status: 'follow' },
            take: count,
            skip: skipCount,
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }

    getFollowings(username: string, count: number, skipCount: number) {
        return this.followRepo.find({
            select: {
                followed: { imageUrl: true },
                follower: {},
            },
            where: { followerId: username, status: 'follow' },
            take: count,
            skip: skipCount,
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }

    updateRelationStatus(followerId: string, followedId: string, status: UserRelationStatus) {
        return this.followRepo.update({ followerId, followedId }, { status });
    }
    getCloseFriends(username: string) {
        return this.followRepo.find({
            select: {
                followed: { imageUrl: true },
                follower: {},
            },
            where: { followerId: username, status: 'friend' },
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }
}

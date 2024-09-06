import { DataSource, EntityManager, FindOptionsWhere, In, Repository } from 'typeorm';
import { UserRelationEntity } from './entity/user-relation.entity';
import {
    CreateUserRelation,
    FindUserRelation,
    UserRelationId,
    UserRelationStatus,
} from './model/user-relation';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { CreateFriendFollowNotif } from '../Notification/model/friend-notifs';
import { RelationNotifEntity } from '../Notification/entity/relation-notif.entity';

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

            // save notif record
            await entityManager.save(NotificationEntity, {
                type: 'incommingReq',
                emiterId: relation.followerId,
                receiverId: relation.followedId,
            });
        });
    }

    acceptRequestedFollow(relation: UserRelationEntity): Promise<void> {
        return this.dataSource.transaction(async (entityManager) => {
            // update relation status to follow
            await entityManager.update(UserRelationEntity, relation.relationId, {
                status: 'follow',
            });

            const notifEntity = await entityManager.findOneBy(NotificationEntity, {
                emiterId: relation.followerId,
                receiverId: relation.followedId,
            });
            if (!notifEntity) throw new Error();

            // upadte notif entity for follower
            await entityManager.update(NotificationEntity, notifEntity.notifId, {
                type: 'acceptedFollow',
                emiterId: relation.followedId,
                receiverId: relation.followerId,
            });

            // create notif entity for user
            await entityManager.save(NotificationEntity, {
                type: 'followedBy',
                emiterId: relation.followerId,
                receiverId: relation.followedId,
            });

            // create follow notif for close friends
            const createFriendsNotifs = await this.makeCreateFriendFollow(
                entityManager,
                relation.followerId
            );

            const createdNotifs = await entityManager.save(NotificationEntity, createFriendsNotifs);

            // save relation notif
            await entityManager.save(
                RelationNotifEntity,
                createdNotifs.map((n) => ({
                    notifId: n.notifId,
                    relationId: relation.relationId,
                }))
            );
        });
    }

    private async makeCreateFriendFollow(
        entityManager: EntityManager,
        followedId: string
    ): Promise<CreateFriendFollowNotif[]> {
        const friends = await entityManager.findBy(UserRelationEntity, {
            followedId,
            status: 'friend',
        });

        return friends.map((f) => ({
            type: 'friendFollow',
            emiterId: followedId,
            receiverId: f.followerId,
        }));
    }

    deleteRequestedFollow(relation: UserRelationEntity): Promise<void> {
        return this.dataSource.transaction(async (entityManager) => {
            // delete pending follow & notif follow entity with cascade
            await entityManager.remove(UserRelationEntity, relation);

            const targetedNotif = await entityManager.findOneBy(NotificationEntity, {
                emiterId: relation.followerId,
                receiverId: relation.followedId,
            });
            if (!targetedNotif) throw new Error();

            // delete notif entity
            entityManager.delete(NotificationEntity, targetedNotif.notifId);
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
                follower: { imageUrl: true, fName: true, lName: true },
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
                followed: { imageUrl: true, fName: true, lName: true },
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
                followed: { imageUrl: true, fName: true, lName: true },
                follower: {},
            },
            where: { followerId: username, status: 'friend' },
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }

    getBlocks(username: string) {
        return this.followRepo.find({
            select: {
                followed: { imageUrl: true, fName: true, lName: true },
                follower: {},
            },
            where: { followerId: username, status: 'blocked' },
            order: { createdAt: 'DESC' },
            relations: ['followed', 'follower'],
        });
    }
}

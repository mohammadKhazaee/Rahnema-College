import { PaginationDto } from '../Post/dto/get-posts-dto';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { NotificationEntity } from './entity/notification.entity';
import {
    AcceptedFollowNotif,
    FollowedByNotif,
    GetNotifDao,
    IncommingReqNotif,
    LikeNotif,
    MentionNotif,
} from './model/notifications';
import { NotifRepository } from './notif.repository';
import { PostNotifRepository } from './post-notif.repository';

export class NotifService {
    constructor(
        private notifRepo: NotifRepository,
        private postNotifRepo: PostNotifRepository,
        private userRelationRepo: UserRelationService
    ) {}

    async followingList(username: string, paginationDto: PaginationDto) {
        const notifs = await this.notifRepo.notifList(username, paginationDto);

        // change isSeen for listed notifs
        await this.notifRepo.updateBulk(notifs);

        return Promise.all(notifs.map(this.notifTransformer));
    }

    private notifTransformer = async (notifEntity: NotificationEntity): Promise<GetNotifDao> => {
        switch (notifEntity.type) {
            case 'acceptedFollow':
                return this.transformAcceptedFollow(notifEntity);
            case 'incommingReq':
                return this.transformIncommingReq(notifEntity);
            case 'followedBy':
                return this.transformFollowedBy(notifEntity);
            case 'mention':
                return await this.transformMention(notifEntity);
            case 'like':
                return await this.transformLike(notifEntity);
        }
    };

    private transformAcceptedFollow(notifEntity: NotificationEntity): AcceptedFollowNotif {
        return {
            type: 'accepedFollow',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.updatedAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
        };
    }

    private transformIncommingReq(notifEntity: NotificationEntity): IncommingReqNotif {
        return {
            type: 'incommingReq',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.updatedAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
        };
    }

    private async transformFollowedBy(notifEntity: NotificationEntity): Promise<FollowedByNotif> {
        return {
            type: 'followedBy',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.updatedAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            followState: await this.userRelationRepo.fetchRelationStatus({
                followerId: notifEntity.receiverId,
                followedId: notifEntity.emiterId,
            }),
        };
    }

    private async transformMention(notifEntity: NotificationEntity): Promise<MentionNotif> {
        const mentionedPost = await this.postNotifRepo.findOneByNotifId(notifEntity.notifId);
        if (!mentionedPost) throw new Error();

        return {
            type: 'mention',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.updatedAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            post: {
                postId: mentionedPost.postId,
                imageUrl: mentionedPost.post.images[0].url,
            },
        };
    }

    private async transformLike(notifEntity: NotificationEntity): Promise<LikeNotif> {
        const mentionedPost = await this.postNotifRepo.findOneByNotifId(notifEntity.notifId);
        if (!mentionedPost) throw new Error();

        return {
            type: 'like',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.updatedAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            post: {
                postId: mentionedPost.postId,
                imageUrl: mentionedPost.post.images[0].url,
            },
        };
    }
}

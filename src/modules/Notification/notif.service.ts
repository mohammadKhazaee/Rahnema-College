import { PaginationDto } from '../Common/dto/pagination-dto';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { CommentNotifRepository } from './comment-notif.repository';
import { RelationNotifRepository } from './follow-notif.repository';
import {
    CommentNotif,
    FollowNotif,
    FriendLikeNotif,
    FriendNotifEntity,
    GetFriendNotifDao,
} from './model/friend-notifs';
import {
    AcceptedFollowNotif,
    FollowedByNotif,
    GetNotifDao,
    IncommingReqNotif,
    LikeNotif,
    MentionNotif,
    NormalNotifEntity,
} from './model/notifications';
import { NotifRepository } from './notif.repository';
import { PostNotifRepository } from './post-notif.repository';

export class NotifService {
    constructor(
        private notifRepo: NotifRepository,
        private postNotifRepo: PostNotifRepository,
        private commentNotifRepo: CommentNotifRepository,
        private relationNotifRepo: RelationNotifRepository,
        private userRelationRepo: UserRelationService
    ) {}

    async followingList(username: string, { p: page, c: take }: PaginationDto) {
        const skip = (page - 1) * take;
        const notifs = await this.notifRepo.notifList(username, { take, skip });

        // change isSeen for listed notifs
        await this.notifRepo.updateBulk(notifs);

        return Promise.all(notifs.map(this.notifTransformer));
    }

    async friendList(username: string, { p: page, c: take }: PaginationDto) {
        const skip = (page - 1) * take;
        const notifs = await this.notifRepo.friendNotifList(username, { take, skip });

        // change isSeen for listed notifs
        await this.notifRepo.updateBulk(notifs);

        return Promise.all(notifs.map(this.friendNotifTransformer));
    }

    private friendNotifTransformer = async (
        notifEntity: FriendNotifEntity
    ): Promise<GetFriendNotifDao> => {
        switch (notifEntity.type) {
            case 'friendComment':
                return this.transformFriendComment(notifEntity);
            case 'friendLike':
                return this.transformFriendLike(notifEntity);
            case 'friendFollow':
                return this.transformFriendFollow(notifEntity);
        }
    };

    private async transformFriendLike(notifEntity: FriendNotifEntity): Promise<FriendLikeNotif> {
        const postNotifEntity = await this.postNotifRepo.findOneByNotifId(notifEntity.notifId);
        if (!postNotifEntity) throw new Error('');

        return {
            type: 'like',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            postId: postNotifEntity.postId,
        };
    }

    private async transformFriendComment(notifEntity: FriendNotifEntity): Promise<CommentNotif> {
        const commentNotifEntity = await this.commentNotifRepo.findOneByNotifId(
            notifEntity.notifId
        );
        if (!commentNotifEntity) throw new Error('');

        return {
            type: 'comment',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            post: {
                postId: commentNotifEntity.comment.postId,
                imageUrl: commentNotifEntity.comment.post.images[0].url,
                commentContent: commentNotifEntity.comment.content,
            },
        };
    }

    private async transformFriendFollow(notifEntity: FriendNotifEntity): Promise<FollowNotif> {
        const relationNotifEntity = await this.relationNotifRepo.findOneByNotifId(
            notifEntity.notifId
        );
        if (!relationNotifEntity) throw new Error('');

        return {
            type: 'follow',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
            friendUser: {
                username: relationNotifEntity.relation.followedId,
                fName: relationNotifEntity.relation.followed.fName,
                lName: relationNotifEntity.relation.followed.lName,
            },
            followState: await this.userRelationRepo.fetchRelationStatus({
                followerId: notifEntity.receiverId,
                followedId: relationNotifEntity.relation.followedId,
            }),
        };
    }

    private notifTransformer = async (notifEntity: NormalNotifEntity): Promise<GetNotifDao> => {
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

    private transformAcceptedFollow(notifEntity: NormalNotifEntity): AcceptedFollowNotif {
        return {
            type: 'accepedFollow',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
        };
    }

    private transformIncommingReq(notifEntity: NormalNotifEntity): IncommingReqNotif {
        return {
            type: 'incommingReq',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
            user: {
                username: notifEntity.emiterId,
                fName: notifEntity.emiter.fName,
                lName: notifEntity.emiter.lName,
                imageUrl: notifEntity.emiter.imageUrl,
            },
        };
    }

    private async transformFollowedBy(notifEntity: NormalNotifEntity): Promise<FollowedByNotif> {
        return {
            type: 'followedBy',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
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

    private async transformMention(notifEntity: NormalNotifEntity): Promise<MentionNotif> {
        const mentionedPost = await this.postNotifRepo.findOneByNotifId(notifEntity.notifId);
        if (!mentionedPost) throw new Error();

        return {
            type: 'mention',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
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

    private async transformLike(notifEntity: NormalNotifEntity): Promise<LikeNotif> {
        const mentionedPost = await this.postNotifRepo.findOneByNotifId(notifEntity.notifId);
        if (!mentionedPost) throw new Error();

        return {
            type: 'like',
            isSeen: notifEntity.isSeen,
            createdAt: notifEntity.createdAt,
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

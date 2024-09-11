import { Repository, DataSource, IsNull, EntityManager } from 'typeorm';
import { PostCommentEntity } from './entity/post-comment.entity';
import { CreatePostComment, PostCommentWithReplays } from './model/post-comment';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { UserRelationEntity } from '../UserRelation/entity/user-relation.entity';
import { CreateFriendCommentNotif } from '../Notification/model/friend-notifs';
import { CommentNotifEntity } from '../Notification/entity/comment-notif.entity';

export class PostCommentRepository {
    private commentRepo: Repository<PostCommentEntity>;

    constructor(private dataSource: DataSource) {
        this.commentRepo = dataSource.getRepository(PostCommentEntity);
    }

    findCommentById(commentId: string): Promise<PostCommentEntity | null> {
        return this.commentRepo.findOne({
            where: { commentId },
            relations: { commenter: true, post: { creator: true } },
        });
    }

    getComments(postId: string, take: number, skip: number): Promise<PostCommentEntity[]> {
        return this.commentRepo.find({
            where: { postId, parentId: IsNull() },
            take,
            skip,
            relations: {
                commenter: true,
                replays: {
                    commenter: true,
                },
            },
            order: { createdAt: 'ASC' },
        });
    }

    async doesCommentExist(commentId: string): Promise<boolean> {
        const commentCount = await this.commentRepo.countBy({ commentId });
        return commentCount > 0;
    }

    save(commentData: CreatePostComment): Promise<PostCommentWithReplays> {
        const createdComment = this.commentRepo.create(commentData);
        return this.dataSource.transaction(async (entityManager) => {
            // save comment record
            await entityManager.insert(PostCommentEntity, createdComment);

            // save base notif
            const createFriendNotif = await this.makeCreateFriendComment(
                entityManager,
                commentData.commenterId
            );
            const createdNotif = await entityManager.save(NotificationEntity, createFriendNotif);

            // save comment notif
            await entityManager.save(
                CommentNotifEntity,
                createdNotif.map((n) => ({
                    notifId: n.notifId,
                    commentId: createdComment.commentId,
                }))
            );

            return createdComment;
        });
    }

    private async makeCreateFriendComment(
        entityManager: EntityManager,
        followedId: string
    ): Promise<CreateFriendCommentNotif[]> {
        const friends = await entityManager.findBy(UserRelationEntity, {
            followedId,
            status: 'friend',
        });

        return friends.map((f) => ({
            type: 'friendComment',
            emiterId: followedId,
            receiverId: f.followerId,
        }));
    }

    countCommentsForPost(postId: string): Promise<number> {
        return this.commentRepo.countBy({ postId });
    }
}

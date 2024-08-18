import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { PostCommentEntity } from './post-comment.entity';

@Entity('comment_likes')
export class CommentLikeEntity {
    @PrimaryColumn()
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.likes)
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @PrimaryColumn()
    commentId!: string;

    @ManyToOne(() => PostCommentEntity, (comment) => comment.likes)
    @JoinColumn({ name: 'commentId' })
    comment!: PostCommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

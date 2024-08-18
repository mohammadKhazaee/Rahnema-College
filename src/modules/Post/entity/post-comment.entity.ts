import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../User/entity/user.entity';
import { CommentLikeEntity } from './comment-Likes.entity';

@Entity('post_comments')
export class PostCommentEntity {
    @PrimaryColumn('uuid')
    commentId!: string;

    @Column()
    content!: string;

    @Column()
    commenterId!: string;

    @ManyToOne(() => UserEntity, (commenter) => commenter.comments)
    @JoinColumn({ name: 'commenterId' })
    commenter!: UserEntity;

    @Column()
    postId!: string;

    @ManyToOne(() => PostEntity, (post) => post.comments)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @Column()
    parentId!: string;

    @ManyToOne(() => PostCommentEntity, (parent) => parent.children)
    @JoinColumn({ name: 'parentId' })
    parent!: PostCommentEntity;

    @OneToMany(() => PostCommentEntity, (child) => child.parent)
    @JoinColumn({ name: 'parentId' })
    children!: PostCommentEntity[];

    @OneToMany(() => CommentLikeEntity, (like) => like.comment, {
        cascade: true,
    })
    likes!: CommentLikeEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

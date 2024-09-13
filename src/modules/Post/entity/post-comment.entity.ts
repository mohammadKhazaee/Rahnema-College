import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../User/entity/user.entity';
import { CommentLikeEntity } from './comment-Likes.entity';

@Entity('post_comments')
export class PostCommentEntity {
    @PrimaryGeneratedColumn('uuid')
    commentId!: string;

    @Column()
    content!: string;

    @Column({ collation: 'utf8_bin' })
    commenterId!: string;

    @ManyToOne(() => UserEntity, (commenter) => commenter.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'commenterId' })
    commenter!: UserEntity;

    @Column()
    postId!: string;

    @ManyToOne(() => PostEntity, (post) => post.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @Column({ default: null, nullable: true })
    parentId!: string;

    @ManyToOne(() => PostCommentEntity, (parent) => parent.replays, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'parentId' })
    parent!: PostCommentEntity;

    @OneToMany(() => PostCommentEntity, (child) => child.parent)
    @JoinColumn({ name: 'parentId' })
    replays!: PostCommentEntity[];

    @OneToMany(() => CommentLikeEntity, (like) => like.comment, {
        cascade: ['insert', 'update'],
        onDelete: 'CASCADE',
    })
    likes!: CommentLikeEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

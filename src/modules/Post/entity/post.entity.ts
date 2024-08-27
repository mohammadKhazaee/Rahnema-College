import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { PostImageEntity } from './post-image.entity';
import { TagEntity } from './tag.entity';
import { PostCommentEntity } from './post-comment.entity';
import { PostLikeEntity } from './post-Likes.entity';
import { BookmarkEntity } from './bookmark.entity';

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
    postId!: string;

    @Column()
    caption!: string;

    @Column({ default: false })
    isCloseFriend!: boolean;

    @Column()
    creatorId!: string;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    @JoinColumn({ name: 'creatorId' })
    creator!: UserEntity;

    @ManyToMany(() => TagEntity, (t) => t.posts, {
        cascade: ['insert', 'update'],
    })
    @JoinTable({
        name: 'posts_taged',
        joinColumn: {
            name: 'postId',
            referencedColumnName: 'postId',
        },
        inverseJoinColumn: {
            name: 'tagId',
            referencedColumnName: 'tagId',
        },
    })
    tags!: TagEntity[];

    @OneToMany(() => PostImageEntity, (image) => image.post, {
        cascade: ['insert', 'update'],
    })
    images!: PostImageEntity[];

    @OneToMany(() => PostCommentEntity, (comment) => comment.post, {
        cascade: ['insert', 'update'],
    })
    comments!: PostCommentEntity[];

    @ManyToMany(() => UserEntity, (m) => m.mentions, {
        cascade: ['insert', 'update'],
    })
    @JoinTable({
        name: 'mentions',
        joinColumn: {
            name: 'postId',
            referencedColumnName: 'postId',
        },
        inverseJoinColumn: {
            name: 'mentionedId',
            referencedColumnName: 'username',
        },
    })
    mentions!: UserEntity[];

    @OneToMany(() => PostLikeEntity, (like) => like.post, {
        cascade: ['insert', 'update'],
    })
    likes!: PostLikeEntity[];

    @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post, {
        cascade: ['insert', 'update'],
    })
    bookmarks!: BookmarkEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

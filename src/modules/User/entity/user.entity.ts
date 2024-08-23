import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
} from 'typeorm';
import { PostEntity } from '../../Post/entity/post.entity';
import { PostCommentEntity } from '../../Post/entity/post-comment.entity';
import { PostLikeEntity } from '../../Post/entity/post-Likes.entity';
import { BookmarkEntity } from '../../Post/entity/bookmark.entity';
import { FollowingEntity } from '../../Follow/entity/following.entity';

@Entity('users')
export class UserEntity {
    @PrimaryColumn()
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    fName!: string;

    @Column()
    lName!: string;

    @Column()
    imageUrl!: string;

    @Column({ nullable: true })
    bio!: string;

    @Column({ default: true })
    isPrivate!: boolean;

    @OneToMany(() => PostEntity, (post) => post.creator)
    posts!: PostEntity[];

    @OneToMany(() => FollowingEntity, (f) => f.follower)
    followings!: FollowingEntity[];

    @OneToMany(() => FollowingEntity, (f) => f.followed)
    followers!: FollowingEntity[];

    @ManyToMany(() => PostEntity, (m) => m.mentions)
    mentions!: PostEntity[];

    @OneToMany(() => PostCommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments!: PostCommentEntity[];

    @OneToMany(() => PostLikeEntity, (like) => like.post, {
        cascade: true,
    })
    likes!: PostLikeEntity[];

    @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post, {
        cascade: true,
    })
    bookmarks!: BookmarkEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

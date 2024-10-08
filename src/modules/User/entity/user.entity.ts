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
import { UserRelationEntity } from '../../UserRelation/entity/user-relation.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';
import { MessageEntity } from '../../Message/entity/message.entity';

@Entity('users')
export class UserEntity {
    @PrimaryColumn({ collation: 'utf8_bin' })
    username!: string;

    @Column({ unique: true, collation: 'utf8_bin' })
    email!: string;

    @Column()
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

    @OneToMany(() => UserRelationEntity, (f) => f.follower)
    followings!: UserRelationEntity[];

    @OneToMany(() => UserRelationEntity, (f) => f.followed)
    followers!: UserRelationEntity[];

    @OneToMany(() => NotificationEntity, (notif) => notif.emiter)
    emitedNotifs!: NotificationEntity[];

    @OneToMany(() => NotificationEntity, (notif) => notif.receiver)
    receivedNotifs!: NotificationEntity[];

    @ManyToMany(() => PostEntity, (m) => m.mentions)
    mentions!: PostEntity[];

    @OneToMany(() => PostCommentEntity, (comment) => comment.post, {
        cascade: ['insert', 'update'],
    })
    comments!: PostCommentEntity[];

    @OneToMany(() => PostLikeEntity, (like) => like.post, {
        cascade: ['insert', 'update'],
        onDelete: 'CASCADE',
    })
    likes!: PostLikeEntity[];

    @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post, {
        cascade: ['insert', 'update'],
    })
    bookmarks!: BookmarkEntity[];

    @OneToMany(() => MessageEntity, (message) => message.sender, {
        cascade: ['insert', 'update'],
        onDelete: 'CASCADE',
    })
    sentMessages!: MessageEntity[];

    @OneToMany(() => MessageEntity, (message) => message.receiver, {
        cascade: ['insert', 'update'],
        onDelete: 'CASCADE',
    })
    receivedMessages!: MessageEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

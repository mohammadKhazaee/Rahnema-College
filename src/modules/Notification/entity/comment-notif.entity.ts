import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Column,
} from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { PostCommentEntity } from '../../Post/entity/post-comment.entity';

@Entity('comment_notifs')
export class CommentNotifEntity {
    @PrimaryColumn()
    notifId!: string;

    @OneToOne(() => NotificationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notifId' })
    notif!: NotificationEntity;

    @Column()
    commentId!: string;

    @ManyToOne(() => PostCommentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId' })
    comment!: PostCommentEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

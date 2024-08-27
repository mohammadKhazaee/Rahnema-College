import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { PostEntity } from '../../Post/entity/post.entity';
import { NotificationEntity } from './notification.entity';

@Entity('post_notifs')
export class PostNotifEntity {
    @PrimaryColumn()
    notifId!: string;

    @OneToOne(() => NotificationEntity)
    @JoinColumn({ name: 'notifId' })
    notif!: NotificationEntity;

    @PrimaryColumn()
    postId!: string;

    @ManyToOne(() => PostEntity)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

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
import { PostEntity } from '../../Post/entity/post.entity';
import { NotificationEntity } from './notification.entity';

@Entity('post_notifs')
export class PostNotifEntity {
    @PrimaryColumn()
    notifId!: string;

    @OneToOne(() => NotificationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notifId' })
    notif!: NotificationEntity;

    @Column()
    postId!: string;

    @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

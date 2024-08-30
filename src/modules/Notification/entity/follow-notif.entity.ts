import {
    Entity,
    PrimaryColumn,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Column,
} from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { UserRelationEntity } from '../../UserRelation/entity/user-relation.entity';

@Entity('follow_notifs')
export class FollowNotifEntity {
    @PrimaryColumn()
    notifId!: string;

    @OneToOne(() => NotificationEntity)
    @JoinColumn({ name: 'notifId' })
    notif!: NotificationEntity;

    @Column()
    followId!: string;

    @OneToOne(() => UserRelationEntity)
    @JoinColumn({ name: 'followId' })
    follow!: UserRelationEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

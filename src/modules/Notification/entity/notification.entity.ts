import {
    Entity,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { NotifType } from '../model/notifications';
import { FriendNotifType } from '../model/friend-notifs';

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    notifId!: string;

    @Column()
    type!: NotifType | FriendNotifType;

    @Column({ default: false })
    isSeen!: boolean;

    @Column({ collation: 'utf8_bin' })
    receiverId!: string;

    @ManyToOne(() => UserEntity, (receiver) => receiver.receivedNotifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiverId' })
    receiver!: UserEntity;

    @Column({ collation: 'utf8_bin' })
    emiterId!: string;

    @ManyToOne(() => UserEntity, (emiter) => emiter.emitedNotifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'emiterId' })
    emiter!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

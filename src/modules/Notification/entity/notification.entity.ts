import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { NotifType } from '../model/notifications';

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    notifId!: string;

    @Column()
    type!: NotifType;

    @Column()
    isSeen!: boolean;

    @Column()
    receiverId!: string;

    @ManyToOne(() => UserEntity, (receiver) => receiver.receivedNotifs)
    @JoinColumn({ name: 'receiverId' })
    receiver!: UserEntity;

    @Column()
    emiterId!: string;

    @ManyToOne(() => UserEntity, (emiter) => emiter.emitedNotifs)
    @JoinColumn({ name: 'emiterId' })
    emiter!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

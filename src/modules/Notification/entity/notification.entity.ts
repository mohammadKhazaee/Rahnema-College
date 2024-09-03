import {
    Entity,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { NotifType } from '../model/notifications';

@Entity('notifications')
@Unique(['receiverId', 'emiterId'])
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    notifId!: string;

    @Column()
    type!: NotifType;

    @Column({ default: false })
    isSeen!: boolean;

    @Column()
    receiverId!: string;

    @ManyToOne(() => UserEntity, (receiver) => receiver.receivedNotifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiverId' })
    receiver!: UserEntity;

    @Column()
    emiterId!: string;

    @ManyToOne(() => UserEntity, (emiter) => emiter.emitedNotifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'emiterId' })
    emiter!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

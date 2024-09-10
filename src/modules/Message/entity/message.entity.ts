import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { boolean } from 'zod';

@Entity('messages')
export class MessageEntity {
    @PrimaryColumn('uuid')
    messageId!: string;

    @Column()
    senderId!: string;

    @ManyToOne(() => UserEntity, (user) => user.username, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'senderId' })
    sender!: UserEntity;

    @Column()
    receiverId!: string;

    @ManyToOne(() => UserEntity, (user) => user.username, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'receiverId' })
    receiver!: UserEntity;

    @Column()
    isImage!: boolean;

    @Column()
    content!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

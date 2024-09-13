import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';

@Entity('messages')
export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    messageId!: string;

    @Column({ collation: 'utf8_bin' })
    senderId!: string;

    @ManyToOne(() => UserEntity, (user) => user.username, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'senderId' })
    sender!: UserEntity;

    @Column({ collation: 'utf8_bin' })
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

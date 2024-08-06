import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { ResetToken } from '../model/resetToken';

@Entity('authentications')
export class AuthEntity {
    @PrimaryColumn()
    @OneToOne(() => UserEntity)
    @JoinColumn({ name: 'username' })
    username!: string;

    @Column()
    resetToken!: ResetToken;

    @Column()
    resetTokenExp!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { userRelationStatus, UserRelationStatus } from '../model/user-relation';

@Entity('user_relations')
export class UserRelationEntity {
    @PrimaryGeneratedColumn('uuid')
    relationId!: string;

    @Column()
    followerId!: string;

    @ManyToOne(() => UserEntity, (follower) => follower.followings)
    @JoinColumn({ name: 'followerId' })
    follower!: UserEntity;

    @Column()
    followedId!: string;

    @ManyToOne(() => UserEntity, (followed) => followed.followers)
    @JoinColumn({ name: 'followedId' })
    followed!: UserEntity;

    @Column({ default: userRelationStatus.requestedFollow })
    status!: UserRelationStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

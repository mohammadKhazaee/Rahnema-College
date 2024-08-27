import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    Column,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { userRelationStatus, UserRelationStatus } from '../model/follow';

@Entity('user_relations')
export class UserRelationEntity {
    @PrimaryColumn()
    followerId!: string;

    @ManyToOne(() => UserEntity, (follower) => follower.followings)
    @JoinColumn({ name: 'followerId' })
    follower!: UserEntity;

    @PrimaryColumn()
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

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
import { NotificationEntity } from './notification.entity';
import { UserRelationEntity } from '../../UserRelation/entity/user-relation.entity';

@Entity('comment_notifs')
export class RelationNotifEntity {
    @PrimaryColumn()
    notifId!: string;

    @OneToOne(() => NotificationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notifId' })
    notif!: NotificationEntity;

    @Column()
    relationId!: string;

    @ManyToOne(() => UserRelationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'relationId' })
    relation!: UserRelationEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

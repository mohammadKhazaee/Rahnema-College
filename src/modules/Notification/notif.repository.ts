import { Repository, DataSource, In } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import {
    CreateNotif,
    isNormalNotifEntity,
    NormalNotifEntity,
    notifType,
} from './model/notifications';
import { DbPagination } from '../Common/model/db-pagination';
import { FriendNotifEntity, friendNotifType, isFriendNotifEntity } from './model/friend-notifs';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(private dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }

    async unSeenCount(username: string): Promise<number> {
        return this.notifRepo.count({ where: { receiverId: username, isSeen: false } });
    }

    async notifList(username: string, { skip, take }: DbPagination): Promise<NormalNotifEntity[]> {
        const notifList = await this.notifRepo.find({
            where: {
                receiverId: username,
                type: In([notifType]),
            },
            relations: {
                emiter: true,
                receiver: true,
            },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        if (notifList.every((n) => isNormalNotifEntity(n))) return notifList;
        throw new Error();
    }

    async friendNotifList(
        username: string,
        { skip, take }: DbPagination
    ): Promise<FriendNotifEntity[]> {
        const notifList = await this.notifRepo.find({
            where: {
                receiverId: username,
                type: In([friendNotifType]),
            },
            relations: {
                emiter: true,
                receiver: true,
            },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        if (notifList.every((n) => isFriendNotifEntity(n))) return notifList;
        throw new Error();
    }

    create(createNotif: CreateNotif) {
        return this.notifRepo.save(createNotif);
    }

    updateBulk(notifEntities: NotificationEntity[]) {
        return this.notifRepo
            .createQueryBuilder()
            .update()
            .set({ isSeen: true })
            .where({ notifId: In(notifEntities.map((n) => n.notifId)) })
            .execute();
    }
}

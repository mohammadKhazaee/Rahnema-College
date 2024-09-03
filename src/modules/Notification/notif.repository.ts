import { Repository, DataSource } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { CreateNotif } from './model/notifications';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(private dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }

    notifList(username: string) {
        return this.dataSource.manager.query(
            `
            SELECT *
            FROM notifications
            WHERE emiterId In (
            SELECT relationId FROM user_relations WHERE 
            )
            `,
            [username]
        );
    }

    create(createNotif: CreateNotif) {
        return this.notifRepo.save(createNotif);
    }
}

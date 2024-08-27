import { Repository, DataSource } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }
}

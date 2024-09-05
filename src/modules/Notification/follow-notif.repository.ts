import { Repository, DataSource } from 'typeorm';
import { RelationNotifEntity } from './entity/relation-notif.entity';

export class RelationNotifRepository {
    private relationNotifRepo: Repository<RelationNotifEntity>;

    constructor(dataSource: DataSource) {
        this.relationNotifRepo = dataSource.getRepository(RelationNotifEntity);
    }

    findOneByNotifId(notifId: string) {
        return this.relationNotifRepo.findOne({
            where: { notifId },
            relations: { relation: { followed: true, follower: true } },
        });
    }
}

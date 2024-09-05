import { Repository, DataSource } from 'typeorm';
import { CommentNotifEntity } from './entity/comment-notif.entity';

export class CommentNotifRepository {
    private commentNotifRepo: Repository<CommentNotifEntity>;

    constructor(dataSource: DataSource) {
        this.commentNotifRepo = dataSource.getRepository(CommentNotifEntity);
    }

    findOneByNotifId(notifId: string) {
        return this.commentNotifRepo.findOne({
            where: { notifId },
            relations: { comment: { post: { images: true } } },
        });
    }
}

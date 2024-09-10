import { DataSource, Repository } from 'typeorm';
import { MessageEntity } from './entity/message.entity';
import { CreateMessage } from './model/message';

export class MessageRepository {
    private messageRepo: Repository<MessageEntity>;
    constructor(datasource: DataSource) {
        this.messageRepo = datasource.getRepository(MessageEntity);
    }

    create(message: CreateMessage) {
        return this.messageRepo.save(message);
    }
}

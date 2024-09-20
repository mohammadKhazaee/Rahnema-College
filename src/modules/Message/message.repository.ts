import { Brackets, DataSource, Repository, ReturnDocument } from 'typeorm';
import { MessageEntity } from './entity/message.entity';
import { ChatersId, ChatHitoryRecord, CreateMessage } from './model/message';

import { AppDataSource } from '../../data-source';
import { DbPagination } from '../Common/model/db-pagination';

export class MessageRepository {
    private messageRepo: Repository<MessageEntity>;
    constructor(datasource: DataSource) {
        this.messageRepo = datasource.getRepository(MessageEntity);
    }

    create(message: CreateMessage) {
        return this.messageRepo.save(message);
    }

    update(messages: MessageEntity[]) {
        return this.messageRepo.save(messages);
    }

    unSeenCount(username: string): Promise<number> {
        return this.messageRepo.count({ where: { receiverId: username, isSeen: false } });
    }

    getChats({ chaterId, username }: ChatersId, pagination: DbPagination) {
        return this.messageRepo.find({
            where: [
                { receiverId: chaterId, senderId: username },
                { receiverId: username, senderId: chaterId },
            ],
            relations: { sender: true, receiver: true },
            order: { createdAt: 'DESC' },
            ...pagination,
        });
    }

    retrieveHistory(username: string, skip: number, take: number): Promise<ChatHitoryRecord[]> {
        return this.messageRepo
            .createQueryBuilder('m')
            .select(
                'm.*, u.lName as senderlName, u.fName as senderfName, u.imageUrl as senderImage, u2.lName as receiverlName, u2.fName as receiverfName, u2.imageUrl as receiverImage'
            )
            .innerJoin('m.sender', 'u')
            .innerJoin('m.receiver', 'u2')
            .where('(m.senderId = :senderId', { senderId: username })
            .orWhere('m.receiverId = :receiverId)', { receiverId: username })
            .andWhere(
                `m.createdAt = (
                    SELECT MAX(sub_m.createdAt)
                    FROM messages sub_m
                    WHERE (sub_m.senderId = m.senderId AND sub_m.receiverId = m.receiverId)
                    OR (sub_m.senderId = m.receiverId AND sub_m.receiverId = m.senderId)
                )`
            )
            .orderBy('m.createdAt', 'DESC')
            .skip(skip)
            .limit(take)
            .getRawMany();
    }

    unseenCount(senderName: string, receiverName: string) {
        return this.messageRepo.count({
            where: {
                senderId: senderName,
                receiverId: receiverName,
                isSeen: false,
            },
        });
    }
}

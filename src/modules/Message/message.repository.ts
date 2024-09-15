import { Brackets, DataSource, Repository, ReturnDocument } from 'typeorm';
import { MessageEntity } from './entity/message.entity';
import { ChatHitoryRecord, CreateMessage } from './model/message';

import { AppDataSource } from '../../data-source';

export class MessageRepository {
    private messageRepo: Repository<MessageEntity>;
    constructor(datasource: DataSource) {
        this.messageRepo = datasource.getRepository(MessageEntity);
    }

    create(message: CreateMessage) {
        return this.messageRepo.save(message);
    }

    getChat(chatId: string) {
        return this.messageRepo.find({
            where: {
                messageId: chatId,
            },
            relations: {
                sender: true,
                receiver: true,
            },
        });
    }

    async retrieveHistory(
        username: string,
        skip: number,
        take: number
    ): Promise<ChatHitoryRecord[]> {
        const queryRunner = AppDataSource.createQueryRunner();
        const chatList = await queryRunner.manager.query(
            `SELECT m.*, u.lName as senderlName, u.fName as senderfName, u.imageUrl as senderImage, u2.lName as receiverlName, u2.fName as receiverfName, u2.imageUrl as receiverImage
                FROM messages m
                join users u
                on m.senderId = u.username
                join users u2
                on m.receiverId = u2.username
                WHERE (m.senderId=? OR m.receiverId=?)
                AND m.createdAt = (
                    SELECT MAX(createdAt)
                    FROM messages
                    WHERE (senderId = m.senderId AND receiverId = m.receiverId)
                        OR (senderId = m.receiverId AND receiverId = m.senderId)
                )
                ORDER BY m.createdAt DESC
            LIMIT ? OFFSET ?`,
            [username, username, take, skip]
        );
        return chatList;
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

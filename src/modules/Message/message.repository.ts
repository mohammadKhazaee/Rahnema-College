import { DataSource, Repository, ReturnDocument } from 'typeorm';
import { MessageEntity } from './entity/message.entity';
import { CreateMessage } from './model/message';

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

    // retrieveHistory(username: string, skip: number, take: number) {
    //     const receivedMessagesSubQuery = this.messageRepo
    //         .createQueryBuilder('received')
    //         .select('receiverId AS contact_id, MAX(createdAt) AS latest_message_time')
    //         .where('receiverId = :username', { username })
    //         .groupBy('receiverId');

    //     // ساب‌کوئری برای پیام‌های ارسالی
    //     const sentMessagesSubQuery = this.messageRepo
    //         .createQueryBuilder('sent')
    //         .select('senderId AS contact_id, MAX(createdAt) AS latest_message_time')
    //         .where('senderId = :username', { username })
    //         .groupBy('senderId');

    //     // ساب‌کوئری ترکیبی
    //     const latestMessagesSubQuery = this.messageRepo
    //         .createQueryBuilder('combined')
    //         .select('contact_id, latest_message_time')
    //         .from(
    //             `(${receivedMessagesSubQuery.getQuery()} UNION ALL ${sentMessagesSubQuery.getQuery()})`,
    //             'combined'
    //         )
    //         .groupBy('contact_id');

    //     const messages = this.messageRepo
    //         .createQueryBuilder('m')
    //         .innerJoin(
    //             `(${latestMessagesSubQuery.getQuery()})`,
    //             'latest_messages',
    //             '(m.senderId = :username AND m.receiverId = latest_messages.contact_id) OR (m.receiverId = :username AND m.senderId = latest_messages.contact_id)',
    //             { username }
    //         )
    //         .andWhere('m.createdAt = latest_messages.latest_message_time')
    //         .orderBy('m.createdAt', 'DESC')
    //         .skip(skip)
    //         .take(take)
    //         .getMany();

    //     return messages;
    //     // return this.messageRepo.find({
    //     //     order: {
    //     //         createdAt: 'DESC',
    //     //     },
    //     //     where: [
    //     //         {
    //     //             receiverId: username,
    //     //         },
    //     //         {
    //     //             senderId: username,
    //     //         },
    //     //     ],
    //     //     relations: {
    //     //         sender: true,
    //     //         receiver: true,
    //     //     },
    //     //     skip,
    //     //     take,
    //     // });
    // }
    async retrieveHistory(username: string, skip: number, take: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        const result = await queryRunner.manager.query(
            `SELECT * FROM messages AS m 
            INNER JOIN (
                SELECT 
                    contact_id, MAX(createdAt) AS latest_message_time 
                FROM (
                    SELECT 
                            senderId AS contact_id,
                            createdAt 
                        FROM messages 
                        WHERE receiverId=? 
                        UNION ALL 
                        SELECT 
                            receiverId AS contact_id, 
                            createdAt 
                        FROM messages 
                        WHERE senderId=?
                ) AS combined 
                GROUP BY contact_id
            ) latest_messages 
            ON (m.senderId=? AND m.receiverId = latest_messages.contact_id) 
                OR (m.receiverId=? AND m.senderId = latest_messages.contact_id) 
            AND m.createdAt = latest_messages.latest_message_time 
            ORDER BY m.createdAt DESC;`,
            [username, username, username, username]
        );
        return result;

        // const sentMessage = this.messageRepo
        //     .createQueryBuilder('message')
        //     .select('contact_id, MAX(createdAt) AS latest_message_time')
        //     .addFrom((qb) => {
        //         return qb
        //             .select('senderId AS contact_id, createdAt')
        //             .where('receiverId = :username', {username})`1
        //             .

        //     })

        // const receivedMessage = this.

        // const receivedMessagesSubQuery = this.messageRepo
        //     .createQueryBuilder('received')
        //     .select('receiverId AS contact_id, MAX(createdAt) AS latest_message_time')
        //     .where('receiverId = :username', { username })
        //     .groupBy('receiverId');
        // // .getMany();t

        // const sentMessagesSubQuery = this.messageRepo
        //     .createQueryBuilder('sent')
        //     .select('senderId AS contact_id, (createdAt) AS latest_message_time')
        //     .where('senderId = :username', { username })
        //     .groupBy('senderId');

        // const sentMessages = await sentMessagesSubQuery.getRawMany();
        // console.log('Received Messages SubQuery Result:', sentMessages);
        // // UNION ALL
        // const combinedSubQuery = this.messageRepo
        //     .createQueryBuilder()
        //     .select('contact_id, latest_message_time')
        //     .from(
        //         `(${receivedMessagesSubQuery.getQuery()} UNION ALL ${sentMessagesSubQuery.getQuery()})`,
        //         'combined'
        //     )
        //     .groupBy('contact_id, latest_message_time');

        // // کوئری اصلی
        // const messages = await this.messageRepo
        //     .createQueryBuilder('m')
        //     .innerJoin(
        //         `(${combinedSubQuery.getQuery()})`,
        //         'latest_messages',
        //         '(m.senderId = :username AND m.receiverId = latest_messages.contact_id) OR (m.receiverId = :username AND m.senderId = latest_messages.contact_id)',
        //         { username }
        //     )
        //     .andWhere('m.createdAt = latest_messages.latest_message_time')
        //     .orderBy('m.createdAt', 'DESC')
        //     .skip(skip)
        //     .take(take)
        //     .getMany();

        // return messages;
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

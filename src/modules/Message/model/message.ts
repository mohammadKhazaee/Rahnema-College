export interface ChatersId {
    username: string;
    chaterId: string;
}

export type GetMessageDao = {
    messageId: string;
    createdAt: Date;
    isOwned: boolean;
} & ({ content: string } | { image: string });

export interface CreateMessage {
    receiverId: string;
    senderId: string;
    isImage: boolean;
    content: string;
    createdAt: Date;
}

export interface ChatHistoryList {
    chatId: string;
    contact: {
        imageUrl: string;
        username: string;
        fname: string;
        lname: string;
        unseenCount: number;
        lastMessage: {
            isImage: boolean;
            content: string;
            createdAt: Date;
        };
    };
}

export interface ChatHitoryRecord {
    messageId: string;
    senderId: string;
    receiverId: string;
    isImage: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isSeen: number;
    senderlName: string;
    senderfName: string;
    senderImage: string;
    receiverlName: string;
    receiverfName: string;
    receiverImage: string;
}

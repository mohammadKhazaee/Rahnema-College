export interface CreateMessage {
    receiverId: string;
    senderId: string;
    isImage: boolean;
    content: string;
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
            content: string;
            createdAt: Date;
        };
    };
}

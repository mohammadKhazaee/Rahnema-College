import { createClient } from 'redis';

export interface FindSession {
    username: string;
    friendId: string;
}

export class SessionStore {
    private client;
    constructor() {
        this.client = createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        });
        this.client.on('error', (err) => console.log('Redis Client Error', err));
    }

    async connect() {
        await this.client.connect();
        return this;
    }

    findReceiverSession({ username, friendId }: FindSession): Promise<string | null> {
        return this.client.get(friendId + '-' + username);
    }

    async saveSession({ username, friendId }: FindSession, socketId: string) {
        await this.client.set(username + '-' + friendId, socketId);
    }

    async removeUserSessions(username: string) {
        const sessionKeys = await this.client.keys(username + '-*');
        if (sessionKeys.length === 0) return;
        await this.client.del(sessionKeys);
    }

    async removeSession({ username, friendId }: FindSession) {
        await this.client.del(username + '-' + friendId);
    }
}

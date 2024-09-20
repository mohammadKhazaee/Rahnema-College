import { appFactory } from './api';
import { AppDataSource } from './data-source';
import { SessionStore } from './sessionStore';
import { initIoSocket } from './socket';

declare global {
    namespace Express {
        interface Request {
            username: string;
        }
    }
}

declare module 'socket.io/dist/socket' {
    interface Socket {
        username: string;
        sessionId: string;
    }
}

AppDataSource.initialize().then(async (dataSource) => {
    const client = new SessionStore();
    const sessionStore = await client.connect();

    const server = appFactory(dataSource, sessionStore).listen(3000);
    initIoSocket(server, sessionStore);
});

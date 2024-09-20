import { Server } from 'socket.io';
import { SessionStore } from './sessionStore';
import { verify } from 'jsonwebtoken';
import { ForbiddenError } from './utility/errors/userFacingError';

let io: Server;

export const initIoSocket = (
    //@ts-ignore
    httpServer,
    sessionStore: SessionStore
) => {
    io = new Server(httpServer, { cors: { origin: '*' } });

    io.use((socket, next) => {
        const jwt: string | undefined = socket.handshake.auth.jwt;
        if (!jwt) return next(new ForbiddenError('not authorized'));

        try {
            const { username } = verify(jwt, process.env.JWT_SECRET!) as { username: string };
            if (!username) return next(new ForbiddenError('Invalid token'));

            socket.username = username;

            next();
        } catch (err) {
            return next(new ForbiddenError('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('pvConnect', async (friendId) => {
            await sessionStore.removeSession({ username: socket.username, friendId });
            await sessionStore.saveSession({ username: socket.username, friendId }, socket.id);
        });

        socket.on('pvDisconnect', async (friendId) => {
            await sessionStore.removeSession({ username: socket.username, friendId });
        });

        socket.on('disconnect', async () => {
            await sessionStore.removeUserSessions(socket.username);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) throw new ForbiddenError('Socket.io not initialized');
    return io;
};

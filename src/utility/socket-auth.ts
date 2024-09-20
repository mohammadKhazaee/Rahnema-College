// import { verify } from 'jsonwebtoken';
// import { Socket } from 'socket.io';
// import { ExtendedError } from 'socket.io/dist/namespace';
// import { ForbiddenError } from './errors';

// export const socketAuth: (
//     // socket: Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>,
//     next: (err?: ExtendedError) => void
// ) => void = (socket, next) => {
//     const jwt = socket.handshake.auth.jwt;
//     if (!username) throw new ForbiddenError('invalid username');

//     const session = sessionStore.findSessions(username);
//     if (!session) {
//         sessionStore.saveSession(username, { socketId: socket.id });
//         socket.username = username;
//         return next();
//     }

//     socket.username = username;
//     next();

//     if (!authHeader) {
//         return res.status(401).json({ message: 'Authorization header is missing' });
//     }

//     const token = authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Token is missing' });
//     }

//     try {
//         const decoded = verify(token, process.env.JWT_SECRET!);
//         //@ts-ignore
//         req.username = decoded.username;

//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

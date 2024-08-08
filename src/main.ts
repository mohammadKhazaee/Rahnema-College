import { appFactory } from './api';
import { AppDataSource } from './data-source';

declare global {
    namespace Express {
        interface Request {
            username: string;
        }
    }
}

AppDataSource.initialize().then((dataSource) => {
    appFactory(dataSource).listen(3000);
});

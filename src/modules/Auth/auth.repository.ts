import { Repository, DataSource } from 'typeorm';

export class AuthRepository {
    private userRepo: Repository<any>;

    constructor(dataSource: DataSource) {
        this.userRepo = dataSource.getRepository({} as any);
    }
}

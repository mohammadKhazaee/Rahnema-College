import { UserRepository } from './user.repository';

export class UserService {
    constructor(private userRepo: UserRepository) {}
}

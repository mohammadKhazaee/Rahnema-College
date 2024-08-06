import { UserService } from '../User/user.service';
import { AuthRepository } from './auth.repository';

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private userService: UserService
    ) { }
}

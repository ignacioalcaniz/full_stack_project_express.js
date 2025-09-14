import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { passportCall } from '../Middlewares/passport.call.js';

const UserRouter = Router();

UserRouter.post('/register', userController.register);

UserRouter.post('/login', userController.login);

UserRouter.get('/profile', passportCall('jwt', { session: false }), userController.profile);

export default UserRouter;
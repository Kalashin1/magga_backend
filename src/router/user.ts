import { Router } from "express";
import {
  CreateUser, 
  loginUser,
  getPasswordResetCode,
  resetPassword,
  updateProfile,
  getUser,
  generateUserId,
  completeGeneratedUserId,
} from "../controllers";

const UserRouter = Router();

UserRouter.post('/register', CreateUser);

UserRouter.post('/login', loginUser);

UserRouter.post('/request-password-reset', getPasswordResetCode);

UserRouter.post('/reset-password', resetPassword);

UserRouter.post('/make-user', generateUserId)

UserRouter.patch('/user/:id', updateProfile);

UserRouter.get('/user/:token', getUser);

UserRouter.post('/complete-registration/:generatedId', completeGeneratedUserId);

export default UserRouter;
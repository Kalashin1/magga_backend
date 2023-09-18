import { Router } from "express";
import {
  CreateUser, 
  loginUser,
  getPasswordResetCode,
  resetPassword,
  updateProfile
} from "../controllers";

const UserRouter = Router();

UserRouter.post('/register', CreateUser);

UserRouter.post('/login', loginUser);

UserRouter.post('/request-password-reset', getPasswordResetCode);

UserRouter.post('/reset-password', resetPassword);

UserRouter.patch('/user/:id', updateProfile);

export default UserRouter;
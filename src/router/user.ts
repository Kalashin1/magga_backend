import { Router } from "express";
import {CreateUser, loginUser} from "../controllers";

const UserRouter = Router();

UserRouter.post('/register', CreateUser);

UserRouter.post('/login', loginUser);

export default UserRouter;
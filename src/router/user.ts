import { Router } from "express";
import CreateUser from "../controllers";

const UserRouter = Router();

UserRouter.post('/register', CreateUser);

export default UserRouter;
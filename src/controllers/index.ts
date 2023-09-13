import { UserService } from "../services/user";
import {Request, Response} from 'express';


const CreateUser = async (req: Request, res: Response) => {
  const {email, password, role} = req.body;
  const authService = new UserService();
  try {
    const user = await authService.createUserWithEmailAndPassword({
      email,
      password,
      role
    })
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export default CreateUser;
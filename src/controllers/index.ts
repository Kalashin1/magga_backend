import { User } from "../entity/User";
import { UserService } from "../services/user";
import { Request, Response } from "express";

const authService = new UserService();

export const CreateUser = async (req: Request, res: Response) => {
  const { email, password, role, type, phone, username } = req.body;
  let user: Partial<User> = {};
  try {
    switch (type) {
      case "EMAIL":
        user = await authService.createUserWithEmailAndPassword({
          email,
          password,
          role,
        });
        return res.json(user);
      case "PHONE":
        user = await authService.createUserWithPhoneAndPassword({
          phone,
          password,
          role,
        });
        return res.json(user);
      case "EMAIL":
        user = await authService.createUserWithUsernameAndPassword({
          username,
          password,
          role,
        });
        return res.json(user);
      default:
        user = await authService.createUserWithEmailAndPassword({
          email,
          password,
          role,
        });
        return res.json(user);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password, username, phone } = req.body;
  try {
    const user = await authService.login({ 
      email, 
      password,
      phone,
      username
    });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const {id} = req.params;
  const updatePayload = req.body;
  try {
    const user = await authService.updateProfile({...updatePayload, id });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error)
  }
}

export const getPasswordResetCode = async (req: Request, res: Response) => {
  const {email, phone} = req.body;
  try {
    const passwordResetCode = await authService.requestPasswordResetCode({
      email,
      phone
    });
    return res.json(passwordResetCode);
  } catch (error) {
    return res.status(400).json(error)
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  const {email, phone, password, token} = req.body;
  try {
    const user = await authService.updateUserPassword({
      email,
      password,
      phone,
      resetPasswordToken: token
    });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error)
  }
}

export default {
  CreateUser,
  loginUser,
};

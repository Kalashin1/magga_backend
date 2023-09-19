import { User } from "../entity/User";
import { UserService } from "../services/user";
import { Request, Response } from "express";

const authService = new UserService();

export const CreateUser = async (req: Request, res: Response) => {
  const { email, password, role, type, phone, username } = req.body;
  let user: Partial<User> = {};
  let existingUser: Partial<User> = {}
  try {
    switch (type) {
      case "EMAIL":
        existingUser = await authService.getUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'email already exits'}) 
        user = await authService.createUserWithEmailAndPassword({
          email,
          password,
          role,
        });
        console.log(user)
        return res.json(user);
      case "PHONE":
        existingUser = await authService.getUserByPhone(phone);
        if (existingUser) return res.status(400).json({ message: 'phone already exists'}) 
        user = await authService.createUserWithPhoneAndPassword({
          phone,
          password,
          role,
        });
        return res.json(user);
      case "USERNAME":
        existingUser = await authService.getUserByUsername(username);
        if (existingUser) return res.status(400).json({ message: 'username already exists'}) 
        user = await authService.createUserWithUsernameAndPassword({
          username,
          password,
          role,
        });
        return res.json(user);
      default:
        existingUser = await authService.getUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'email already exits'}) 
        user = await authService.createUserWithEmailAndPassword({
          email,
          password,
          role,
        });
        return res.json(user);
    }
  } catch (error) {
    if (error.message.includes('Duplicate entry'))
    return res.status(400).json({
      message: `${type.toLowerCase()} is already in use`
    });
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

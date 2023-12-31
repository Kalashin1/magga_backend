import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import storageService  from "../services/storage";
import userService  from "../services/user";
import { Request, Response } from "express";

export const assignStandIn = async (req: Request, res: Response) => {
  const {owner_id} = req.params;
  const param = req.body;
  try {
    const user = await userService.assignStandIn(param, owner_id);
    return res.json(user);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const getStandIn = async(req: Request, res: Response) => {
  const {owner_id} = req.params;
  try {
    const standIn = await userService.retrieveStandIn(owner_id);
    return res.json(standIn);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export const deleteStandIn = async (req: Request, res: Response) => {
  const {owner_id, employee_id} = req.body;
  try {
    const payload = await userService.deleteStandIn(owner_id, employee_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export const updateBankDetails = async (req:Request, res: Response) => {
  const {owner_id} = req.params;
  const {existingDetails, newDetails} = req.body;
  try {
    const owner = await userService.updateBankDetails(owner_id, existingDetails, newDetails);
    return res.json(owner);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const deleteBankDetails =async (req: Request, res: Response) => {
  const {owner_id} = req.params;
  const {existingBankDetails} = req.body;
  try {
    const payload = await userService.deleteBankDetails(owner_id, existingBankDetails);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const removeTrades = async (req:Request, res: Response) => {
  const {owner_id, tradeId} = req.params;
  try {
    const payload = await userService.removeTrades(owner_id, tradeId);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json(error);
  }
}

export const assingEmployee = async (req: Request, res: Response) => {
  const {owner_id, employee_id} = req.params;
  try {
    const payload = await userService.assingEmployee(owner_id, employee_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

export const retrieveEmployees = async (req:Request, res: Response) => {
  const {owner_id} = req.params;
  try {
    const payload = await userService.retrieveEmployees(owner_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const deleteEmployee = async (req:Request, res: Response) => {
  const {ownerId, employee_id} = req.params;
  try {
    const payload = await userService.deleteEmployee(ownerId, employee_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const assingExecutor = async (req: Request, res: Response) => {
  const {owner_id, executor_id} = req.params;
  try {
    const payload = await userService.assingExecutor(owner_id, executor_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

export const retrieveExecutors = async (req:Request, res: Response) => {
  const {owner_id} = req.params;
  try {
    const payload = await userService.retrieveExecutors(owner_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}


export const deleteExecutor = async (req:Request, res: Response) => {
  const {ownerId, executor_id} = req.params;
  try {
    const payload = await userService.deleteExecutor(ownerId, executor_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const addTrade = async (req:Request, res: Response) => {
  const {owner_id, tradeId} = req.params;
  try {
    const payload = await userService.addTrade(owner_id, tradeId);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

export const generateUserId = async (req: Request, res: Response) => {
  const {role, referrer} = req.body
  try {
    const user = await userService.generateId(role, referrer);
    return res.json(user);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

export const completeGeneratedUserId = async (req: Request, res: Response) => {
  const {generatedId} = req.params;
  const {email, password} = req.body;
  try {
    const generatedAccount = await userService.getUser({ _id: generatedId });
    if (!generatedAccount) throw Error('Invalid token');
    const hashedPassword = await userService.hashPassword(password);
    const user = await userService.updateProfile({ email, _id: generatedId });
    await storageService
    user.password = hashedPassword;
    await AppDataSource.mongoManager.save(User, user);
    return res.json({ user })
  } catch (error) {
    return res.status(400).json(error)
  }
}

export const CreateUser = async (req: Request, res: Response) => {
  const { email, password, role, type, phone, username, first_name, last_name, position } = req.body;
  let user: Partial<User> = {};
  let existingUser: Partial<User> = {};
  try {
    existingUser = await userService.getUser({ email });
    if (existingUser)
      return res
        .status(400)
        .json({message: `${type.toLowerCase()} already exits`});
    user = await userService.createUser({
      email,
      password,
      role,
      phone,
      username,
      first_name,
      last_name,
      position
    });
    console.log(user);
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password, username, phone } = req.body;
  try {
    const user = await userService.login({
      email,
      password,
      phone,
      username,
    });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;
  console.log(id);
  try {
    const user = await userService.updateProfile({ ...updatePayload, _id: id });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getPasswordResetCode = async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  console.log(email, phone)
  try {
    const passwordResetCode = await userService.requestPasswordResetCode({
      email,
      phone,
    });

    return res.json({passwordResetCode});
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, phone, password, token } = req.body;
  try {
    const user = await userService.updateUserPassword({
      email,
      password,
      phone,
      resetPasswordToken: token,
    });
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  const {token} = req.params;
  try {
    const verifiedUser = await userService.verifyToken(token);
    //@ts-ignore
    const user = await userService.getUser({ _id: verifiedUser._id});
    return res.json(user)
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const user = await userService.getUser({_id: id})
    return res.json(user)
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const assignOwner = async (req: Request, res: Response) => {
  const {owner_id, subAccount_id} = req.params;
  console.log("owner_id", owner_id)
  console.log("subAccount_id", subAccount_id);
  try {
    const payload = await userService.completeRegistration(owner_id, subAccount_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({message: error.message})
  }
}

export const getContractors = async (req: Request, res: Response) => {
  try {
    const contractors = await userService.getContractors();
    return res.json(contractors);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateDocument = async (req: Request, res: Response) => {
  const {status, name, _id } = req.body;
  try {
    const payload = await userService.updateDocument(_id, status, name);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export default {
  CreateUser,
  loginUser,
};

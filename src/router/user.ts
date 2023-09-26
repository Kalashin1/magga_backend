import { Router } from "express";
import {USER_ROUTES} from '../router/routes';
import {
  CreateUser, 
  loginUser,
  getPasswordResetCode,
  resetPassword,
  updateProfile,
  getUser,
  generateUserId,
  completeGeneratedUserId,
  assignStandIn,
  getStandIn,
  deleteStandIn,
  addTrade,
  assingEmployee,
  deleteBankDetails,
  deleteEmployee,
  removeTrades,
  retrieveEmployees,
  updateBankDetails,
  getUserById,
} from "../controllers";

const UserRouter = Router();

UserRouter.get(USER_ROUTES.GET_USER_BY_ID, getUserById);

UserRouter.patch(USER_ROUTES.UPDATE_BANK_DETAILS, updateBankDetails);

UserRouter.get(USER_ROUTES.RETRIEVE_EMPLOYEE, retrieveEmployees);

UserRouter.delete(USER_ROUTES.DELETE_EMPLOYEE, deleteEmployee);

UserRouter.delete(USER_ROUTES.REMOVE_TRADES, removeTrades);

UserRouter.delete(USER_ROUTES.DELETE_BANK_DETAILS, deleteBankDetails)

UserRouter.patch(USER_ROUTES.ASSIGN_EMPLOYEE, assingEmployee)

UserRouter.patch(USER_ROUTES.ADD_TRADE, addTrade);

UserRouter.delete(USER_ROUTES.DELETE_STAND_IN, deleteStandIn);

UserRouter.get(USER_ROUTES.GET_STAND_IN, getStandIn);

UserRouter.post(USER_ROUTES.ASSIGN_STAND_IN, assignStandIn);

UserRouter.post(USER_ROUTES.CREATE_ACCOUNT, CreateUser);

UserRouter.post(USER_ROUTES.LOGIN, loginUser);

UserRouter.post(USER_ROUTES.REQUEST_PASSWORD_RESET, getPasswordResetCode);

UserRouter.post(USER_ROUTES.RESET_PASSWORD, resetPassword);

UserRouter.post(USER_ROUTES.GENERATE_ACCOUNT, generateUserId)

UserRouter.patch(USER_ROUTES.USER_ID, updateProfile);

UserRouter.get(USER_ROUTES.USER_TOKEN, getUser);

UserRouter.post(USER_ROUTES.COMPLETE_REGISTRATION, completeGeneratedUserId);


export default UserRouter;
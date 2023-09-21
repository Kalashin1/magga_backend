import { ObjectId } from "typeorm";
import { UserRoleType } from "./entity/User";

export interface AuthUser {
  _id: ObjectId;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  role: UserRoleType;
  avatar: string;
  signature: [Signature];
}

export type Signature = {
  signedFor: string
  tag: string;
  symbol: string;
}

export type CreateUserParam = Pick<AuthUser, 'email' | 'password' | 'username' | 'phone' | 'role'>
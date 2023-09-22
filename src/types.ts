import { ObjectId } from "typeorm";
import { UserRoleType } from "./entity/User";

export interface AuthUser {
  _id: ObjectId|string;
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
  bankDetails: BankDetails[]|BankDetails;
  billingDetails: BillingDetails;
}

export type BankDetails = {
  bank: string;
  iban: string;
  bic: string;
}

export type BillingDetails = {
  taxNumber: string;
  taxId: string;
  cashDiscount: string;
  discountPeriod: string;
  paymentDeadline: string;
}

export type ReferrerType =  {
  role: string;
  id: string|ObjectId;
  email: string;
  generatedAt: string;
}

export type CreateUserParam = Pick<AuthUser, 'email' | 'password' | 'username' | 'phone' | 'role'>
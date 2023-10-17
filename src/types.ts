import { ObjectId } from "typeorm";
import { User, UserRoleType } from "./entity/User";
import { TradeColorEnum } from "./entity/trades";

export interface AuthUser {
  _id: ObjectId | string;
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
  position: string;
  avatar: string;
  employees: ReferrerType[];
  executors: ReferrerType[];
  bankDetails: BankDetails[] | BankDetails;
  billingDetails: BillingDetails;
  numberRanges: NumberRanges[];
  numberRangesLocal: NumberRanges[];
  trades: TradeInterface[];
  documents: Document[];
  logoUrl: LogoUrl;
  address: Address;
  socialSecurityNumber: string;
  taxIdNumber: string;
}

export type Address = {
  street: string;
  zip: string;
  province: string;
};

export type BankDetails = {
  bank: string;
  iban: string;
  bic: string;
};

export type NumberRangesType = "DRAFT" | "INVOICE";

export type NumberRanges = {
  prefix: string;
  nextNumber: number;
  type: NumberRangesType;
};

export type BillingDetails = {
  taxNumber: string;
  taxId: string;
  cashDiscount: string;
  discountPeriod: string;
  paymentDeadline: string;
};

export type ReferrerType = {
  role: string;
  id: string | ObjectId;
  email: string;
} & Partial<
  Pick<AuthUser, "first_name" | "last_name" | "phone" | "username" | "avatar">
>;

export type StandIn = {
  role: "employee";
  _id: string;
  id?: string;
  email: string;
};

type TradePosition = {
  id: string;
  shortText: string;
  price: string;
};

export type UserTrade = {
  positions: number;
} & TradeInterface;

export interface TradeInterface {
  _id: string | ObjectId;
  name: string;
  color: TradeColorEnum;
}

export type CreateUserParam = Pick<
  AuthUser,
  | "email"
  | "password"
  | "username"
  | "phone"
  | "role"
  | "first_name"
  | "last_name"
  | "position"
>;

export type UserDocuments = {
  BusinessRegistration: string;
  MasterScertificate: string;
  CommercialRegisterExtract: string;
  Craftscroll: string;
  CertificateOfExistenceBusinessLiability: string;
  CertificateOfExemptionAccording: string;
  CertificateInTaxMatters: string;
  MinimumWageProof: string;
  GlobalMinimumWageCertificate: string;
  CertificareOfSafetyFromTheBG: string;
  CertificateOfClearanceOfHealthInsuranceAndSocialSecurity: string;
  SalesTaxIdentification: string;
  Letterhead: string;
  A1Certificate: string;
  CertificateOfClearanceFromTheCollectiveSocialInsuranceFund: string;
  ProofOfOccupationalSafetyTraining: string;
  EmployeeList: string;
  TrainingAndInstructionCertificates: string;
  InstallerIDCard: string;
  ProofOfExpertiseAccordingToTRGS: string;
};

export type Document = {
  name: typeof userDocumentsArray[number];
  fileUrl: string;
  uploadedAt: string;
  status: string;
};

export type DocumentStatus = "UPLOADED" | "APPROVED" | "REJECTED" | "EXPIRED";

export const userDocumentsArray = [
  "Executors",
  "Employees",
  "BusinessRegistration",
  "MasterScertificate",
  "CommercialRegisterExtract",
  "Craftscroll",
  "CertificateOfExistenceBusinessLiability",
  "CertificateOfExemptionAccording",
  "CertificateInTaxMatters",
  "MinimumWageProof",
  "GlobalMinimumWageCertificate",
  "CertificareOfSafetyFromTheBG",
  "CertificateOfClearanceOfHealthInsuranceAndSocialSecurity",
  "SalesTaxIdentification",
  "Letterhead",
  "A1Certificate",
  "CertificateOfClearanceFromTheCollectiveSocialInsuranceFund",
  "ProofOfOccupationalSafetyTraining",
  "TrainingAndInstructionCertificates",
  "InstallerIDCard",
  "ProofOfExpertiseAccordingToTRGS",
] as const;

export type LogoUrl = {
  logo: string;
  icon: string;
  invoiceLogo: string;
};

// Others -
// Sanitary -
// Cleaning -
// Painter -
// Tiles -
// Maurer -
// Carpentar -
// Floor -
// Electric -

export const CONTRACT_STATUS = ["GENERATED", "ACCEPTED", "REJECTED", "TERMINATED"];

export interface Contract {
  contractor: string;
  executor: string;
  generatedAt: string;
  trade: string;
  _id: ObjectId;
  status: (typeof CONTRACT_STATUS)[number];
  terminatedAt: number;
  acceptedAt: number;
  positions: Array<Position>;
}

export interface ContractFunctions {
  terminateContract: (contract_id: string) => Promise<Contract>;
  send: (executor_id: string, contract_id: string) => Promise<Contract>;
  accept: (Params: {executor_id: string, contract_id: string }) => Promise<Contract>;
  reject: (executorId: string, contractId) => Promise<Contract>;
};

export interface Position {
  _id: ObjectId;
  shortText: string;
  crowd: string;
  units: "pcs";
  price: number;
  trade: string;
  longText: string;
  external_id: string;
  createdAt?: string;
  updatedAt: string;
  contractor?: string;
}


export interface INotification {
  _id: ObjectId;
  user_id: string;
  shortText: string;
  isRead: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectPositions = {
  status: string;
  billed: boolean;
  comment: string;
} & Position

export interface IProject {
  _id: ObjectId;
  contractor: string;
  executor: string;
  status: String;
  positions: ProjectPositions[];
  createdAt: string;
  dueDate: string;
  updatedAt: string;
  externalId: string;
}

export interface Product {
  _id: ObjectId;
  name: string;
  image: string;
  shop: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  subCategory: string;
}
export const TASK_STATUS = ['ASSIGNED', 'IN-PROGRESS', 'COMPLETED', 'OVER-DUE'] as const

export interface Task {
  _id: ObjectId;
  user_id: string;
  type: string;
  status: typeof TASK_STATUS[number];
  createdAt: string;
  dueDate: string
}

export const INVOICE_STATUS = ['REQUESTED', 'ACCEPTED', 'DECLINED'] as const;

export interface Invoice {
  _id: ObjectId;
  project: string;
  user_id: string;
  status: typeof INVOICE_STATUS[number];
  createdAt: string;
  updatedAt: string;
};

export interface Message {
  _id: ObjectId;
  content: string;
  assetUrl: string;
  owner_id: string;
  reciever_id: string;
  project_id: string;
  createdAt: string;
}
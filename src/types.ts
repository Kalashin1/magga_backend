import { ObjectId } from "typeorm";
import { User, UserRoleType } from "./entity/User";
import { TradeColorEnum } from "./entity/trades";
import { SHOP_STATUS } from "./entity/shop";

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
  projects: string[];
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
  name: (typeof userDocumentsArray)[number];
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

export const CONTRACT_STATUS = [
  "GENERATED",
  "ACCEPTED",
  "REJECTED",
  "TERMINATED",
];

export interface Contract {
  contractor: string;
  executor: string;
  generatedAt: string;
  trade: string;
  _id: ObjectId;
  status: (typeof CONTRACT_STATUS)[number];
  terminatedAt: number;
  acceptedAt: number;
  rejectedAt: number;
  positions: Array<Position>;
}

export interface ContractFunctions {
  terminateContract: (contract_id: string) => Promise<Contract>;
  send: (executor_id: string, contract_id: string) => Promise<Contract>;
  accept: (Params: {
    executor_id: string;
    contract_id: string;
  }) => Promise<Contract>;
  reject: (executorId: string, contractId) => Promise<Contract>;
}
export interface INotification {
  _id: ObjectId;
  user_id: string;
  shortText: string;
  objectId?: string /* this is the primary object on which this notification happens, it is closely related to the type of the NOTIFICATION */;
  subjectId?: string /* This is the secondary object which this notification happens, it helpes to construct a second param in case where the frontend needs to fetch resource from a route which is like route/:objectId/:subjectId */;
  fileUrl?: string;
  isRead: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}
export interface Position {
  _id: ObjectId;
  shortText: string;
  crowd: string;
  units: "pcs" | "psh" | "Stk";
  price: number;
  trade: string;
  longText: string;
  external_id: string;
  createdAt?: string;
  updatedAt: string;
  contractor?: string;
  tradeName?: string;
}

export type ProjectPositions = {
  status: string;
  billed: boolean;
  section?: string;
  documentURL?: string[];
  position: number;
  executor?: string
} & Partial<Position>;

export const PROJECT_STATUS = [
  "CREATED",
  "ASSIGNED",
  "ACCEPTED",
  "PAUSED",
  "COMPLETED",
  "NOT-FEASIBLE",
  "CANCELED",
];

export type ProjectPositionSuper = {
  [key: string]: {
    positions: ProjectPositions[];
    billed: boolean;
    status: string;
    executor?: string;
    accepted: boolean;
    name: string;
    contract?: string;
    id: string;
  };
};

export type ExtraProjectPositionSuper = {
  createdAt: number;
  createdBy: {
    _id: string;
    role: UserRoleType;
  };
  acceptedBy?: {
    _id: string;
    role: UserRoleType;
  };
  id: string;
  acceptedAt?: number;
  comment: string;
  fileURL?: string[];
  rejectedAt?: number;
  positions: ProjectPositionSuper;
};

const TIMELINE_ACTION = ['CREATED', 'POSITIONS_ASSIGNED', 'POSITIONS_REJECTED', 'POSITIONS_ACCEPTED', 'POSITION_COMPLETED', 'POSITION_IN_PROGRESS'] as const

type TimeLine = {
  action: typeof TIMELINE_ACTION[number];
  position?: string;
  trade?: string;
  timestamp: string;
  takenBy: {
    user_id: string;
    role: string;
  };
}

export interface IProject {
  _id: ObjectId;
  contractor: string;
  executors: string[];
  status: (typeof PROJECT_STATUS)[number];
  positions: ProjectPositionSuper;
  shortagePositions: ProjectPositionSuper;
  extraPositions: ExtraProjectPositionSuper[];
  createdAt: string;
  dueDate: string;
  updatedAt: string;
  external_id: string;
  building: Building;
  client: string;
  rentalStatus: string;
  construction_manager: Pick<User, "email" | "phone"> & { name: string };
  commissioned_by: Pick<User, "email" | "phone"> & { name: string };
  careTaker: Pick<User, "email" | "phone"> & { name: string };
  construction_started: number;
  paused_at: number;
  billingDetails: string;
  completed_at: number;
  canceled_at: number;
  sheduleByTrade: TradeSchedule[];
  contract: string;
}

export type createProjectParam = {
  contractor: string;
  positions: {
    [key: string]: {
      positions: ProjectPositions[];
      billed: false;
      executor: string;
    };
  };
  dueDate: string;
  external_id: string;
  client: string;
  building: Building;
  commissioned_by: Pick<User, "email" | "phone"> & { name: string };
  billingDetails: string;
  rentalStatus: string;
  careTaker: Pick<User, "email" | "phone"> & { name: string };
};

export type UpdateMultipleExtraOrderPositionsParam = {
  project_id: string;
  positions: string[];
  status: string;
  addendum_id: string;
};

export type TradeSchedule = {
  name?: string;
  startDate?: string;
  endDate?: string;
};

export type Building = {
  address: string;
  location: string;
  description: string;
  notes: string;
};

export interface Product {
  _id: ObjectId;
  name: string;
  imageUrls: string[];
  external_id: string;
  shop: string;
  price: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  subCategory: string;
}

export interface Shop {
  name: string;
  _id: ObjectId;
  createdAt: string;
  updatedAt: string;
  products: string[];
  email: string;
  password: string;
  phone: string;
  status: (typeof SHOP_STATUS)[number];
}

export const TASK_STATUS = [
  "ASSIGNED",
  "IN-PROGRESS",
  "COMPLETED",
  "OVER-DUE",
] as const;

export interface Todo {
  _id: ObjectId;
  user_id: string;
  type: string;
  description?: string;
  status: (typeof TASK_STATUS)[number];
  object_id: string;
  createdAt?: string;
  updatedAt?: string;
  assignedTo: string;
  dueDate?: string;
}

export const INVOICE_STATUS = [
  "REQUESTED",
  "ACCEPTED",
  "DECLINED",
  "BILLED",
] as const;

export const DRAFT_STATUS = [
  "PENDING",
  "REQUESTED",
  "ACCEPTED",
  "DECLINED",
  "BILLED",
] as const;

export interface InvoiceInterface {
  _id: ObjectId;
  external_id: string;
  draft: string;
  createdAt?: string;
  updatedAt?: string;
  status: (typeof INVOICE_STATUS)[number];
  owner: string;
  receiver: string;
  type: "PROJECT" | "SHOP";
}

export interface Draft {
  project: string;
  user_id: string;
  reciepient: string;
  status: (typeof DRAFT_STATUS)[number];
  _id: ObjectId;
  createdAt: string;
  amount: number;
  positions?: {
    [key: string]: ProjectPositions[];
  };
  addendums?: {
    [key: string]: ProjectPositions[];
  };
  updatedAt: string;
  timeline?: {
    startDate: string;
    endDate: string;
  };
}

export interface Message {
  _id: ObjectId;
  content: string;
  assetUrl: string;
  owner_id: string;
  reciever_id: string[];
  project_id: string;
  createdAt: string;
  position_id?: string;
  trade_id?: string;
  parentMessage?: string;
  status: (typeof MESSAGE_STATUS)[number];
}

export const MESSAGE_STATUS = ["SENT", "DELIVERED", "READ", "DELETED"] as const;

import { ObjectId } from "typeorm";
import { UserRoleType } from "./entity/User";
import { TradeColorEnum } from "./entity/trades";

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
  position: string;
  avatar: string;
  employees: ReferrerType[]
  bankDetails: BankDetails[]|BankDetails;
  billingDetails: BillingDetails;
  numberRanges: NumberRanges[];
  numberRangesLocal: NumberRanges[];
  trades: TradeInterface[];
  documents: UserDocuments;
  logoUrl: LogoUrl;
}

export type BankDetails = {
  bank: string;
  iban: string;
  bic: string;
}

export type NumberRangesType = 'DRAFT' | 'INVOICE';

export type NumberRanges = {
  prefix: string;
  nextNumber: number;
  type: NumberRangesType;
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
} & Partial<
    Pick<AuthUser, 'first_name' | 'last_name' | 'phone' | 'username' | 'avatar' >
  >

export type StandIn = {
  role: 'employee';
  _id: string;
  id?: string;
  email: string;
}

export interface TradeInterface {
  _id: string|ObjectId;
  name: string;
  color: TradeColorEnum;
}

export type CreateUserParam = Pick<AuthUser, 'email' | 'password' | 'username' | 'phone' | 'role' | 'first_name' | 'last_name'| 'position'>;

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
  CertificateOfClearanceFromTheCollectiveSocialInsuranceFund: string
  ProofOfOccupationalSafetyTraining: string;
  EmployeeList: string;
  TrainingAndInstructionCertificates: string;  
  InstallerIDCard: string;
  ProofOfExpertiseAccordingToTRGS: string;
}

export type LogoUrl = {
  logo: string;
  icon: string;
  invoiceLogo: string
}
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectId,
} from "typeorm";
import { randomUUID } from "crypto";
import { BankDetails, BillingDetails, ReferrerType, StandIn, AuthUser, NumberRanges, TradeInterface, UserDocuments, LogoUrl, Address } from "../types";
export type UserRoleType = "admin" | "contractor" | "executor" | "employee";

@Entity()
export class User implements AuthUser {
  @ObjectIdColumn()
  _id: ObjectId;
  
  @Column({
    default: randomUUID(),
  })
  id: string;
  
  @Column()
  first_name: string;
  
  @Column()
  last_name: string;
  
  @Column()
  email: string;

  @Column()
  password: string;
  
  @Column()
  phone: string;

  @Column()
  username: string;
  
  @Column()
  token: string;
  
  @Column({
    type: "enum",
    enum: ["admin", "contractor", "executor", "employee"],
    default: "employee",
  })
  role: UserRoleType;

  @Column()
  resetPasswordToken: number;

  @CreateDateColumn()
  createdAt: string;
  
  @UpdateDateColumn()
  updatedAt: string;
  
  @Column()
  avatar: string;
  
  @Column()
  creator: ReferrerType;
  
  @Column()
  bankDetails: BankDetails[];
  
  @Column()
  billingDetails: BillingDetails;
  
  @Column()
  standIn: StandIn[];

  @Column()
  numberRanges: NumberRanges[];

  @Column()
  numberRangesLocal: NumberRanges[];

  @Column()
  trades: TradeInterface[];

  @Column()
  employees: ReferrerType[];

  @Column()
  position: string;

  @Column()
  documents: UserDocuments;

  @Column()
  logoUrl: LogoUrl;

  @Column()
  executors: ReferrerType[];

  @Column()
  address: Address;
}

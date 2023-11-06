import { Entity, ObjectId, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { InvoiceInterface } from "../types";
import { Column } from "typeorm";

@Entity()
export class Invoice implements InvoiceInterface {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  external_id: string;

  @Column()
  draft: string;

  @CreateDateColumn()
  createdAt?: string;

  @UpdateDateColumn()
  updatedAt?: string;

  @Column()
  status: "REQUESTED" | "ACCEPTED" | "DECLINED";

  @Column()
  owner: string;

  @Column()
  receiver: string;
}
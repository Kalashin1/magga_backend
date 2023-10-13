import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from "typeorm";
import {Contract as ContractInterface, Position, ReferrerType } from '../types'
import { Trades } from "./trades";

@Entity()
export class Contract implements ContractInterface {
  @ObjectIdColumn()
  _id: ObjectId

  @Column()
  contractor: ReferrerType;

  @Column()
  executor: ReferrerType;

  @CreateDateColumn()
  generatedAt: string;
  
  @Column()
  trade: Trades;

  @Column()
  status: string;

  @Column()
  terminatedAt: number;

  @Column()
  acceptedAt: number;

  @Column()
  positions: Position[];
}
import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from "typeorm";
import {CONTRACT_STATUS, Contract as ContractInterface, Position } from '../types'
import { Trades } from "./trades";

@Entity()
export class Contract {
  @ObjectIdColumn()
  _id: ObjectId

  @Column()
  contractor: string

  @Column()
  executor: string

  @CreateDateColumn()
  generatedAt: string;
  
  @Column()
  trade:string;

  @Column({
    default: CONTRACT_STATUS[0]
  })
  status: typeof CONTRACT_STATUS[number];

  @Column()
  terminatedAt: number;

  @Column()
  acceptedAt: number;

  @Column()
  positions: Position[];

  @Column()
  rejectedAt: number;
}
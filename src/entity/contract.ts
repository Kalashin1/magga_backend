import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn } from "typeorm";
import {Contract as ContractInterface, Position } from '../types'
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

  @Column()
  status: string;

  @Column()
  terminatedAt: number;

  @Column()
  acceptedAt: number;

  @Column()
  positions: Position[];
}
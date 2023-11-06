import { Entity, Column, CreateDateColumn, UpdateDateColumn  } from "typeorm";
import {Draft as DraftInterface} from '../types';
import { ObjectId } from "typeorm";
import { ObjectIdColumn } from "typeorm";

@Entity()
export class Draft implements DraftInterface {
  @Column()
  amount: number;

  @Column()
  positions: string[];

  @Column()
  reciepient: string;
  
  @Column()
  project: string;

  @Column()
  user_id: string;

  @Column({
    type: "enum",
    enum: ["ACCEPTED" , "REQUESTED", "DECLINED"],
    default: "REQUESTED",
  })
  status: "ACCEPTED" | "REQUESTED" | "DECLINED";

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
  
  @ObjectIdColumn()
  _id: ObjectId
}
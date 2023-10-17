import { 
  Entity, 
  Column, 
  ObjectId, 
  ObjectIdColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from "typeorm";
import { Position as PositionInterface } from "../types";

@Entity()
export class Position implements PositionInterface {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  shortText: string;

  @Column()
  crowd: string;

  @Column({
    default: "pcs"
  })
  units: "pcs";

  @Column()
  price: number;

  @Column()
  trade: string;

  @Column()
  external_id: string

  @CreateDateColumn()
  createdAt?: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  contractor?: string;

  @Column()
  longText: string;
}
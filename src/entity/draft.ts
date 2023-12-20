import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import {
  DRAFT_STATUS,
  Draft as DraftInterface,
  ProjectPositions,
} from "../types";
import { ObjectId } from "typeorm";
import { ObjectIdColumn } from "typeorm";

@Entity()
export class Draft implements DraftInterface {
  @Column()
  amount: number;

  @Column()
  positions: {
    [key: string]: ProjectPositions[];
  };

  @Column()
  addendums?: {
    [key: string]: ProjectPositions[];
  };

  @Column()
  reciepient: string;

  @Column()
  project: string;

  @Column()
  user_id: string;

  @Column({
    type: "enum",
    enum: DRAFT_STATUS,
    default: DRAFT_STATUS[0],
  })
  status: (typeof DRAFT_STATUS)[number];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  timeline?: { startDate: string; endDate: string };
}

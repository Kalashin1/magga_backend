import {
  Entity,
  Column,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";
import {
  Address,
  Building,
  IProject,
  TradeSchedule,
  PROJECT_STATUS,
  ProjectPositionSuper,
  ExtraProjectPositionSuper,
} from "../types";
import { User } from "./User";

@Entity()
export class Project implements IProject {
  @Column()
  contract: string;

  @Column()
  client: string;

  @Column()
  commissioned_by: Pick<User, "phone" | "email"> & { name: string };
  @Column()
  billingDetails: string;

  @Column()
  careTaker: Pick<User, "email" | "phone"> & { name: string };

  @Column()
  executors: string[];

  @Column()
  shortagePositions: ProjectPositionSuper;

  @Column()
  extraPositions: ExtraProjectPositionSuper[];

  @Column()
  building: Building;

  @Column()
  rentalStatus: string;

  @Column()
  construction_manager: Pick<User, "email" | "phone"> & { name: string };

  @Column()
  construction_started: number;

  @Column()
  sheduleByTrade:TradeSchedule[];

  @Column()
  contractor: string;

  @Column()
  executor: string[];

  @Column({
    type: "enum",
    enum: PROJECT_STATUS,
    default: PROJECT_STATUS[0],
  })
  status: (typeof PROJECT_STATUS)[number];

  @Column()
  positions: ProjectPositionSuper;

  @Column()
  dueDate: string;

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  external_id: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  paused_at: number;

  @Column()
  completed_at: number;

  @Column()
  canceled_at: number;
}

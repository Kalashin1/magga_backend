import { Entity, Column, ObjectId, ObjectIdColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Address, Building, IProject, ProjectPositions } from "../types";

@Entity()
export class Project implements IProject {

  @Column()
  executors: string[];

  @Column()
  shortagePositions: ProjectPositions[];

  @Column()
  extraPositions: ProjectPositions[];

  @Column()
  building: Building

  @Column()
  rentalStatus: string;

  @Column()
  construction_manager: string;

  @Column()
  phone: string;

  @Column()
  construction_started: string;

  @Column()
  sheduleByTrade: { string: string; }[];
  
  @Column()
  contractor: string;

  @Column()
  executor: string[];

  @Column()
  status: String;

  @Column()
  positions: ProjectPositions[];

  @Column()
  dueDate: string;

  @ObjectIdColumn()
  _id: ObjectId

  @Column()
  externalId: string

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
import { Entity, Column, ObjectId, ObjectIdColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { IProject, ProjectPositions } from "../types";

@Entity()
export class Project implements IProject {
  @Column()
  contractor: string;

  @Column()
  executor: string;

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
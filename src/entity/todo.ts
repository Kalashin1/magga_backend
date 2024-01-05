import {
  Entity,
  Column,
  ObjectId,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { TASK_STATUS, TASK_TYPE, Todo as TodoInterface } from "../types";

@Entity()
export class Todo implements TodoInterface {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  user_id: string;

  @Column({
    type: "enum",
    enum: TASK_TYPE,
    default: TASK_TYPE[0],
  })
  type: (typeof TASK_TYPE)[number];

  @Column()
  description?: string;

  @Column({
    type: "enum",
    enum: TASK_STATUS,
    default: TASK_STATUS[0],
  })
  status: (typeof TASK_STATUS)[number];

  @Column()
  object_id: string;

  @CreateDateColumn()
  createdAt?: string;

  @UpdateDateColumn()
  updatedAt?: string;

  @Column()
  assignedTo: string;

  @Column()
  dueDate?: string;
}

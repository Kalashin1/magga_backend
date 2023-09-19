import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectId,
} from "typeorm";
import { randomUUID } from "crypto";
export type UserRoleType = "admin" | "contractor" | "executor" | "employee";

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({
    default: randomUUID(),
  })
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  username: string;

  @Column()
  token: string;

  @Column({
    type: "enum",
    enum: ["admin", "contractor", "executor", "employee"],
    default: "employee",
  })
  role: UserRoleType;

  @Column()
  resetPasswordToken: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  avatar: string
}

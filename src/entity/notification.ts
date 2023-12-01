import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { INotification } from "../types";

@Entity()
export class Notification implements INotification {
  @ObjectIdColumn()
  _id: ObjectId

  @Column()
  user_id: string;

  @Column()
  shortText: string;

  @Column({
    default: false
  })
  isRead: boolean;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  fileUrl?: string;

  @Column()
  objectId?: string;

  @Column()
  subjectId?: string;
}
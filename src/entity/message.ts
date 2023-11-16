import { Entity, ObjectIdColumn, Column, CreateDateColumn, ObjectId } from "typeorm";
import { Message as IMessage, MESSAGE_STATUS } from "../types";

@Entity()
export class Message implements IMessage {
  @Column({
    enum: MESSAGE_STATUS,
    default: MESSAGE_STATUS[0],
  })
  status: typeof MESSAGE_STATUS[number];

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  content: string;

  @Column()
  assetUrl: string;

  @Column()
  owner_id: string;

  @Column()
  reciever_id: string[];

  @Column()
  project_id: string;

  @CreateDateColumn()
  createdAt: string;

  @Column()
  position_id?: string;

  @Column()
  trade_id?: string;

  @Column()
  parentMessage?: string;

}
import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import { TradeInterface } from "../types";

export type TradeColorEnum =
  | "blue-500"
  | "red-500"
  | "yellow-500"
  | "green-500"
  | "orange-500"
  | "purple-500";
@Entity()
export class Trades implements TradeInterface {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: [
      "blue-500",
      "red-500",
      "yellow-500",
      "green-500",
      "orange-500",
      "purple-500",
    ]
  })
  color: TradeColorEnum;
}

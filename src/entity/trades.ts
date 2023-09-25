import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import {TradeInterface} from '../types';

export enum TradeColorEnum {
  BLUE = 'blue-500',
  RED = 'red-500',
  YELLOW = 'yellow-500',
  GREEN = 'green-500',
  ORANGE = 'orange-500',
  PURPLE = 'purple-500',
}

@Entity()
export class Trades implements TradeInterface {

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: [
      'blue-500',
      'red-500',
      'yellow-500',
      'green-500',
      'orange-500',
      'purple-500'
    ],
    default: TradeColorEnum.GREEN,
  })
  color: [keyof typeof TradeColorEnum];
}
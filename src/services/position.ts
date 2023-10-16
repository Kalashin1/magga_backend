import { Position as PositionType } from "../types";
import { Position } from "../entity/position";
import { AppDataSource } from "../data-source";
import { ObjectId } from "mongodb";
import tradeService from "./trades";

export type CreatePositionParams = Omit<PositionType, 'trade'> & Partial<{ trade: string}> 

export class PositionService {
  async createPosition({
    external_id,
    crowd,
    trade,
    price,
    shortText
  }:CreatePositionParams) {
    const _trade = tradeService.retrieveTrade(trade);
    if (!_trade) throw Error("No trade with that Id");
    const position = AppDataSource.mongoManager.create(Position, {
      price,
      crowd,
      trade,
      shortText,
      external_id,
    });
    await AppDataSource.mongoManager.save(Position, position);
    return position;
  }

  async getPositions(trade_id: string) {
    const positions = await AppDataSource.mongoManager.find(Position, {
      where: {
        trade: new ObjectId(trade_id),
      },
    });
    return positions;
  }

  async getPositionById(posiiton_id: string) {
    const position = await AppDataSource.mongoManager.findOne(Position, {
      where: {
        _id: new ObjectId(posiiton_id),
      },
    });
    return position;
  }
}

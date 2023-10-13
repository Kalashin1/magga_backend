import { Position } from "../entity/position";
import { AppDataSource } from "../data-source";
import { ObjectId } from "mongodb";
import { TradeService } from "./trades";

const tradeService = new TradeService();

export class PositionService {
  async createPosition(
    external_id: string,
    trade: string,
    shortText: string,
    crowd: string,
    price: number
  ) {
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

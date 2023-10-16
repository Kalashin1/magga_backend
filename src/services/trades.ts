import { ObjectId } from "mongodb";
import { AppDataSource } from "../data-source";
import { TradeColorEnum, Trades } from "../entity/trades";
import { User } from "../entity/User";
import { NotificationService } from "./notifications";
import { Position } from "../types";
import { CreatePositionParams, PositionService } from "./position";


const positionService = new PositionService();
export class TradeService {
  async createNewTradeService(
    name: string,
    color: TradeColorEnum,
    positions?: CreatePositionParams[]
  ) {
    const trade = await AppDataSource.mongoManager.create(Trades, {
      color: color,
      name,
    });
    await AppDataSource.mongoManager.save(trade);
    const positionsArray = positions && await Promise.all(
      positions.map(
        async (position) => await positionService.createPosition(position)
      )
    );
    return {trade, positionsArray};
  }

  async addPositions(positions: CreatePositionParams[]){
    const positionsArray = await Promise.all(
      positions.map(
        async (position) => await positionService.createPosition(position)
      )
    );
    return positionsArray;
  }

  async editTradeService(name: string, color: TradeColorEnum, _id: string) {
    console.log(color, name);
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {
      _id: new ObjectId(_id),
    });
    trade.color = color;
    trade.name = name;
    await AppDataSource.mongoManager.save(Trades, trade);
    return trade;
  }

  async deleteTrade(_id: string) {
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {
      _id: new ObjectId(_id),
    });
    await AppDataSource.mongoManager.deleteOne(Trades, {
      _id: new ObjectId(_id),
    });
    return trade;
  }

  async retrieveTrade(_id: string) {
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {
      _id: new ObjectId(_id),
    });
    return trade;
  }

  async retrieveAllTrades() {
    return await AppDataSource.mongoManager.find(Trades);
  }
}

const tradeService = new TradeService();

export default tradeService;
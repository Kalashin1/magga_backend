import { ObjectId } from "typeorm";
import { AppDataSource } from "../data-source";
import { TradeColorEnum, Trades } from "../entity/trades";

export class TradeService {
  async createNewTradeService(name: string, color: [keyof typeof TradeColorEnum]) {
    const trade = await AppDataSource.mongoManager.create(Trades, {
      color: color,
      name,
    });

    return trade;
  }

  async editTradeService(
    name: string,
    color: [keyof typeof TradeColorEnum],
    _id: string
  ) {
    const trade = await AppDataSource.mongoManager.findOneAndUpdate(Trades, {
     _id: new ObjectId(_id)
    }, {
      name,
      color
    });
    return trade;
  }

  async deleteTrade(
    _id: string,
  ) {
    const trade = await AppDataSource.mongoManager.findOneAndDelete(Trades, {_id});
    return trade;
  }

  async retrieveTrade(
    _id: string,
  ) {
    const trade = await AppDataSource.mongoManager.findOneAndDelete(Trades, {_id});
    return trade;
  }

  async retrieveAllTrades() {
    return await AppDataSource.mongoManager.find(Trades, {});
  }

}

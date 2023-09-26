import { ObjectId } from "mongodb";
import { AppDataSource } from "../data-source";
import { TradeColorEnum, Trades } from "../entity/trades";
import { User } from "../entity/User";

export class TradeService {
  async createNewTradeService(name: string, color: TradeColorEnum) {
    const trade = await AppDataSource.mongoManager.create(Trades, {
      color: color,
      name,
    });
    await AppDataSource.mongoManager.save(trade);
    return trade;
  }

  async editTradeService(
    name: string,
    color: TradeColorEnum,
    _id: string
  ) {
    console.log(color, name);
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {
     _id: new ObjectId(_id)
    });
    trade.color = color;
    trade.name = name;
    await AppDataSource.mongoManager.save(Trades, trade)
    return trade;
  }

  async deleteTrade(
    _id: string,
  ) {
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {_id: new ObjectId(_id)});
    await AppDataSource.mongoManager.deleteOne(Trades, {_id: new ObjectId(_id)}) 
    return trade;
  }

  async retrieveTrade(
    _id: string,
  ) {
    const trade = await AppDataSource.mongoManager.findOneBy(Trades, {_id: new ObjectId(_id)});
    return trade;
  }

  async retrieveAllTrades() {
    return await AppDataSource.mongoManager.find(Trades);
  }

}

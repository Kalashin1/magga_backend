import { AppDataSource } from "../data-source";
import { Contract } from "../entity/contract";
import { Position } from "../entity/position";
import { PositionService } from "./position";
import { UserService } from "./user";
import {CONTRACT_STATUS} from '../types'
import { TradeService } from "./trades";

const userService = new UserService();
const positionService = new PositionService();
const tradeService = new TradeService()

export class ContractService {
  async createContract(
    executor_id: string,
    contractor_id: string,
    position_ids: string[],
    trade_id: string
  ) {
    const executor = await userService.getUser({ _id: executor_id });
    const contractor = await userService.getUser({ _id: contractor_id });
    const positions = await Promise.all(
      position_ids.map((position_id) =>
        positionService.getPositionById(position_id)
      )
    );
    const trade = await tradeService.retrieveTrade(trade_id);
    const contract = AppDataSource.mongoManager.create(Contract, {
      executor,
      contractor,
      positions,
      status: CONTRACT_STATUS[0],
      trade
    });
    await AppDataSource.mongoManager.save(Contract, contract);
    return contract
  }
}

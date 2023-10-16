import { AppDataSource } from "../data-source";
import { Contract } from "../entity/contract";
import { PositionService } from "./position";
import { UserService } from "./user";
import { CONTRACT_STATUS, ContractFunctions } from "../types";
import { TradeService } from "./trades";
import { ObjectId } from "mongodb";
import { NotificationService } from "./notifications";

const userService = new UserService();
const positionService = new PositionService();
const tradeService = new TradeService();
const notificationService = new NotificationService();

export type CreateContractParam = {
  executor_id: string;
  contractor_id: string;
  position_ids: string[];
  trade_id: string;
};

export type GetContractParams = {
  contractor: string;
  executor: string;
  status?: (typeof CONTRACT_STATUS)[number];
};

export class ContractService implements ContractFunctions {
  async send(executorId: string, contract_id: string) {
    const executor = await userService.getUser({ _id: executorId });
    const contract = await this.getContractById(contract_id);
    contract.executor = executor._id.toString();
    await this.saveContract(contract);
    return contract;
  }

  async createContract({
    contractor_id,
    executor_id,
    position_ids,
    trade_id,
  }: CreateContractParam) {
    const executor = await userService.getUser({ _id: executor_id });
    const contractor = await userService.getUser({ _id: contractor_id });
    const positions = await Promise.all(
      position_ids.map((position_id) =>
        positionService.getPositionById(position_id)
      )
    );
    const trade = await tradeService.retrieveTrade(trade_id);
    const contract = AppDataSource.mongoManager.create(Contract, {
      executor: executor._id.toString(),
      contractor: contractor._id.toString(),
      positions,
      status: CONTRACT_STATUS[0],
      trade: trade._id.toString(),
    });
    await this.saveContract(contract);
    await notificationService.create(
      `You have successfully generated and sent contract to ${executor.first_name}`,
      "Contract",
      contractor_id
    );
    await notificationService.create(
      `You have been sent this contract by ${contractor.first_name}`,
      "Contract",
      executor_id
    );
    return contract;
  }

  async getContractById(contract_id: string) {
    return await AppDataSource.mongoManager.findOne(Contract, {
      where: {
        _id: new ObjectId(contract_id),
      },
    });
  }

  async getContract({ contractor, executor, status }: GetContractParams) {
    return await AppDataSource.mongoManager.findOne(Contract, {
      where: {
        contractor,
        executor,
        status: status ?? CONTRACT_STATUS[1],
      },
    });
  }

  async accept({
    executor_id,
    contract_id,
  }: {
    executor_id: string;
    contract_id: string;
  }) {
    const executor = await userService.getUser({
      _id: new ObjectId(executor_id),
    });
    if (!executor) throw Error("executor not found");
    const contract = await this.getContractById(contract_id);
    if (!contract) throw Error("Contract not found");
    contract.executor = executor._id.toString();
    contract.status = CONTRACT_STATUS[1];
    const contractor = await userService.getUser({
      _id: contract.contractor,
    });
    // TODO: Get executor and contractor and notify them of acceptance
    await notificationService.create(
      `${executor.first_name} has accepted the contract`,
      "Contract",
      contractor._id.toString()
    );
    await notificationService.create(
      `You have accepted the contract sent by ${contractor.first_name}`,
      "Contract",
      executor_id
    );
    await this.saveContract(contract);
    return contract;
  }

  async terminateContract(contract_id: string) {
    const contract = await this.getContractById(contract_id);
    const contractor = await userService.getUser({
      _id: contract.contractor,
    });
    const executor = await userService.getUser({
      _id: contract.contractor,
    });
    await notificationService.create(
      `${executor.first_name} has terminated the contract`,
      "Contract",
      contractor._id.toString()
    );
    await notificationService.create(
      `You have terminated the contract sent by ${contractor.first_name}`,
      "Contract",
      executor._id.toString()
    );
    contract.status = CONTRACT_STATUS[3];
    await this.saveContract(contract);
    return contract;
  }

  async reject(executor_id: string, contract_id: string) {
    const executor = await userService.getUser({ _id: executor_id });
    if (!executor) throw Error("executor not found");
    const contract = await this.getContractById(contract_id);
    const contractor = await userService.getUser({
      _id: contract.contractor
    })
    // TODO: Get executor and contractor and notify them of acceptance
    await notificationService.create(
      `${executor.first_name} has rejected the contract`,
      'Contract',
      contractor._id.toString()
    )
    await notificationService.create(
      `You have rejected the contract sent by ${contractor.first_name}`,
      'Contract',
      executor_id
    )
    contract.status = CONTRACT_STATUS[2];
    await this.saveContract(contract);
    return contract;
  }

  async saveContract(contract: Contract) {
    return await AppDataSource.mongoManager.save(Contract, contract);
  }
}

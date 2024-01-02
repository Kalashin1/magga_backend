import { AppDataSource } from "../data-source";
import { Contract } from "../entity/contract";
import { PositionService } from "./position";
import { UserService } from "./user";
import { CONTRACT_STATUS, ContractFunctions, Position } from "../types";
import { TradeService } from "./trades";
import { ObjectId } from "mongodb";
import { NotificationService } from "./notifications";

const notificationService = new NotificationService();
const userService = new UserService(notificationService);
const positionService = new PositionService();
const tradeService = new TradeService();

export type CreateContractParam = {
  executor_id: string;
  contractor_id: string;
  positions: Position[];
  trade_id: string;
};

export type GetContractParams = {
  contractor: string;
  executor: string;
  status?: (typeof CONTRACT_STATUS)[number];
};

export class ContractService implements ContractFunctions {

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private positionService: PositionService,
    private tradeService: TradeService 
  ) {}

  async send(executorId: string, contract_id: string) {
    const executor = await this.userService.getUser({ _id: executorId });
    const contract = await this.getContractById(contract_id);
    contract.executor = executor._id.toString();
    await this.saveContract(contract);
    return contract;
  }

  async createContract({
    contractor_id,
    executor_id,
    positions,
    trade_id,
  }: CreateContractParam) {
    const executor = await this.userService.getUser({ _id: executor_id });
    const contractor = await this.userService.getUser({ _id: contractor_id });

    const trade = await this.tradeService.retrieveTrade(trade_id);
    const contract = AppDataSource.mongoManager.create(Contract, {});
    contract.executor = executor_id;
    const existingPositions = await this.positionService.getPositionsByContractor(contractor_id, trade_id);
    if (existingPositions[0]) {
      console.log('existing position')
      contract.positions = positions
    } else {
      const newPositions = await Promise.all(positions.map((position) => positionService.createPosition(position) ))
      console.log('new positions');
      contract.positions = newPositions
    }
    contract.contractor = contractor_id;
    contract.trade = trade._id.toString();
    contract.status = CONTRACT_STATUS[0];
    await this.saveContract(contract);

    await notificationService.create(
      `You have successfully generated and sent contract to ${executor.first_name}`,
      "Contract",
      contractor_id,
      contract._id.toString()
    );
    await notificationService.create(
      `You have been sent this contract by ${contractor.first_name}`,
      "Contract",
      executor_id,
      contract._id.toString()
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
    console.log("contractor", contractor);
    console.log("status", status);
    const _contracts = await AppDataSource.mongoManager.find(Contract, {
      where: {
        contractor,
        executor,
        status: {
          $eq: status,
        },
      },
    });
    const contracts = await Promise.all(
      _contracts.map(async (contract) => {
        const trade = await this.tradeService.retrieveTrade(contract.trade);
        const executor = await this.userService.getUser({ _id: contract.executor });
        const contractor = await this.userService.getUser({
          _id: contract.executor,
        });
        return { ...contract, trade, executor, contractor };
      })
    );
    return contracts;
  }

  async accept({
    executor_id,
    contract_id,
  }: {
    executor_id: string;
    contract_id: string;
  }) {
    const executor = await this.userService.getUser({
      _id: new ObjectId(executor_id),
    });
    if (!executor) throw Error("executor not found");
    const contract = await this.getContractById(contract_id);
    if (!contract) throw Error("Contract not found");
    contract.executor = executor._id.toString();
    contract.status = CONTRACT_STATUS[1];
    contract.acceptedAt = new Date().getTime()
    const contractor = await this.userService.getUser({
      _id: contract.contractor,
    });
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
    const contractor = await this.userService.getUser({
      _id: contract.contractor,
    });
    const executor = await this.userService.getUser({
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
    contract.terminatedAt = new Date().getTime();
    await this.saveContract(contract);
    return contract;
  }

  async reject(executor_id: string, contract_id: string) {
    const executor = await this.userService.getUser({ _id: executor_id });
    if (!executor) throw Error("executor not found");
    const contract = await this.getContractById(contract_id);
    const contractor = await this.userService.getUser({
      _id: contract.contractor,
    });
    await notificationService.create(
      `${executor.first_name} has rejected the contract`,
      "Contract",
      contractor._id.toString()
    );
    await notificationService.create(
      `You have rejected the contract sent by ${contractor.first_name}`,
      "Contract",
      executor_id
    );
    contract.status = CONTRACT_STATUS[2];
    contract.rejectedAt = new Date().getTime();
    await this.saveContract(contract);
    return contract;
  }

  async saveContract(contract: Contract) {
    return await AppDataSource.mongoManager.save(Contract, contract);
  }
}

const contractService = new ContractService(
  notificationService,
  userService,
  positionService,
  tradeService
);
export default contractService;
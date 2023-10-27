import { Request, Response } from "express";
import { ContractService } from "../../services/contract";
import tradeService from "../../services/trades";
import userService from "../../services/user";

const contractService = new ContractService();

export const createContract = async (req: Request, res: Response) => {
  const { executor_id, contractor_id, positions, trade_id } = req.body;
  try {
    const contract = await contractService.createContract({
      executor_id,
      contractor_id,
      positions,
      trade_id,
    });
    return res.json(contract);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const getContractById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const contract = await contractService.getContractById(id);
    const trade = await tradeService.retrieveTrade(contract.trade);
    const executor = await userService.getUser({ _id: contract.executor });
    const contractor = await userService.getUser({ _id: contract.contractor });
    return res.json({ ...contract, trade, executor, contractor });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getContract = async (req: Request, res: Response) => {
  const { contractor, executor, status } = req.body;
  try {
    const contract = await contractService.getContract({
      contractor,
      executor,
      status,
    });
    return res.json(contract);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const acceptContract = async (req: Request, res: Response) => {
  const { executor_id, contract_id } = req.body;
  try {
    const contract = await contractService.accept({
      executor_id,
      contract_id,
    });
    const trade = await tradeService.retrieveTrade(contract.trade);
    const executor = await userService.getUser({ _id: contract.executor });
    const contractor = await userService.getUser({ _id: contract.contractor });
    return res.json({ ...contract, trade, executor, contractor });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const rejectContract = async (req: Request, res: Response) => {
  const { executor_id, contract_id } = req.body;
  try {
    const contract = await contractService.reject(executor_id, contract_id);
    const trade = await tradeService.retrieveTrade(contract.trade);
    const executor = await userService.getUser({ _id: contract.executor });
    const contractor = await userService.getUser({ _id: contract.contractor });
    return res.json({ ...contract, trade, executor, contractor });
  } catch (error) {
    return res.json({ message: error.message });
  }
};


export const terminateContract = async (req: Request, res: Response) => {
  const { contract_id } = req.body;
  try {
    const contract = await contractService.terminateContract(contract_id);
    const trade = await tradeService.retrieveTrade(contract.trade);
    const executor = await userService.getUser({ _id: contract.executor });
    const contractor = await userService.getUser({ _id: contract.contractor });
    return res.json({ ...contract, trade, executor, contractor });
  } catch (error) {
    return res.json({ message: error.message });
  }
};
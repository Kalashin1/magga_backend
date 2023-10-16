import { Request, Response } from "express";
import { ContractService } from "../../services/contract";

const contractService = new ContractService();

export const createContract = async (req: Request, res: Response) => {
  const { executor_id, contractor_id, position_ids, trade_id } = req.body;
  try {
    const contract = await contractService.createContract({
      executor_id,
      contractor_id,
      position_ids,
      trade_id,
    });
    return res.json(contract);
  } catch (error) {
    return res.json({ message: error.message });
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
    return res.json({ message: error.message });
  }
};

export const acceptContract = async (req: Request, res: Response) => {
  const { executor_id, contract_id } = req.body;
  try {
    const response = await contractService.accept({
      executor_id,
      contract_id,
    });
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const rejectContract = async (req: Request, res: Response) => {
  const { executor_id, contract_id } = req.body;
  try {
    const response = await contractService.reject(executor_id, contract_id);
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};


export const terminateContract = async (req: Request, res: Response) => {
  const { contract_id } = req.body;
  try {
    const response = await contractService.terminateContract(contract_id);
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};
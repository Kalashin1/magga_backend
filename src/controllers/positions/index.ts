import { Request, Response } from "express";
import { PositionService } from "../../services/position";

const positionService = new PositionService()

export const getPostionByTrade = async (req: Request, res: Response) => {
  const {trade_id} = req.params;
  try {
    const positions = await positionService.getPositions(trade_id);
    return res.json(positions);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getPosition = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const positions = await positionService.getPositionById(id);
    return res.json(positions);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
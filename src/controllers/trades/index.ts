import { Request, Response } from "express";
import {TradeService} from '../../services/trades'; 

const tradeService = new TradeService()

export const createTrade = async (req: Request, res: Response) => {
  const {name, color, positions} = req.body;
  try {
    const trade = await tradeService.createNewTradeService(name, color, positions)
    return res.json(trade);
  } catch (error) {
    return res.status(400).json(error)
  }
}

export const addTrades = async (req: Request, res: Response) => {
  const {positions} = req.body;
  try {
    const positionsArray = await tradeService.addPositions(positions)
    return res.json(positionsArray);
  } catch (error) {
    return res.status(400).json(error)
  }
}

export const retrieveAllTrades = async (
  _: Request,
  res: Response
) => {
  try {
    const trades = await tradeService.retrieveAllTrades();
    return res.json(trades);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

export const retrieveTrade = async (
  req: Request, 
  res: Response
  ) => {
  const {id} = req.params;
  try {
    const trade = await tradeService.retrieveTrade(id);
    return res.json(trade);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

export const deleteTrade = async (
  req: Request,
  res: Response
) => {
  const {id} = await req.params;
  try {
    const trade = await tradeService.deleteTrade(id);
    return res.json(trade);
  } catch (error) {
    return res.status(400).json(error)
  }
}


export const editTrade = async (
  req: Request,
  res: Response
) => {
  const {id} = req.params;
  const {name, color} = req.body;
  try {
    const trade = await tradeService.editTradeService(name, color, id);
    return res.json(trade);
  } catch (error) {
    return res.status(400).json(error);
  }
  
}
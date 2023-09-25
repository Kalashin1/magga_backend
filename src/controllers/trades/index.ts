import { Request, Response } from "express";
import {TradeService} from '../../services/trades'; 

const tradeService = new TradeService()

export const createTrade = async (req: Request, res: Response) => {
  const {name, color} = req.body;
  try {
    const trade = await tradeService.createNewTradeService(name, color)
    return res.json(trade);
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
    return res.status(400).json(error);
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
    return res.status(400).json(error);
  }
}

export const deleteTrade = async (
  req: Request,
  res: Response
) => {
  const {id} = await req.params;
  try {
    const trade = await tradeService.deleteTrade(id);
    return trade;
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
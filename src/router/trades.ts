import { Router } from "express";
import {TRADE_ROUTES} from './routes'
import {
  createTrade,
  deleteTrade,
  editTrade,
  retrieveAllTrades,
  retrieveTrade,
  addTrades
} from "../controllers/trades";

const router = Router();

router.post(TRADE_ROUTES.TRADE, createTrade);
router.get(TRADE_ROUTES.TRADE, retrieveAllTrades);
router.get(TRADE_ROUTES.GET_TRADE, retrieveTrade);
router.patch(TRADE_ROUTES.GET_TRADE, editTrade);
router.delete(TRADE_ROUTES.GET_TRADE, deleteTrade);
router.patch(TRADE_ROUTES.TRADE, addTrades);

export default router;
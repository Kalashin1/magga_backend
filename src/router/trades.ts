import { Router } from "express";
import {TRADE_ROUTES} from './routes'
import {
  createTrade,
  deleteTrade,
  editTrade,
  retrieveAllTrades,
  retrieveTrade
} from "../controllers/trades";

const router = Router();

router.post(TRADE_ROUTES.TRADE, createTrade);
router.get(TRADE_ROUTES.TRADE, retrieveAllTrades);
router.get(TRADE_ROUTES.GET_TRADE, retrieveTrade);
router.patch(TRADE_ROUTES.GET_TRADE, editTrade);
router.delete(TRADE_ROUTES.GET_TRADE, deleteTrade);

export default router;
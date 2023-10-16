import { Router } from "express";
import { CONTRACT_ROUTES } from "./routes";
import {
  acceptContract,
  createContract,
  getContract,
  rejectContract,
  terminateContract,
} from "../controllers/contract";

const router = Router();

router.post(CONTRACT_ROUTES.CONTRACT, createContract);
router.get(CONTRACT_ROUTES.CONTRACT, getContract);
router.post(CONTRACT_ROUTES.ACCEPT_CONTRACT, acceptContract);
router.post(CONTRACT_ROUTES.REJECT_CONTRACT, rejectContract);
router.post(CONTRACT_ROUTES.TERMINATE_CONTRACT, terminateContract);

export default router;
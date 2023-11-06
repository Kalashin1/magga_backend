import { Router } from "express";
import { PROJECT_ROUTES } from "../routes";
import {
  assignExecutor,
  changeProjectStatus,
  getAllProjects,
  getContractProjects,
  getExecutorProjects,
  getProjectById,
  updateProject,
  addPositions,
  addShortageOrders,
  updateExtraPositions,
  addExtraOrders,
  updateProjectPosition,
  updateShortageOrder,
  createProject,
  getProjectByExternalId,
  acceptProject,
  rejectProject,
  updateProjectPositionsByTrade,
} from "../../controllers/projects";

const router = Router();

router.post(PROJECT_ROUTES.CREATE_PROJECT, createProject);
router.get(PROJECT_ROUTES.PROJECT_BY_ID, getProjectById);
router.get(PROJECT_ROUTES.ALL_PROJECTS, getAllProjects);
router.get(PROJECT_ROUTES.EXECUTOR_PROJECTS, getExecutorProjects);
router.get(PROJECT_ROUTES.CONTRACTOR_PROJECTS, getContractProjects);
router.get(PROJECT_ROUTES.PROJECT_BY_EXTERNAL_ID, getProjectByExternalId);
router.patch(PROJECT_ROUTES.PROJECT_STATUS, changeProjectStatus);
router.patch(PROJECT_ROUTES.ASSIGN_EXECUTOR, assignExecutor);
router.post(PROJECT_ROUTES.UPDATE_PROJECT, updateProject);
router.post(PROJECT_ROUTES.ADD_POSITION, addPositions);
router.post(PROJECT_ROUTES.ADD_SHORTAGE_POSITION, addShortageOrders);
router.post(PROJECT_ROUTES.ADD_EXTRA_POSITION, addExtraOrders);
router.patch(PROJECT_ROUTES.UPDATE_PROJECT_POSITION, updateProjectPosition);
router.patch(PROJECT_ROUTES.UPDATE_EXTRA_POSITION, updateExtraPositions);
router.patch(PROJECT_ROUTES.UPDATE_SHORTAGE_POSITION, updateShortageOrder);
router.patch(PROJECT_ROUTES.ACCEPT_PROJECT, acceptProject);
router.patch(PROJECT_ROUTES.REJECT_PROJECT, rejectProject);
router.patch(PROJECT_ROUTES.UPDATE_MULTIPLE_POSITIONS_BY_TRADE, updateProjectPositionsByTrade)

export default router;

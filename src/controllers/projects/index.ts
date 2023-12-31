import { Request, Response } from "express";
import projectService from "../../services/project";

export const createProject = async (req: Request, res: Response) => {
  const projectParam = req.body;
  try {
    const project = await projectService.createProject(projectParam);
    return res.json(project);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await projectService.getProjectById(id);
    return res.json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getProjectByExternalId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await projectService.getProjectByExternalId(id);
    return res.json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    return res.json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getExecutorProjects = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const executorProjects = await projectService.getExecutorProjects(id);
    return res.json(executorProjects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const acceptProject = async (req: Request, res: Response) => {
  const { project_id, executor_id, trades } = req.body;
  try {
    const payload = await projectService.acceptProject(
      project_id,
      executor_id,
      trades
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const rejectProject = async (req: Request, res: Response) => {
  const { project_id, executor_id, trades } = req.body;
  try {
    const payload = await projectService.rejectProject(
      project_id,
      executor_id,
      trades
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getContractProjects = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const projects = await projectService.getContractorProjects(id);
    console.log(projects);
    return res.json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const changeProjectStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const payload = await projectService.changeProjectStatus(id, status);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const assignExecutor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { executor_id, trades, contractor_id } = req.body;

  try {
    const payload = await projectService.assingExecutor(
      executor_id,
      id,
      trades,
      contractor_id
    );
    console.log("payload", payload);
    return res.json(payload);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const params = req.body;

  try {
    const payload = await projectService.updateProject(id, params);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProjectPositionsByTrade = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { trade, status } = req.body;

  try {
    const payload = await projectService.updateMultiplePositionByTrade(
      id,
      trade,
      status
    );
    console.log('payload', payload)
    return res.json(payload);
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message });
  }
};

export const addPositions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positions, trade_id } = req.body;

  try {
    const payload = await projectService.addPositions(id, positions, trade_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const addShortageOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shortageOrders, trade_id } = req.body;

  try {
    const payload = await projectService.addShortageOrders(
      id,
      shortageOrders,
      trade_id
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const addExtraOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positions, creator, acceptor, comment } = req.body;

  try {
    const payload = await projectService.addExtraOrders(
      id,
      positions,
      creator,
      acceptor,
      comment
    );
    return res.json(payload);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateProjectPosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { position, trade_id } = req.body;
  try {
    const payload = await projectService.updateProjectPosition(
      id,
      position,
      trade_id
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateExtraPositions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { position, trade_id, extraOrderId } = req.body;
  try {
    const payload = await projectService.updateExtraPosition(
      id,
      position,
      trade_id,
      extraOrderId
    );
    return res.json(payload);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateShortageOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { position, trade_id } = req.body;
  try {
    const payload = await projectService.updateShortageOrder(
      id,
      position,
      trade_id
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateMultiplePositionsStatus = async (
  req: Request,
  res: Response
) => {
  const { project_id, position_ids, status } = req.body;
  try {
    const payload = await projectService.updateMultiplePositionsStatus(
      project_id,
      position_ids,
      status
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const interactWithProjectAddendum = async (
  req: Request,
  res: Response
) => {
  const { user_id, addendum_id, project_id, action } = req.body;
  try {
    const payload = await projectService.interactWithExtraOrder(
      user_id,
      project_id,
      addendum_id,
      action
    );
    return res.json(payload);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateMultipleExtraOrderPositions = async (
  req: Request,
  res: Response
) => {
  const { project_id, positions, status, addendum_id } = req.body;
  try {
    const payload = await projectService.updateMultipleExtraOrderPositions({
      addendum_id,
      positions,
      project_id,
      status,
    });
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const billMultipleAddendums = async (req: Request, res: Response) => {
  const { addendum_ids, project_id, executor_id } = req.body;
  try {
    const payload = await projectService.billMultipleAddendums(
      addendum_ids,
      project_id,
      executor_id
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const getUserProjectStats = async (req: Request, res: Response) => {
  const {user_id} = req.params;
  try {
    console.log(user_id)
    const paylaod = await projectService.getUserProjectStats(user_id)
    return res.json(paylaod)
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message })
  }
}
import { Request, Response } from "express";
import { ProjectService } from "../../services/projects";

const projectService = new ProjectService();

export const createProject = async (req: Request, res: Response) => {
  const projectParam = req.body;
  try {
    const project = await projectService.createProject(projectParam);
    return res.json(project)
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message })
  }
}

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

export const getContractProjects = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const projects = await projectService.getContractorProjects(id);
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
  const { executor_ids } = req.body;

  try {
    const payload = await projectService.assingExecutor(executor_ids, id);
    return res.json(payload);
  } catch (error) {
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

export const addPositions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positions } = req.body;

  try {
    const payload = await projectService.addPositions(id, positions);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const addShortageOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shortageOrders } = req.body;

  try {
    const payload = await projectService.addShortageOrders(
      id,
      shortageOrders
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const addExtraOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positions } = req.body;

  try {
    const payload = await projectService.addExtraOrders(
      id,
      positions
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const updateProjectPosition = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {position} = req.body;
  try {
    const payload = await projectService.updateProjectPosition(id, position);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateExtraPositions = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {position} = req.body;
  try {
    const payload = await projectService.updateExtraPosition(id, position);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateShortageOrder = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {position} = req.body;
  try {
    const payload = await projectService.updateShortageOrder(id, position);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
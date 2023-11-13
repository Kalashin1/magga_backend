import { Request, Response } from "express";
import { MessageService } from "../../services/message";

export const createMessage = async (req: Request, res: Response) => {
  const { payload } = req.body;
  try {
    const message = await new MessageService().create(payload);
    return res.json(message);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getProjectMessage = async (req: Request, res: Response) => {
  const { project_id } = req.body;
  try {
    const message = await new MessageService().create(project_id);
    return res.json(message);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

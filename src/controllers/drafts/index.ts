import { Request, Response } from "express";
import { DraftSerVice } from "../../services/draft";


export const createDraft = async (req: Request, res: Response) => {
  const {payload} = req.body;
  try {
    const data = await new DraftSerVice().create(payload);
    return res.json(data);
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message })
  }
}

export const getUserDrafts = async (req: Request, res: Response) => {
  const {user_id} = req.params;
  try {
    const payload = await new DraftSerVice().getUserDrafts(user_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getReceipientDrafts = async (req: Request, res: Response) => {
  const {user_id} = req.params;
  try {
    const payload = await new DraftSerVice().getReceipientDrafts(user_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getDraftById = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const payload = await new DraftSerVice().getDraftById(id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateDraftStatus = async (req: Request, res: Response) => {
  const {draft_id} = req.params;
  const {status} = req.body;
  try {
    const payload = await new DraftSerVice().updateDraftStatus(draft_id, status);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
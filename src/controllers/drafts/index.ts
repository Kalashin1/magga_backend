import { Request, Response } from "express";
import draftSerVice from "../../services/draft";
import projectService from "../../services/project";
import userService  from "../../services/user";

export const createDraft = async (req: Request, res: Response) => {
  const { payload } = req.body;
  try {
    const data = draftSerVice.create(payload);
    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const getUserDrafts = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const drafts = draftSerVice.getUserDrafts(user_id);
    const payload = await Promise.all(
      drafts.map(async (draft) => {
        const project = projectService.getProjectById(
          draft.project
        );
        const owner = userService.getUser({ _id: draft.user_id });
        const reciepient = userService.getUser({
          _id: draft.reciepient,
        });
        return {
          ...draft,
          project,
          owner,
          reciepient,
        };
      })
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getReceipientDrafts = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const drafts = draftSerVice.getReceipientDrafts(user_id);
    const payload = await Promise.all(
      drafts.map(async (draft) => {
        const project = projectService.getProjectById(
          draft.project
        );
        const owner = userService.getUser({ _id: draft.user_id });
        const reciepient = userService.getUser({
          _id: draft.reciepient,
        });
        return {
          ...draft,
          project,
          owner,
          reciepient,
        };
      })
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDraftById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const draft = draftSerVice.getDraftById(id);
    return res.json(draft);
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: error.message });
  }
};

export const updateDraftStatus = async (req: Request, res: Response) => {
  const { draft_id } = req.params;
  const { status, timeline } = req.body;
  try {
    const payload = draftSerVice.updateDraftStatus(
      draft_id,
      status,
      timeline
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

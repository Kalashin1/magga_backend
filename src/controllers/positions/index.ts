import { Request, Response } from "express";
import { PositionService } from "../../services/position";
import storageService from "../../services/storage";

const positionService = new PositionService();

export const getPostionByTrade = async (req: Request, res: Response) => {
  const { trade_id } = req.params;
  try {
    const positions = await positionService.getPositions(trade_id);
    return res.json(positions);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const positions = await positionService.getPositionById(id);
    return res.json(positions);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const uploadPosition = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const imageMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const mimeType = imageMimeTypes.find((mT) => mT === req.file.mimetype);

  if (req.file && !mimeType) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.json({ message: "Only images allowed!" });
  }

  try {
    const {
      uploadParams: { Body },
    } = storageService.boostrapFile(req.file);
    // storage.parsePDF(Body);
    const payload = await positionService.parsePositionFile(user_id, Body);
    return res.json(payload)
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const deletePositions = async (req: Request, res: Response) => {
  const { trade_id, contractor_id } = req.body;
  try {
    const deletedPositions = await positionService.deletePositions(
      trade_id,
      contractor_id
    );
    return res.json(deletedPositions);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

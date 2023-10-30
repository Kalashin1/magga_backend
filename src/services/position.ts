import { Position as PositionType } from "../types";
import { Position } from "../entity/position";
import { AppDataSource } from "../data-source";
import { ObjectId } from "mongodb";
import tradeService from "./trades";
import userService from "./user";
import XLSX from "xlsx";

export type CreatePositionParams = Omit<PositionType, "trade"> &
  Partial<{ trade: string }>;

export class PositionService {
  async createPosition({
    external_id,
    crowd,
    trade,
    price,
    shortText,
    units,
    longText,
    contractor: contractor_id,
  }: CreatePositionParams) {
    const _trade = tradeService.retrieveTrade(trade);
    if (!_trade) throw Error("No trade with that Id");
    const contractor = await userService.getUser({ _id: contractor_id });
    if (!contractor) throw Error("Contractor with that id does not exist!");
    const position = AppDataSource.mongoManager.create(Position, {
      price,
      crowd,
      trade,
      shortText,
      external_id,
      longText,
      units,
      contractor: await contractor._id.toString(),
    });
    await AppDataSource.mongoManager.save(Position, position);
    return position;
  }

  async getPositionsByContractor(contractor_id: string, trade_id: string) {
    return await AppDataSource.mongoManager.find(Position, {
      where: {
        contractor: {
          $eq: contractor_id
        },
        trade: {
          $eq: trade_id
        }
      }
    })
  }

  async getPositionByExternalId(external_id: string) {
    return await AppDataSource.mongoManager.findOne(Position, {
      where: {
        external_id: {
          $eq: external_id
        }
      }
    })
  }

  async getPositions(trade_id: string) {
    const positions = await AppDataSource.mongoManager.find(Position, {
      where: {
        trade: {
          $eq: trade_id
        },
      },
    });
    return positions;
  }

  async getPositionById(posiiton_id: string) {
    const position = await AppDataSource.mongoManager.findOne(Position, {
      where: {
        _id: new ObjectId(posiiton_id),
      },
    });
    return position;
  }

  async assignContractorId(contractor_id: string, positions: PositionType[]) {
    const contractor = await userService.getUser({ _id: contractor_id });
    return positions.map(
      (position) => ({ ...position, contractor: contractor._id.toString()})
    );
  }

  async parsePositionFile(
    contractor: string,
    file: Buffer
  ): Promise<Partial<Position[]>> {
    const workbook = XLSX.read(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as Partial<PositionType[]>;
    const positions = await this.assignContractorId(contractor, data); 
    return positions
  }

  async deletePositions(
    trade_id:  string,
    contractor_id: string
  ) {
    const Positions = AppDataSource.getMongoRepository(Position);
    return await Positions.deleteMany({
      trade: {
        $eq: trade_id
      },
      contractor: {
        $eq: contractor_id
      }
    })
  }
}

const positionService = new PositionService();
export default positionService;
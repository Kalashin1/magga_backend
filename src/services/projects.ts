import { Project } from "../entity/project";
import { AppDataSource } from "../data-source";
import PdfParse from "pdf-parse";
import { translate } from "@vitalets/google-translate-api";
import pdfTextParser from "./pdf-text-parser";
import {
  Building,
  PROJECT_STATUS,
  ProjectPositions,
  createProjectParam,
  IProject,
  Position,
  CONTRACT_STATUS,
  Message,
} from "../types";
import userService from "./user";
import { PositionService } from "./position";
import { NotificationService } from "./notifications";
import { ObjectId } from "mongodb";
import { User } from "../entity/User";
import contractService from "./contract";
import tradeService from "./trades";
import draftService from "./draft";

let options = {
  pagerender: pdfTextParser.render_page,
};

const positionService = new PositionService();
const notificationService = new NotificationService();

export class ProjectService {
  async parsePDF(file: Buffer, id: string): Promise<Partial<Project>> {
    const parsedFile = await PdfParse(file, options);
    const { text } = await translate(parsedFile.text, {
      to: "en",
    });
    console.log("text", text);
    const client = pdfTextParser.getClientLines(text).join(".\n");
    const billingDetails = pdfTextParser.getBillingDetails(text).join(".\n");
    const missions = pdfTextParser.getMission(text);
    const orderNotes = pdfTextParser.getOrderNotes(text);
    const mainPositions = pdfTextParser.getOrderItems(text);
    const individualPositions = pdfTextParser.getIndividualItems(text);

    const _mainPositions = mainPositions.map((position) =>
      pdfTextParser.parseLineToPosition(position)
    );

    const positions: ProjectPositions[] = await Promise.all(
      _mainPositions.map(async (position, index) => ({
        status: "CREATED",
        billed: false,
        crowd: position.crowd,
        external_id: position.id,
        shortText: position.shortText,
        position: index + 1,
        longText: (
          await positionService.getPositionByExternalId(position.id)
        )?.longText,
        trade: (
          await positionService.getPositionByExternalId(position.id)
        )?.trade,
      }))
    );
    const _singlePositions = individualPositions.map((position) =>
      pdfTextParser.parseLineToPosition(position)
    );
    const singlePositions = await Promise.all(
      _singlePositions.map(async (position, index) => ({
        status: "CREATED",
        billed: false,
        crowd: position.crowd,
        external_id: position.id,
        shortText: position.shortText,
        longText: (
          await positionService.getPositionByExternalId(position.id)
        )?.longText,
        position: index + 1,
        trade: (
          await positionService.getPositionByExternalId(position.id)
        )?.trade,
      }))
    );
    const trades = await tradeService.retrieveAllTrades();
    const tradePositions = {};
    for (const trade of trades) {
      const filteredPosition = positions.filter(
        (pos) => pos.trade === trade._id.toString()
      );
      if (trade.name === "other") {
        tradePositions[`others`] = {
          positions: singlePositions,
          billed: false,
          id: trade._id.toString(),
          name: "others",
          accepted: false,
        };
      }
      tradePositions[`${trade.name}`] = {
        positions: filteredPosition,
        billed: false,
        id: trade._id.toString(),
        name: trade.name,
        accepted: false,
      };
    }
    const details = pdfTextParser.parseApartmentInfo(missions.join(".\n"));
    const notes = pdfTextParser.parseOrderNotes(orderNotes);

    parsedFile.text = text;
    return {
      external_id: details.mission.slice(0, 11),
      billingDetails,
      building: {
        address: details.address,
        location: details.location,
        description: details.details,
        notes: notes,
      },
      dueDate: details["end of execution"],
      rentalStatus: details["rental status"],
      positions: tradePositions,
      careTaker: pdfTextParser.parseCareTaker(
        details["caretaker"],
        details.tel
      ),
      commissioned_by: pdfTextParser.parseCommisioner(
        details["commissioned by"]
      ),
      contractor: id,
      status: PROJECT_STATUS[0],
      client,
    };
  }

  async createProject(params: Project) {
    const existingProject = await this.getProjectByExternalId(
      params.external_id
    );
    if (existingProject) {
      throw Error(
        "Project With that Id already exists, contact your contractor"
      );
    }
    const contractor = await userService.getUser({ _id: params.contractor });
    if (!contractor || contractor.role !== "contractor")
      throw Error("No contractor with that Id");
    const newProject = await AppDataSource.mongoManager.create(Project, params);
    const project = await this.saveProject(newProject);
    await notificationService.create(
      "New contract created successfully " + project._id.toString(),
      "PROJECT",
      contractor._id.toString(),
      project._id.toString()
    );
    const projects = contractor.projects ?? [];
    projects.push(project._id.toString());
    contractor.projects = projects;
    await AppDataSource.mongoManager.save(User, contractor);
    return project;
  }

  async acceptProject(
    project_id: string,
    executor_id: string,
    trades: string[]
  ) {
    const project = await projectService.getProjectById(project_id);
    if (!project) throw Error("No project with that ID!");
    const executor = await userService.getUser({ _id: executor_id });
    if (!executor) throw Error("No executor with that ID!");
    const contracts = await contractService.getContract({
      contractor: project.contractor,
      executor: executor_id,
      status: CONTRACT_STATUS[1],
    });
    const unAcceptedTrades: string[] = [];
    trades.forEach((trade) => {
      if (
        project.positions[trade] &&
        project.positions[trade].executor === executor_id
      ) {
        project.positions[trade].accepted = true;
        project.positions[trade].positions.forEach(async (position) => {
          const contract = contracts.find(
            (contract) => contract.trade._id.toString() === position.trade
          );
          if (contract) {
            const foundPosition = contract.positions.find(
              (_position) => _position.external_id === position.external_id
            );
            console.log("found position", foundPosition);
            position.price = foundPosition.price;
            position.units = foundPosition.units;
          }
        });
      }
      if (
        !project.positions[trade].accepted ||
        project.positions[trade].executor == null
      ) {
        unAcceptedTrades.push(trade);
      }
    });
    if (unAcceptedTrades.length < 1) {
      project.status = PROJECT_STATUS[2];
    }
    await notificationService.create(
      `Executor ${
        executor.first_name
      } has accepted the following positions; ${trades.join(", ")}`,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    await notificationService.create(
      `You have accepted the following positions`,
      "PROJECT",
      executor_id,
      project_id
    );
    return await this.saveProject(project);
  }

  async rejectProject(
    project_id: string,
    executor_id: string,
    trades: string[]
  ) {
    console.log("executor_id", executor_id);
    const project = await projectService.getProjectById(project_id);
    if (!project) throw Error("No project with that ID!");
    const executor = await userService.getUser({ _id: executor_id });
    if (!executor) throw Error("No executor with that ID!");
    console.log("trades", trades);
    for (const trade of trades) {
      if (
        project.positions[trade] &&
        project.positions[trade].executor === executor_id
      ) {
        console.log("assigned");
        project.positions[trade].accepted = false;
        project.executor = null;
        project.positions[trade].executor = null;
        project.positions[trade].positions.forEach((position) => {
          position.price = 0;
        });
      }
    }
    project.status = PROJECT_STATUS[0];
    const updatedProjectExecutors = project.executors.filter(
      (exe) => exe !== executor_id
    );
    project.executors = updatedProjectExecutors;
    const updatedExecutorProjects = executor.projects.filter(
      (project) => project !== project_id
    );
    executor.projects = updatedExecutorProjects;
    await notificationService.create(
      `Executor ${
        executor.first_name
      } has rejected the following positions; ${trades.join(", ")}`,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    await notificationService.create(
      `You have rejected the following positions`,
      "PROJECT",
      executor_id,
      project_id
    );
    await userService.save(executor);
    return await this.saveProject(project);
  }

  async updateMultiplePositionByTrade(
    project_id: string,
    trade: string,
    status: "BILLED" | "COMPLETED" | "NOT FEASIBLE"
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("project not found!");
    const postions = project.positions[trade];
    if (!postions) throw Error("positions not found");
    postions.positions.forEach((position) => {
      position.status = status;
      if (status === "BILLED") {
        position.billed = true;
      }
    });
    if (status === "BILLED" && postions.executor && postions.accepted) {
      postions.billed = true;
      const amount = postions.positions
        .map((position) => Number(position.price * parseFloat(position.crowd)))
        .reduce((prev, current) => prev + current);
      await draftService.create({
        amount: amount,
        positions: postions.positions.map((position) => position.external_id),
        project: project._id.toString(),
        user_id: postions.executor,
        reciepient: project.contractor,
      });
    }
    await notificationService.create(
      `You have ${status} the positions under ${trade}`,
      "PROJECT",
      postions.executor,
      project._id.toString()
    );
    await notificationService.create(
      `The positions under ${trade} has been ${status}`,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.positions[trade] = postions;
    return await this.saveProject(project);
  }

  getProjectById(id: string) {
    return AppDataSource.mongoManager.findOne(Project, {
      where: {
        _id: {
          $eq: new ObjectId(id),
        },
      },
    });
  }

  getProjectByExternalId(id: string) {
    return AppDataSource.mongoManager.findOne(Project, {
      where: {
        external_id: {
          $eq: id,
        },
      },
    });
  }

  async assingExecutor(
    executor_id: string,
    project_id: string,
    trades: string[],
    contractor_id: string
  ) {
    const executor = await userService.getUser({ _id: executor_id });
    const contractor = await userService.getUser({ _id: contractor_id });
    if (!executor) throw Error("error fetching executor");
    if (!contractor) throw Error("error fetching contractor");

    const project = await this.getProjectById(project_id);
    const contracts = await contractService.getContract({
      contractor: project.contractor,
      executor: executor_id,
      status: CONTRACT_STATUS[1],
    });
    for (const trade of trades) {
      if (project.positions[trade].executor)
        throw Error("Position already assinged!");
      project.positions[trade].executor = executor_id;

      console.log(project.positions[trade].positions);
    }
    const existingExecutors = project.executors ?? [];
    if (existingExecutors.find((exe) => exe === executor_id)) {
      console.log("already existing");
    } else {
      existingExecutors.push(executor_id);
    }
    const executorProjects = executor.projects ?? [];
    if (executorProjects.find((project) => project === project_id)) {
      console.log("already existing");
    } else {
      executorProjects.push(project._id.toString());
    }
    trades.forEach((trade) => {
      if (
        project.positions[trade] &&
        project.positions[trade].executor === executor_id
      ) {
        project.positions[trade].positions.forEach(async (position) => {
          const contract = contracts.find(
            (contract) => contract.trade._id.toString() === position.trade
          );
          if (contract) {
            const foundPosition = contract.positions.find(
              (_position) => _position.external_id === position.external_id
            );
            console.log("found position", foundPosition);
            position.price = foundPosition.price;
            position.units = foundPosition.units;
          }
        });
      }
    });
    await notificationService.create(
      "Project has been assigned to you",
      "PROJECT",
      executor._id.toString()
    );
    await AppDataSource.mongoManager.save(User, {
      ...executor,
      projects: executorProjects,
    });

    return await this.saveProject({
      ...project,
      executors: existingExecutors,
      status: PROJECT_STATUS[1],
    });
  }

  async changeProjectStatus(project_id: string, status: number) {
    const project = await this.getProjectById(project_id);
    project.status = PROJECT_STATUS[status];
    if (PROJECT_STATUS[status] === PROJECT_STATUS[1]) {
      project.construction_started = new Date().getTime();
    }

    if (PROJECT_STATUS[status] === PROJECT_STATUS[2]) {
      project.paused_at = new Date().getTime();
    }

    if (PROJECT_STATUS[status] === PROJECT_STATUS[3]) {
      project.completed_at = new Date().getTime();
    }

    if (PROJECT_STATUS[status] === PROJECT_STATUS[5]) {
      project.canceled_at = new Date().getTime();
    }
    const message = `Status of project ${project.external_id} has been updated. The project status is now ${PROJECT_STATUS[status]}`;
    await notificationService.create(
      message,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.executors.forEach(async (exe) => {
      await notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    return await this.saveProject(project);
  }

  async updateProject(
    project_id: string,
    { dueDate, construction_manager }: IProject
  ) {
    const project = await this.getProjectById(project_id);
    project.dueDate = dueDate;
    project.construction_manager = construction_manager;
    return await this.saveProject(project);
  }

  async addPositions(
    project_id: string,
    positions: ProjectPositions[],
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const extraPositions = project.positions;
    const trade = await tradeService.retrieveTrade(trade_id);
    for (let position of positions) {
      for (let extraPosition of extraPositions[trade.name].positions) {
        if (position._id === extraPosition._id)
          throw Error(`Position ${position.external_id} already exists`);
      }
    }
    extraPositions[trade.name].positions.push(...positions);
    project.positions = extraPositions;
    const message = `${positions.length} Extra positions has been added to project ${project.external_id}`;
    await notificationService.create(
      message,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.executors.forEach(async (exe) => {
      await notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    return await this.saveProject(project);
  }

  async addShortageOrders(
    project_id: string,
    shortageOrders: ProjectPositions[],
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const existingShortageOrders = project.shortagePositions;
    const trade = await tradeService.retrieveTrade(trade_id);
    for (let shortageOrder of shortageOrders) {
      for (let existingShortageOrder of existingShortageOrders[trade.name]
        .positions) {
        if (shortageOrder._id === existingShortageOrder._id)
          throw Error(
            `Position ${shortageOrder.external_id} has already been added to shortages`
          );
      }
    }

    existingShortageOrders[trade.name].positions.push(...shortageOrders);
    project.shortagePositions = existingShortageOrders;
    const message = `${shortageOrders.length} Extra positions has been added to project shortages ${project.external_id}`;
    await notificationService.create(
      message,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.executors.forEach(async (exe) => {
      await notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    return await this.saveProject(project);
  }

  async addExtraOrders(
    project_id: string,
    shortageOrders: ProjectPositions[],
    trade_id: string,
  ) {
    const project = await this.getProjectById(project_id);
    const existingShortageOrders = project.extraPositions ?? {};
    const projectPositions = project.positions;
    const trade = await tradeService.retrieveTrade(trade_id);
    for (let shortageOrder of shortageOrders) {
      if (existingShortageOrders[trade.name]) {
        for (let existingShortageOrder of existingShortageOrders[trade.name]
          .positions) {
          if (shortageOrder._id === existingShortageOrder._id)
            throw Error(
              `Position ${shortageOrder.external_id} has already been added to shortages`
            );
        }
      }
    }
    if(existingShortageOrders[trade?.name]){
      existingShortageOrders[trade?.name].positions.push(...shortageOrders); 
    } else {
      existingShortageOrders[trade?.name] = {
        billed: false,
        accepted: projectPositions[trade?.name].executor ? true : false,
        name: trade.name,
        contract: project?.positions[trade.name]?.contract,
        positions: [...shortageOrders],
        id: trade._id.toString(),
        executor: projectPositions[trade?.name].executor
      }
    }
    
    project.extraPositions = existingShortageOrders;
    const message = `${shortageOrders.length} Extra positions has been added to project position ${project.external_id}`;
    await notificationService.create(
      message,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.executors.forEach(async (exe) => {
      await notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    return await this.saveProject(project);
  }

  async getAllProjects() {
    return AppDataSource.mongoManager.find(Project, {});
  }

  async getContractorProjects(contractor_id: string) {
    return AppDataSource.mongoManager.find(Project, {
      where: {
        contractor: {
          $eq: contractor_id,
        },
      },
    });
  }

  async updateProjectPosition(
    project_id: string,
    position: ProjectPositions,
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const trade = await tradeService.retrieveTrade(trade_id);
    const existingPosition = project.positions[trade.name].positions.find(
      (pos) => pos.external_id === position.external_id
    );
    const filteredPositions = project.positions[trade.name].positions.filter(
      (pos) => pos.external_id !== existingPosition.external_id
    );
    project.positions[trade.name].positions = [...filteredPositions, position];
    console.log("position", position);
    return await this.saveProject(project);
  }

  async updateExtraPosition(
    project_id: string,
    position: ProjectPositions,
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const trade = await tradeService.retrieveTrade(trade_id);
    const existingPosition = project.extraPositions[trade.name].positions.find(
      (pos) => pos.external_id === position.external_id
    );
    if (!existingPosition) throw Error('position does not exist')
    const filteredPositions = project.extraPositions[trade.name].positions.filter(
      (pos) => pos._id !== position._id
    );
    project.extraPositions[trade.name].positions = [...filteredPositions, position];
    return await this.saveProject(project);
  }

  async addMessageToPosition(
    project_id: string,
    external_id: string,
    trade_id: string,
    message: Partial<Message>
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("project not found");
    const trade = await tradeService.retrieveTrade(trade_id);
    if (!trade) throw Error("Trade not found!");
    const postion = project.positions[trade.name].positions.find(
      (position) => position.external_id === external_id
    );
    if (!postion) throw Error("position");
  }

  async updateShortageOrder(
    project_id: string,
    position: ProjectPositions,
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const trade = await tradeService.retrieveTrade(trade_id);
    const existingPosition = project.shortagePositions[
      trade.name
    ].positions.find((pos) => pos._id === existingPosition._id);
    const filteredPositions = project.positions[trade.name].positions.filter(
      (pos) => pos._id !== position._id
    );
    project.shortagePositions[trade.name].positions = [
      ...filteredPositions,
      position,
    ];
    return await this.saveProject(project);
  }

  async getExecutorProjects(executor_id: string) {
    const executor = await userService.getUser({ _id: executor_id });
    const existingProjects = executor.projects ?? [];
    const projects = await Promise.all(
      existingProjects.map((project) => this.getProjectById(project))
    );
    return projects;
  }

  saveProject(project: Project) {
    return AppDataSource.mongoManager.save(Project, project);
  }
}

const projectService = new ProjectService();

export default projectService;

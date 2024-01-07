import { Project } from "../../entity/project";
import { AppDataSource } from "../../data-source";
import PdfParse from "pdf-parse";
import { translate } from "@vitalets/google-translate-api";
import pdfTextParser, { PDFTextParser } from "../pdf-text-parser";
import {
  Building,
  PROJECT_STATUS,
  ProjectPositions,
  createProjectParam,
  IProject,
  Position,
  CONTRACT_STATUS,
  Message,
  ExtraProjectPositionSuper,
  TradeSchedule,
  TASK_STATUS,
  TASK_TYPE,
} from "../../types";
import userService, { UserService } from "../user";
import positionService, { PositionService } from "../position";
import notificationService, { NotificationService } from "../notifications";
import { ObjectId } from "mongodb";
import { User } from "../../entity/User";
import contractService, { ContractService } from "../contract";
import tradeService, { TradeService } from "../trades";
import draftService, { DraftSerVice } from "../draft";
import todoService, { TodoService } from "../todo";

let options = {
  pagerender: pdfTextParser.render_page,
};

export class ProjectService {
  constructor(
    private contractService: ContractService,
    private tradeService: TradeService,
    private draftService: DraftSerVice,
    private todoService: TodoService,
    private userService: UserService,
    private positionService: PositionService,
    private notificationService: NotificationService,
    private pdfTextParser: PDFTextParser
  ) {}
  async parsePDF(file: Buffer, id: string): Promise<Partial<Project>> {
    const parsedFile = await PdfParse(file, options);
    const { text } = await translate(parsedFile.text, {
      to: "en",
    });
    const client = this.pdfTextParser.getClientLines(text).join(".\n");
    const billingDetails = this.pdfTextParser
      .getBillingDetails(text)
      .join(".\n");
    const missions = this.pdfTextParser.getMission(text);
    const orderNotes = this.pdfTextParser.getOrderNotes(text);
    const mainPositions = this.pdfTextParser.getOrderItems(text);
    const individualPositions = this.pdfTextParser.getIndividualItems(text);

    const _mainPositions = mainPositions.map((position) =>
      this.pdfTextParser.parseLineToPosition(position)
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
          await this.positionService.getPositionByExternalId(position.id)
        )?.longText,
        trade: (
          await this.positionService.getPositionByExternalId(position.id)
        )?.trade,
      }))
    );
    const _singlePositions = individualPositions.map((position) =>
      this.pdfTextParser.parseLineToPosition(position)
    );
    const singlePositions = await Promise.all(
      _singlePositions.map(async (position, index) => ({
        status: "CREATED",
        billed: false,
        crowd: position.crowd,
        external_id: position.id,
        shortText: position.shortText,
        longText: (
          await this.positionService.getPositionByExternalId(position.id)
        )?.longText,
        position: index + 1,
        trade: (
          await this.positionService.getPositionByExternalId(position.id)
        )?.trade,
      }))
    );
    const trades = await this.tradeService.retrieveAllTrades();
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
    const details = this.pdfTextParser.parseApartmentInfo(missions.join(".\n"));
    const notes = this.pdfTextParser.parseOrderNotes(orderNotes);

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
      careTaker: this.pdfTextParser.parseCareTaker(
        details["caretaker"],
        details.tel
      ),
      commissioned_by: this.pdfTextParser.parseCommisioner(
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
    const allProjects = await AppDataSource.mongoManager.find(Project, {})
    if (existingProject) {
      throw Error(
        "Project With that Id already exists, contact your contractor"
      );
    }
    const contractor = await this.userService.getUser({
      _id: params.contractor,
    });
    if (!contractor || contractor.role !== "contractor")
      throw Error("No contractor with that Id");
    const newProject = await AppDataSource.mongoManager.create(Project, {
      ...params,
      projectNumber: allProjects.length + 1
    });
    const project = await this.saveProject(newProject);
    await this.todoService.create(
      {
        user_id: contractor._id.toString(),
        type: TASK_TYPE[0],
        description: 'You have created a new Project, You need to assign it to an executor.',
        object_id: project._id.toString(),
        status: TASK_STATUS[0]
      }
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
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("No project with that ID!");
    const executor = await this.userService.getUser({ _id: executor_id });
    if (!executor) throw Error("No executor with that ID!");
    const contracts = await this.contractService.getContract({
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
            position.price = foundPosition.price;
            position.units = foundPosition.units;
            position.status = "ACCEPTED";
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
    await this.notificationService.create(
      `Executor ${
        executor.first_name
      } has accepted the following positions; ${trades.join(", ")}.`,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    return await this.saveProject(project);
  }

  async rejectProject(
    project_id: string,
    executor_id: string,
    trades: string[]
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("No project with that ID!");
    const executor = await this.userService.getUser({ _id: executor_id });
    if (!executor) throw Error("No executor with that ID!");
    for (const trade of trades) {
      if (
        project.positions[trade] &&
        project.positions[trade].executor === executor_id
      ) {
        project.positions[trade].accepted = false;
        project.executor = null;
        project.positions[trade].executor = null;
        project.positions[trade].positions.forEach((position) => {
          position.price = 0;
          position.status = "CREATED";
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
    await this.notificationService.create(
      `Executor ${
        executor.first_name
      } has rejected the following positions; ${trades.join(", ")}`,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    await this.userService.save(executor);
    return await this.saveProject(project);
  }

  async updateMultiplePositionByTrade(
    project_id: string,
    trades: string[],
    status: "BILLED" | "COMPLETED" | "NOT FEASIBLE"
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("project not found!");
    const _positions: {
      [key: string]: ProjectPositions[];
    } = {};
    let draf_addendums: {
      [key: string]: ProjectPositions[];
    } = {};
    let _amount = 0;
    trades.forEach(async (trade) => {
      const postions = project.positions[trade];
      // get addendudms
      const addendums = project.extraPositions;
      addendums?.forEach((addendum) => {
        if (addendum.positions[trade]) {
          addendum?.positions[trade]?.positions?.forEach((position) => {
            if (status === "BILLED" || status === "COMPLETED") {
              this.requiredPositions.forEach((reqPos) => {
                if (
                  position.external_id === reqPos &&
                  !position.documentURL?.length
                ) {
                  throw Error(
                    "You need to upload a document to this position before you can bill or complete it"
                  );
                }
              });
              position.billed = true;
            }
            position.status = status;
            if (
              status == "BILLED" &&
              addendum.positions[trade].executor &&
              addendum.positions[trade].accepted
            ) {
              position.billed = true;
              position.status = "BILLED";
              addendum.positions[trade].billed = true;
              _amount += addendum.positions[trade].positions
                .map((position) =>
                  Number(position.price * parseFloat(position.crowd))
                )
                .reduce((prev, current) => prev + current);
            }
          });
          if (status === "BILLED") {
            draf_addendums[addendum.id] = addendum.positions[trade].positions;
          }
          addendum.positions[trade].status = status;
        }
      });
      if (!postions) throw Error("positions not found");
      postions.positions.forEach((position) => {
        position.status = status;
        if (status === "BILLED" || status === "COMPLETED") {
          this.requiredPositions.forEach((reqPos) => {
            if (
              position.external_id === reqPos &&
              !position.documentURL?.length
            ) {
              throw Error(
                "You need to upload a document to this position before you can bill it"
              );
            }
          });
          position.billed = true;
        }
      });
      if (status === "BILLED") {
        postions.billed = true;
        _amount += postions.positions
          .map((position) =>
            Number(position.price * parseFloat(position.crowd))
          )
          .reduce((prev, current) => prev + current);
      }
      _positions[trade] = postions.positions;
      postions.status = status;
     
      await this.notificationService.create(
        `The positions under ${trade} has been ${status}`,
        "PROJECT",
        project.contractor,
        project._id.toString()
      );
      project.positions[trade] = postions;
    });
    let timeline: Required<Pick<TradeSchedule, "startDate" | "endDate">>;
    if (status === "BILLED") {
      if (trades.length === 1) {
        //@ts-ignore
        timeline = project.sheduleByTrade.find(
          (schedule) => schedule.name === trades[0]
        );
      } else if (trades.length > 1) {
        timeline = {
          startDate: project?.sheduleByTrade?.find(
            (schedule) => schedule.name === trades[0]
          ).startDate,
          endDate: project?.sheduleByTrade?.find(
            (schedule) => schedule.name === trades[trades.length - 1]
          ).endDate,
        };
      }
      await this.saveProject(project);
      return await this.draftService.create({
        amount: _amount,
        positions: _positions,
        addendums: { ...draf_addendums },
        project: project._id.toString(),
        user_id: project.positions[trades[0]].executor,
        reciepient: project.contractor,
        timeline: timeline,
      });
    }
    const project_trade = Object.keys(project.positions);
    for (let i = 0; i < project_trade.length; i++) {
      if (
        !project.positions[project_trade[i]].billed ||
        project.positions[project_trade[i]].status !== "COMPLETED"
      ) {
        continue;
      }
      if (
        i === project_trade.length - 1 &&
        (project.positions[project_trade[i]].billed ||
          project.positions[project_trade[i]].status === "COMPLETED")
      )
        await this.changeProjectStatus(project._id.toString(), 4);
    }
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
    const executor = await this.userService.getUser({ _id: executor_id });
    const contractor = await this.userService.getUser({ _id: contractor_id });
    if (!executor) throw Error("error fetching executor");
    if (!contractor) throw Error("error fetching contractor");

    const project = await this.getProjectById(project_id);
    const contracts = await this.contractService.getContract({
      contractor: project.contractor,
      executor: executor_id,
      status: CONTRACT_STATUS[1],
    });
    for (const trade of trades) {
      if (project.positions[trade].executor)
        throw Error("Position already assinged!");
      project.positions[trade].executor = executor_id;
    }
    const existingExecutors = project.executors ?? [];
    if (existingExecutors.find((exe) => exe === executor_id)) {
      
    } else {
      existingExecutors.push(executor_id);
    }
    const executorProjects = executor.projects ?? [];
    if (executorProjects.find((project) => project === project_id)) {
      
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
            position.price = foundPosition.price;
            position.units = foundPosition.units;
            position.status = "ASSIGNED";
          }
        });
      }
    });
    await AppDataSource.mongoManager.save(User, {
      ...executor,
      projects: executorProjects,
    });
    await this.todoService.create({
      type: TASK_TYPE[0],
      description: `You have been assigned some positions on project ${project._id}`,
      status: TASK_STATUS[0],
      user_id: executor_id,
      object_id: project._id.toString(),
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
    project.executors.forEach(async (exe) => {
      await this.todoService.create({
        user_id: exe,
        object_id: project_id,
        type: TASK_TYPE[0],
        status: TASK_STATUS[0],
        description: message
      });
    });
    return await this.saveProject(project);
  }

  async updateProject(
    project_id: string,
    { dueDate, construction_manager, sheduleByTrade }: IProject
  ) {
    const project = await this.getProjectById(project_id);
    project.dueDate = dueDate;
    project.construction_manager = construction_manager;
    project.sheduleByTrade = sheduleByTrade;
    await this.notificationService.create(
      "Project has been updated",
      "PROJECT",
      project.contractor,
      project_id
    );
    for (const executor of project.executors) {
      await this.notificationService.create(
        "Project has been updated",
        "PROJECT",
        executor,
        project_id
      );
    }
    return await this.saveProject(project);
  }

  async addPositions(
    project_id: string,
    positions: ProjectPositions[],
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const extraPositions = project.positions;
    const trade = await this.tradeService.retrieveTrade(trade_id);
    for (let position of positions) {
      for (let extraPosition of extraPositions[trade.name].positions) {
        if (position._id === extraPosition._id)
          throw Error(`Position ${position.external_id} already exists`);
      }
    }
    extraPositions[trade.name].positions.push(...positions);
    project.positions = extraPositions;
    const message = `${positions.length} Extra positions has been added to project ${project.external_id}`;
    
    project.executors.forEach(async (exe) => {
      await this.notificationService.create(
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
    const trade = await this.tradeService.retrieveTrade(trade_id);
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
    
    project.executors.forEach(async (exe) => {
      await this.notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    return await this.saveProject(project);
  }

  async interactWithExtraOrder(
    user_id: string,
    project_id: string,
    addendum_id: string,
    action: "ACCEPT" | "REJECT"
  ) {
    const user = await this.userService.getUser({ _id: user_id });
    if (!user) throw Error("user not found");
    const project = await this.getProjectById(project_id);

    if (!project) throw Error("Project not found");

    const addendum = project.extraPositions.find(
      (position) => position.id === addendum_id
    );

    if (!addendum) throw Error("Addendum not found");

    if (addendum.acceptedAt) {
      throw Error("You have already interacted with this addendum");
    }

    if (addendum.createdBy._id === user?._id.toString()) {
      throw Error("You created this addendum, you cannot interact with it");
    }

    if (addendum.acceptedBy._id !== user?._id.toString())
      throw Error("You cannot interact with this addendum");

    if (action === "ACCEPT") {
      addendum.acceptedAt = new Date().getTime();
      addendum.acceptedBy = {
        _id: user?._id.toString(),
        role: user?.role,
      };
      const filteredProjects = project.extraPositions.filter(
        (extraPosition) => extraPosition.id !== addendum_id
      );
      for (const key in addendum.positions) {
        for (const position of addendum.positions[key].positions) {
          position.status = "ACCEPTED";
        }
      }
      project.extraPositions = [...filteredProjects, addendum];
    }

    if (action === "REJECT") {
      const filteredProjects = project.extraPositions.filter(
        (extraPosition) => extraPosition.id !== addendum_id
      );
      project.extraPositions = filteredProjects;
    }
    await this.notificationService.create(
      `Addendum has been ${action}ED by ${user.first_name}`,
      "PROJECT",
      addendum.createdBy?._id,
      project._id.toString()
    );
    await this.notificationService.create(
      `You have ${action}ED this project.`,
      "PROJECT",
      user._id.toString(),
      project._id.toString()
    );
    return this.saveProject(project);
  }

  async addExtraOrders(
    project_id: string,
    shortageOrders: ProjectPositions[],
    creator_id: string,
    acceptor_id: string,
    comment: string
  ) {
    const project = await this.getProjectById(project_id);
    const existingShortageOrders = project.extraPositions ?? [];

    const creator = await this.userService.getUser({ _id: creator_id });
    const acceptor = await this.userService.getUser({ _id: acceptor_id });
    if (!creator) throw Error("No user with that id");
    if (!acceptor) throw Error("No user with that Id, acceptor");
    const trades = await Promise.all(
      shortageOrders.map((shortageOrder) =>
        tradeService.retrieveTrade(shortageOrder.trade)
      )
    );
    const extraPosition: ExtraProjectPositionSuper = {
      createdAt: new Date().getTime(),
      id: new ObjectId().toString(),
      createdBy: {
        _id: creator_id,
        role: creator.role,
      },
      acceptedBy: {
        _id: acceptor_id,
        role: acceptor.role,
      },
      comment,
      positions: {},
    };
    trades.forEach((trade) => {
      extraPosition.positions[trade.name] = {
        billed: false,
        accepted: false,
        name: trade.name,
        status: "CREATED",
        contract: project?.positions[trade.name]?.contract,
        positions: [...shortageOrders],
        id: trade._id.toString(),
        executor: acceptor.role === "executor" ? acceptor_id : creator_id,
      };
    });
    existingShortageOrders.push(extraPosition);
    project.extraPositions = existingShortageOrders;
    const message = `${shortageOrders.length} Extra positions has been added to project position ${project.external_id}`;
    await this.notificationService.create(
      message,
      "PROJECT",
      project.contractor,
      project._id.toString()
    );
    project.executors.forEach(async (exe) => {
      await this.notificationService.create(
        message,
        "PROJECT",
        exe,
        project._id.toString()
      );
    });
    await this.todoService.create({
      type: "PROJECT_ASSIGNMENT",
      description: `You have been assigned some extra positions on project ${project._id}`,
      status: TASK_STATUS[0],
      user_id: project.contractor,
      object_id: project._id.toString(),
      assignedTo: acceptor.role === "executor" ? acceptor_id : creator_id,
    });
    await this.saveProject(project);
    return extraPosition;
  }

  async updateExtraOrder({
    order_id,
    project_id,
    fileURL,
    comment,
  }: {
    order_id: string;
    project_id: string;
    fileURL?: string[];
    comment?: string;
  }) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("No project with that Id");
    const extraOrders = project.extraPositions;
    if (!project.extraPositions) throw Error("No project with that id");
    for (const extraOrder of extraOrders) {
      if (extraOrder.id === order_id) {
        extraOrder.fileURL = fileURL;
        extraOrder.comment = comment;
      }
    }
    await this.notificationService.create(
      "File has been added to addendum",
      "PROJECT",
      project.contractor,
      project_id,
      order_id
    );
    for (const executor of project.executors) {
      await this.notificationService.create(
        "File has been added to addendum",
        "PROJECT",
        executor,
        project_id,
        order_id
      );
    }
    project.extraPositions = extraOrders;
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
    const trade = await this.tradeService.retrieveTrade(trade_id);
    const existingPosition = project.positions[trade.name].positions.find(
      (pos) => pos.external_id === position.external_id
    );
    const filteredPositions = project.positions[trade.name].positions.filter(
      (pos) => pos.external_id !== existingPosition.external_id
    );
    project.positions[trade.name].positions = [...filteredPositions, position];
    return await this.saveProject(project);
  }

  async updateExtraPosition(
    project_id: string,
    position: ProjectPositions,
    trade_id: string,
    extraOrderId: string
  ) {
    const project = await this.getProjectById(project_id);
    const trade = await this.tradeService.retrieveTrade(trade_id);
    const existingExtraOrder = project.extraPositions.find(
      (extraP) => extraP.id === extraOrderId
    );
    if (!existingExtraOrder) throw Error("Addendum not found");
    const existingPosition = existingExtraOrder.positions[
      trade.name
    ].positions.find((pos) => pos.external_id === position.external_id);
    if (!existingPosition) throw Error("position does not exist");
    const filteredPositions = existingExtraOrder.positions[
      trade.name
    ].positions.filter((pos) => pos._id !== position._id);
    existingExtraOrder.positions[trade.name].positions = [
      ...filteredPositions,
      position,
    ];
    project.extraPositions = [
      ...project.extraPositions.filter((extraP) => extraP.id !== extraOrderId),
      existingExtraOrder,
    ];
    
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
    const trade = await this.tradeService.retrieveTrade(trade_id);
    if (!trade) throw Error("Trade not found!");
    const postion = project.positions[trade.name].positions.find(
      (position) => position.external_id === external_id
    );
    if (!postion) throw Error("position");
  }

  async updateMultipleExtraOrderPositions({
    project_id,
    positions,
    status,
    addendum_id,
  }: {
    project_id: string;
    positions: string[];
    status: string;
    addendum_id: string;
  }) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("Project with that ID not found");
    for (const addendum of project.extraPositions) {
      if (addendum.id === addendum_id) {
        for (const key in addendum.positions) {
          for (const position of addendum.positions[key].positions) {
            for (const position_id of positions) {
              if (position_id === position.external_id) {
                this.requiredPositions.forEach((reqPos) => {
                  if (
                    position.external_id === reqPos &&
                    !position.documentURL?.length
                  ) {
                    throw Error(
                      "You need to upload a document to this position before you can bill it"
                    );
                  }
                });
                position.status = status;
              }
            }
          }
        }
      }
    }
    return await this.saveProject(project);
  }

  async updateShortageOrder(
    project_id: string,
    position: ProjectPositions,
    trade_id: string
  ) {
    const project = await this.getProjectById(project_id);
    const trade = await this.tradeService.retrieveTrade(trade_id);
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

  async billMultipleAddendums(
    addendum_ids: string[],
    project_id: string,
    executor_id: string
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("Project with that id not found");
    const executor = await this.userService.getUser({ _id: executor_id });
    if (!executor) throw Error("Executor is not found");
    const billItems: ProjectPositions[] = [];
    const addendums: {
      [key: string]: ProjectPositions[];
    } = {};
    for (const addendum of project.extraPositions) {
      for (const addendum_id of addendum_ids) {
        if (addendum_id === addendum.id) {
          const addendumPositions = [];
          for (const key in addendum.positions) {
            if (addendum.positions[key].billed)
              throw Error("You have already billed this position");
            addendum.positions[key].billed = true;
            for (const position of addendum.positions[key].positions) {
              this.requiredPositions.forEach((reqPos) => {
                if (
                  position.external_id === reqPos &&
                  !position.documentURL?.length
                ) {
                  throw Error(
                    "You need to upload a document to this position before you can bill it"
                  );
                }
              });
              billItems.push(position);
              addendumPositions.push(position);
              position.billed = true;
              position.status = "BILLED";
            }
          }
          addendums[addendum.id] = addendumPositions;
        }
      }
    }
    const amount = billItems
      .map((billItems) =>
        Math.ceil(billItems.price * parseFloat(billItems.crowd))
      )
      .reduce((prev, next) => prev + next);
    const draft = await this.draftService.create({
      addendums,
      amount,
      project: project_id,
      user_id: executor._id.toString(),
      reciepient: project.contractor,
    });
    await this.saveProject(project);
    return draft;
  }

  async getExecutorProjects(executor_id: string) {
    const executor = await this.userService.getUser({ _id: executor_id });
    const existingProjects = executor.projects ?? [];
    const projects = await Promise.all(
      existingProjects.map((project) => this.getProjectById(project))
    );
    return projects;
  }

  async updateMultiplePositionsStatus(
    project_id: string,
    position_ids: string[],
    status: string
  ) {
    const project = await this.getProjectById(project_id);
    if (!project) throw Error("Project not found");
    for (const key in project.positions) {
      for (const position of project.positions[key].positions) {
        if (position_ids.find((pos_id) => pos_id === position.external_id)) {
          if (status === "BILLED") {
            this.requiredPositions.forEach((reqPos) => {
              if (
                position.external_id === reqPos &&
                !position.documentURL?.length
              ) {
                throw Error(
                  "You need to upload a document to this position before you can bill it"
                );
              }
            });
          }
          position.status = status;
        }
      }
    }

    const trades = Object.keys(project.positions);

    for (let i = 0; i < trades.length; i++) {
      if (
        !project.positions[trades[i]].billed ||
        project.positions[trades[i]].status !== "COMPLETED"
      ) {
        return;
      }
      if (
        i === trades.length - 1 &&
        (project.positions[trades[i]].billed ||
          project.positions[trades[i]].status === "COMPLETED")
      )
        this.changeProjectStatus(project._id.toString(), 4);
    }
    return await this.saveProject(project);
  }

  async getUserProjectStats(user_id: string) {
    console.log(user_id);
    let projects: Project[] = [];
    let positions: ProjectPositions[] = [];
    let NotAccepted: ProjectPositions[] = [];
    let AddendumPositions: ProjectPositions[] = [];
    let CompletedPostions: ProjectPositions[] = [];
    let BilledPostions: ProjectPositions[] = [];
    let user: User;
    if (user_id) {
      user = await this.userService.getUser({ _id: user_id });
    } else {
      return;
    }

    if (!user) throw Error("user not found");

    if (user.role === "contractor") {
      projects = await this.getContractorProjects(user._id.toString());
    }

    if (user?.role === "executor") {
      projects = await this.getExecutorProjects(user._id.toString());
    }
    projects = await this.getExecutorProjects(user._id.toString());
    for (const project of projects) {
      for (const trade of Object.keys(project.positions)) {
        for (const position of project.positions[trade].positions) {
          positions.push(position);
          if (position.status === "COMPLETED" || position.status === "BILLED")
            CompletedPostions.push(position);

          if (position.status === "BILLED") BilledPostions.push(position);

          if (
            project.positions[trade].executor === user._id.toString() ||
            (user.role === "contractor" &&
              project.positions[trade].accepted === false)
          )
            if (NotAccepted.find((_position) => _position.external_id === position.external_id))
              return;
            else NotAccepted.push(position);
        }
      }

      if (project.extraPositions) {
        for (const extraOrder of project.extraPositions) {
          for (const trade of Object.keys(extraOrder.positions)) {
            for (const position of extraOrder.positions[trade].positions) {
              positions.push(position);
              if (
                position.status === "COMPLETED" ||
                position.status === "BILLED"
              )
                CompletedPostions.push(position);

              if (position.status === "BILLED") BilledPostions.push(position);
              if (
                position.status !== "BILL" ||
                // TODO: This is a temporary fix, change the type of status to be POSITION_STATUS type
                // @ts-ignore
                position.status !== "COMPLETED"
              )
                AddendumPositions.push(position);
            }
          }
        }
      }
    }
    return [
      { title: "Total Project Positions", positions },
      { title: `Not accepted`, positions: NotAccepted },
      { title: `Pending Extra Positions`, positions: AddendumPositions },
      { title: `Completed`, positions: CompletedPostions },
      { title: `Billed`, positions: BilledPostions },
    ];
  }

  saveProject(project: Project) {
    return AppDataSource.mongoManager.save(Project, project);
  }

  requiredPositions = [
    //*Elektro*//
    "06.08.01.0050",
    "06.08.01.0200",
    "06.08.01.0010",
    "06.08.01.0015",
    "06.08.01.0020",
    "06.08.01.0030",
    "06.08.01.0035",
    "06.08.01.0040",
    "06.08.01.0050",
    "06.08.01.0060",
    "06.08.01.0065",
    "06.08.01.0070",
    "06.08.01.0080",
    "06.08.01.0090",
    "06.08.01.0200",

    // Plumbing//
    "06.01.01.0010",
    "06.01.01.0015",
    "06.01.01.0020",
    "06.01.01.0025",
    "06.01.01.0050",
    "06.01.01.0060",
    "06.01.01.0090",
    "06.01.01.0100",
    "06.01.02.0010",
    "06.01.02.0185",
    "06.01.02.0190",
    "06.01.01.0140",

    //Tiles//
    "06.04.01.0010",
    "06.04.01.0020",
    "06.04.01.0030",
    "06.04.01.0040",
    "06.04.01.0050",
    "06.04.01.0060",
    "06.04.01.0070",
    "06.04.01.0080",
    "06.04.01.0090",
    "06.04.01.0100",
    "06.04.01.0110",
    "06.04.02.0020",
    "06.04.02.0030",
    "06.04.02.0040",
    "06.04.02.0050",
    "06.04.02.0060",
    "06.04.02.0070",
    "06.04.02.0080",
    "06.04.02.0090",
    "06.04.02.0100",
    "06.04.02.0110",

    //others//
    "06.09.01.0010",
    //"06.09.01.0010",
  ];
}

export default new ProjectService(
  contractService,
  tradeService,
  draftService,
  todoService,
  userService,
  positionService,
  notificationService,
  pdfTextParser
);
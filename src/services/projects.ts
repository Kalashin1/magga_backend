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
} from "../types";
import userService from "./user";
import { PositionService } from "./position";
import { NotificationService } from "./notifications";
import { ObjectId } from "mongodb";
import { User } from "../entity/User";

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
    const client = pdfTextParser.getClientLines(text).join(".\n");;
    const billingDetails = pdfTextParser.getBillingDetails(text).join(".\n");
    const missions = pdfTextParser.getMission(text);
    const orderNotes = pdfTextParser.getOrderNotes(text);
    const mainPositions = pdfTextParser.getOrderItems(text);
    const individualPositions = pdfTextParser.getIndividualItems(text);

    // console.log("clientLines", clientLines);
    // console.log("billingDetails", billingDetails);
    // console.log("missions", missions);
    // console.log("orderNotes", orderNotes);
    // console.log("mainPositions", mainPositions);
    const _mainPositions = mainPositions.map((position) =>
      pdfTextParser.parseLineToPosition(position)
    );
    const positions: ProjectPositions[] = _mainPositions.map(
      (position, index) => ({
        status: "CREATED",
        billed: false,
        crowd: position.crowd,
        external_id: position.id,
        shortText: position.shortText,
        position: index + 1,
      })
    );
    const _singlePositions = individualPositions.map((position) =>
      pdfTextParser.parseLineToPosition(position)
    );
    const singlePositions = _singlePositions.map((position, index) => ({
      status: "CREATED",
      billed: false,
      crowd: position.crowd,
      external_id: position.id,
      shortText: position.shortText,
      position: index + 1,
    }));
    const details = pdfTextParser.parseApartmentInfo(missions.join(".\n"));
    const notes = pdfTextParser.parseOrderNotes(orderNotes);
    
    // console.log("notes", notes);
    console.log("details", details);
    // console.log("positions", _mainPositions);
    // console.log("individial positions", singlePositions);

    parsedFile.text = text;
    return {
      external_id: details.mission.slice(0, 11),
      billingDetails,
      building: {
        address: details.address,
        location: details.location,
        description: details.details,
        notes: notes
      },
      dueDate: details['end of execution'],
      rentalStatus: details['rental status'],
      positions: [...positions, ...singlePositions],
      careTaker: pdfTextParser.parseCareTaker(details["caretaker"],  details.tel),
      commissioned_by: pdfTextParser.parseCommisioner(details['commissioned by']),
      contractor: id,
      status: PROJECT_STATUS[0],
      client,
    };
  }

  async createProject(params: Project) {
    const existingProject = await this.getProjectByExternalId(params.external_id);
    if (existingProject) {
      throw Error('Project With that Id already exists')
    }
    const contractor = await userService.getUser({ _id: params.contractor });
    if (!contractor) throw Error("No contractor with that Id");
    const newProject = await AppDataSource.mongoManager.create(Project, params);
    const project =  await this.saveProject(newProject);
    await notificationService.create(
      "New contract created successfully " + project._id.toString(),
      "PROJECT",
      contractor._id.toString()
    );
    const projects = contractor.projects ?? [];
    projects.push(project._id.toString());
    contractor.projects = projects;
    await AppDataSource.mongoManager.save(User, contractor);
    console.log('project created!')
    return project
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

  async assingExecutor(executor_id: string[], project_id: string) {
    const executors = await Promise.all(
      executor_id.map(async (id) => await userService.getUser({ _id: id }))
    );
    if (executors.length !== executor_id.length)
      throw Error("error fetching executors");
    const project = await this.getProjectById(project_id);
    project.executors = executor_id;
    await executors.forEach(async (exe) => {
      exe.projects.push(project._id.toString());
      await notificationService.create(
        "Project has been assigned to you",
        "PROJECT",
        (await exe)._id.toString()
      );
      await AppDataSource.mongoManager.save(User, exe);
    });
    return await this.saveProject(project);
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
    await notificationService.create(message, "PROJECT", project.contractor);
    project.executors.forEach(async (exe) => {
      await notificationService.create(message, "PROJECT", exe);
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

  async addPositions(project_id: string, positions: ProjectPositions[]) {
    const project = await this.getProjectById(project_id);
    const extraPositions = project.extraPositions ?? [];

    for (let position of positions) {
      for (let extraPosition of extraPositions) {
        if (position._id === extraPosition._id)
          throw Error(`Position ${position.external_id} already exists`);
      }
    }
    extraPositions.push(...positions);
    project.extraPositions = extraPositions;
    const message = `${positions.length} Extra positions has been added to project ${project.external_id}`;
    await notificationService.create(message, "PROJECT", project.contractor);
    project.executors.forEach(async (exe) => {
      await notificationService.create(message, "PROJECT", exe);
    });
    return await this.saveProject(project);
  }

  async addShortageOrders(
    project_id: string,
    shortageOrders: ProjectPositions[]
  ) {
    const project = await this.getProjectById(project_id);
    const existingShortageOrders = project.shortagePositions ?? [];

    for (let shortageOrder of shortageOrders) {
      for (let existingShortageOrder of existingShortageOrders) {
        if (shortageOrder._id === existingShortageOrder._id)
          throw Error(
            `Position ${shortageOrder.external_id} has already been added to shortages`
          );
      }
    }

    existingShortageOrders.push(...shortageOrders);
    project.shortagePositions = existingShortageOrders;
    const message = `${shortageOrders.length} Extra positions has been added to project shortages ${project.external_id}`;
    await notificationService.create(message, "PROJECT", project.contractor);
    project.executors.forEach(async (exe) => {
      await notificationService.create(message, "PROJECT", exe);
    });
    return await this.saveProject(project);
  }

  async addExtraOrders(project_id: string, shortageOrders: ProjectPositions[]) {
    const project = await this.getProjectById(project_id);
    const existingShortageOrders = project.extraPositions ?? [];

    for (let shortageOrder of shortageOrders) {
      for (let existingShortageOrder of existingShortageOrders) {
        if (shortageOrder._id === existingShortageOrder._id)
          throw Error(
            `Position ${shortageOrder.external_id} has already been added to shortages`
          );
      }
    }

    existingShortageOrders.push(...shortageOrders);
    project.extraPositions = existingShortageOrders;
    const message = `${shortageOrders.length} Extra positions has been added to project position ${project.external_id}`;
    await notificationService.create(message, "PROJECT", project.contractor);
    project.executors.forEach(async (exe) => {
      await notificationService.create(message, "PROJECT", exe);
    });
    return await this.saveProject(project);
  }

  async getAllProjects() {
    return AppDataSource.mongoManager.find(Project, {});
  }

  async getContractorProjects(contractor_id: string) {
    console.log('contractor_id', contractor_id)
    return AppDataSource.mongoManager.find(Project, {
      where: {
        contractor: {
          $eq: contractor_id,
        },
      },
    });
  }

  async updateProjectPosition(project_id: string, position: ProjectPositions) {
    const project = await this.getProjectById(project_id);
    const existingPosition = project.positions.find(
      (pos) => pos._id === position._id
    );
    const filteredPositions = project.positions.filter(
      (pos) => pos._id !== existingPosition._id
    );
    project.positions = [...filteredPositions, position];
    return await this.saveProject(project);
  }

  async updateExtraPosition(project_id: string, position: ProjectPositions) {
    const project = await this.getProjectById(project_id);
    const existingPosition = project.extraPositions.find(
      (pos) => pos._id === existingPosition._id
    );
    const filteredPositions = project.positions.filter(
      (pos) => pos._id !== position._id
    );
    project.positions = [...filteredPositions, position];
    return await this.saveProject(project);
  }

  async updateShortageOrder(project_id: string, position: ProjectPositions) {
    const project = await this.getProjectById(project_id);
    const existingPosition = project.shortagePositions.find(
      (pos) => pos._id === existingPosition._id
    );
    const filteredPositions = project.positions.filter(
      (pos) => pos._id !== position._id
    );
    project.shortagePositions = [...filteredPositions, position];
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

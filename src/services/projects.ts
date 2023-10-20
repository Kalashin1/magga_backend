import { Project } from "../entity/project";
import { AppDataSource } from "../data-source";
import PdfParse from "pdf-parse";
import { translate } from "@vitalets/google-translate-api";

function render_page(pageData) {
  let render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(render_options).then(function (textContent) {
    let lastY,
      text = {};
    for (let item of textContent.items) {
      if (lastY == item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += "\n" + item.str;
      }
      lastY = item.transform[5];
    }
    return text;
  });
}

function getClientLines(text: string) {
  const lines = text.split("\n");
  const clientLines = [];
  for (const line of lines) {
    if (line.includes("client")) {
      continue;
    }
    if (line === "Represented by") {
      break;
    }
    clientLines.push(line);
  }
  return clientLines;
}

function getBillingDetails(text: string) {
  const lines = text.split("\n");
  const billingDetails = [];

  let isBillingDetails = false;

  for (const line of lines) {
    if (line.includes("Billing address")) {
      isBillingDetails = true;
      continue;
    }

    if (line.includes("LWSPlusGmbH")) {
      break;
    }

    if (isBillingDetails) {
      billingDetails.push(line);
    }
  }

  return billingDetails;
}

function getMission(text: string) {
  const lines = text.split("\n");
  const missions = [];
  let isMission = false;

  for (const line of lines) {
    if (line.includes("Mission:")) {
      isMission = true;
      continue;
    }

    if (line.includes("Order Notes")) break;

    if (isMission) missions.push(line);
  }

  return missions;
}

function getOrderNotes(text: string) {
  const lines = text.split("\n");
  const orderNotes = [];
  let isOrderNotes = false;

  for (const line of lines) {
    if (line.includes("Order Notes")) {
      isOrderNotes = true;
      continue;
    }

    if (line.includes("Compilation of services")) break;

    if (isOrderNotes) orderNotes.push(line);
  }

  return orderNotes;
}

let options = {
  pagerender: render_page,
};

export class ProjectService {
  async parsePDF(file: Buffer) {
    const parsedFile = await PdfParse(file, options);
    const { text } = await translate(parsedFile.text, {
      to: "en",
    });
    console.log(getClientLines(text));
    console.log("billing details", getBillingDetails(text));
    console.log("missions", getMission(text));
    console.log("order notes", getOrderNotes(text));

    parsedFile.text = text;
    return parsedFile;
  }
}

const projectService = new ProjectService();

export default projectService;

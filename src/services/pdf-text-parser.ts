import { User } from "../entity/User";

export class PDFTextParser {
  constructor(private _text?: string) {}

  get text() {
    return this._text;
  }

  set(text: string) {
    this._text = text;
  }

  getClientLines(text?: string) {
    const lines = text ? text.split("\n") : this.text.split("\n");
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

  getBillingDetails(text?: string) {
    const lines = text ? text.split("\n") : this.text.split("\n");
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

  getMission(text?: string) {
    const lines = text ? text.split("\n") : this.text.split("\n");
    const missions = [];
    let isMission = false;

    for (const line of lines) {
      if (line.includes("Mission:")) {
        isMission = true;
      }

      if (line.includes("Order Notes")) break;

      if (isMission) missions.push(line);
    }

    return missions;
  }

  getOrderNotes(text?: string): string[] {
    const lines = text ? text.split("\n") : this.text.split("\n");
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

  getOrderItems(text?: string) {
    const lines = text ? text.split("\n") : this.text.split("\n");
    const positions = [];
    let isPositions = false;

    const regex = new RegExp("^06\\.\\d{2}\\.\\d{2}\\.\\d{4}$");

    for (const line of lines) {
      if (line.includes("Compilation of services")) {
        isPositions = true;
        continue;
      }

      if (line.includes("Individual positions")) break;

      if (isPositions && regex.test(line.slice(0, 13))) {
        positions.push(line);
      }

      if (isPositions && !regex.test(line.slice(0, 13))) {
        positions[positions.length - 1] += line;
      }
    }

    return positions;
  }

  getIndividualItems(text?: string) {
    const lines = text ? text.split("\n") : this.text.split("\n");
    const positions = [];
    let isPositions = false;

    const regex = new RegExp("^06\\.\\d{2}\\.\\d{2}\\.\\d{4}$");

    for (const line of lines) {
      if (line.includes("Individual positions")) {
        isPositions = true;
        continue;
      }

      if (line.includes("Manually entered value.")) break;

      if (isPositions && regex.test(line.slice(0, 13))) {
        positions.push(line);
      }

      if (isPositions && !regex.test(line.slice(0, 13))) {
        positions[positions.length - 1] += line;
      }
    }

    return positions;
  }

  render_page(pageData) {
    let render_options = {
      normalizeWhitespace: false,
      disableCombineTextItems: true,
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

  parseLineToPosition(string) {
    const patterns = [
      /(\d+\.\d+\.\d+\.\d+)\s+(.+?)\s+(\d+\.\d\d)\s?(\w+)?/,
      /(\d+\.\d+\.\d+\.\d+)\s+(.+?)\s+(\d+\.\d\d)\s+(.+)?/,
      /(\d+\.\d+\.\d+\.\d+)\s+(.+?)(\d+\.\d\d)/,
      /(\d+\.\d+\.\d+\.\d+)\s+(.+?)$/,
    ];
    for (const pattern of patterns) {
      const match = new RegExp(pattern).exec(string);
      if (match) {
        return {
          id: match[1],
          shortText: match[2],
          crowd:
            match[3] && String(match[3]).length >= 6
              ? match[3].slice(2)
              : match[3],
        };
      }
    }

    return string;
  }

  parseApartmentInfo(text: string): { [key: string]: string } {
    const apartmentInfo = {};
    for (const line of text.split('\n')) {
      const match = /^(.+?):(\s+)?(.*)$/.exec(line);
      
      if (match) {
        const key = match[1].toLowerCase().replace('-', '_');
        const value = match[3];
        apartmentInfo[key] = value;
      }
      if (!match && line) {
        const keys = Object.keys(apartmentInfo);
        apartmentInfo[keys.at(-1)] += line;
      }
    }
    return apartmentInfo;
  }

  parseOrderNotes(text: string[]){
    let orderNotes = '';
    for(const line of text) {
      const match = /^(.+?):$/.exec(line);
      if (match) {
        orderNotes += `\n${match[1]}`
      } else if (line && !match) {
        orderNotes += ` ${line}`;
      }
    }
    return orderNotes;
  }

  parseCareTaker(text: string, phone: string): Pick<User, 'email'|'phone'> & {name: string}{
    const careTaker = {};
    const sections = text.split(',')
    return {
      name: sections[0],
      email: sections[1].slice(5),
      phone
    }
  }

  parseCommisioner(text: string): Pick<User, 'email'|'phone'> & {name: string}{
    const commissioner = {};
    const sections = text.split(',')
    console.log(sections)
    return {
      name: sections[0],
      email: sections[1].slice(5),
      phone: sections[2].slice(5)
    }
  }
}

const pdfTextParser = new PDFTextParser();

export default pdfTextParser;

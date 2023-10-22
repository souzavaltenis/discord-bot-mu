import moment, { Moment } from "moment";
import { InfoMember } from "../info-member";

class GeralSingleton {
    indexDicaFooter: number = 0;
    onlineSince: Moment = moment();
    infoMember: Map<string, InfoMember> = new Map<string, InfoMember>();
    updateBotInProgress: boolean = false;
}

export const geralSingleton = new GeralSingleton();
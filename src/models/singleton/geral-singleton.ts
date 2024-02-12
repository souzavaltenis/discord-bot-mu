import { Moment } from "moment";
import { InfoMember } from "../info-member";
import { dataNowMoment } from "../../utils/data-utils";

class GeralSingleton {
    indexDicaFooter: number = 0;
    onlineSince: Moment = dataNowMoment();
    infoMember: Map<string, InfoMember> = new Map<string, InfoMember>();
    updateBotInProgress: boolean = false;
    lastViewRank: Moment = dataNowMoment();
}

export const geralSingleton = new GeralSingleton();
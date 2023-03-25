import moment, { Moment } from "moment";

class GeralSingleton {
    indexDicaFooter: number = 0;
    onlineSince: Moment = moment(); 
}

export const geralSingleton = new GeralSingleton();
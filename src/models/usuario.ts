import { INickInfo } from "./interface/nick-info";
import { ITimeOnlineInfo } from "./interface/time-online-info";

export class Usuario {
    id: string;
    name: string;
    timestampsAnotacoes: number[];
    /**
     * @deprecated Esse campo será substituido pelo novo 'timeOnline'
     */
    totalTimeOnline: number;
    nicks: INickInfo[];
    timeOnline: Map<string, ITimeOnlineInfo>;

    constructor(id: string, name: string, timestampsAnotacoes: number[], totalTimeOnline: number, nicks: INickInfo[], timeOnline: Map<string, ITimeOnlineInfo>) {
        this.id = id;
        this.name = name;
        this.timestampsAnotacoes = timestampsAnotacoes;
        this.totalTimeOnline = totalTimeOnline;
        this.nicks = nicks;
        this.timeOnline = timeOnline;
    }
}
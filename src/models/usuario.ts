import { INickInfo } from "./interface/nick-info";

export class Usuario {
    id: string;
    name: string;
    timestampsAnotacoes: number[];
    totalTimeOnline: number;
    nicks: INickInfo[];

    constructor(id: string, name: string, timestampsAnotacoes: number[], totalTimeOnline: number, nicks: INickInfo[]) {
        this.id = id;
        this.name = name;
        this.timestampsAnotacoes = timestampsAnotacoes;
        this.totalTimeOnline = totalTimeOnline;
        this.nicks = nicks;
    }
}
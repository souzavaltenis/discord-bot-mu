export class Usuario {
    id: string;
    name: string;
    timestampsAnotacoes: number[];
    totalTimeOnline: number;

    constructor(id: string, name: string, timestampsAnotacoes: number[], totalTimeOnline: number) {
        this.id = id;
        this.name = name;
        this.timestampsAnotacoes = timestampsAnotacoes;
        this.totalTimeOnline = totalTimeOnline;
    }
}
export class Usuario {
    id: string;
    name: string;
    timestampsAnotacoes: number[];

    constructor(id: string, name: string, timestampsAnotacoes: number[]) {
        this.id = id;
        this.name = name;
        this.timestampsAnotacoes = timestampsAnotacoes;
    }
}
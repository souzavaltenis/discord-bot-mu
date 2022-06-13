import { IBossInfoAdd } from "./interface/boss-info-add";

export class Usuario {
    id: string;
    name: string;
    anotacoes: IBossInfoAdd[];

    constructor(id: string, name: string, anotacoes: IBossInfoAdd[]) {
        this.id = id;
        this.name = name;
        this.anotacoes = anotacoes;
    }
}
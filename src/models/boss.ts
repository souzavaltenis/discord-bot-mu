import { Moment } from "moment";
import { momentToString } from "../utils/data-utils";

export class Boss {
    id: number;
    nome: string;
    salas: Map<number, Moment>;
    ativo: boolean;
    
    constructor(id: number, nome: string, salas: Map<number, Moment>, ativo: boolean) {
        this.id = id;
        this.nome = nome;
        this.salas = salas;
        this.ativo = ativo;
    }

    toString(): string {
        let salasString = '';
        this.salas.forEach((horario: Moment, sala: number) => {
            salasString += `\n${sala} => ${momentToString(horario)} `
        });
        return `[Boss (id: ${this.id}, nome: ${this.nome}, \nsalas: ${salasString}\nAtivo: ${this.ativo})]`;
    }
}
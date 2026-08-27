import { Moment } from "moment";
import { momentToString } from "../utils/data-utils";

export class Boss {
    id: number;
    nome: string;
    salas: Map<number, Moment>;
    ativo: boolean;
    vivo: Map<number, Moment>;

    constructor(id: number, nome: string, salas: Map<number, Moment>, ativo: boolean, vivo: Map<number, Moment> = new Map()) {
        this.id = id;
        this.nome = nome;
        this.salas = salas;
        this.ativo = ativo;
        this.vivo = vivo;
    }

    toString(): string {
        let salasString = '';
        this.salas.forEach((horario: Moment, sala: number) => {
            salasString += `\n${sala} => ${momentToString(horario)} `
        });
        return `[Boss (id: ${this.id}, nome: ${this.nome}, \nsalas: ${salasString}\nAtivo: ${this.ativo})]`;
    }
}
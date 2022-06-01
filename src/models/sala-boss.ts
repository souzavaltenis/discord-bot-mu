import { Moment } from "moment";

export class SalaBoss {
    sala: number;
    nomeBoss: string;
    horario: Moment;

    constructor(sala: number, nomeBoss: string, horario: Moment) {
        this.sala = sala;
        this.nomeBoss = nomeBoss;
        this.horario = horario;
    }
}
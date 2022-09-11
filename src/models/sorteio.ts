import { IGanhador } from "./interface/ganhador-interface";

export class Sorteio {
    
    timestamp: number;
    participantes: string[];
    premios: string[];
    ganhadores: IGanhador[];
    criador: string;

    constructor(timestamp: number, participantes: string[], premios: string[], ganhadores: IGanhador[], criador: string) {
        this.timestamp = timestamp;
        this.participantes = participantes;
        this.premios = premios;
        this.ganhadores = ganhadores;
        this.criador = criador;
    }
}
export class IdBossSala {
    aberto: string;
    fechado: string;

    constructor(idBoss: number, numeroSala: number) {
        this.aberto = `${idBoss}.${numeroSala}.A`;
        this.fechado = `${idBoss}.${numeroSala}.F`;
    }
}
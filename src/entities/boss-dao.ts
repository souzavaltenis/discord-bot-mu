export class BossDAO {
    nome: string;
    sala: string;
    horario: string;

    constructor(nome: string, sala: string, horario: string) {
        this.nome = nome;
        this.sala = sala;
        this.horario = horario;
    }
}
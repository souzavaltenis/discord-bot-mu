export class Boss {
    id: string;
    nome: string;
    sala2: string | null;
    sala3: string | null;
    sala4: string | null;
    sala5: string | null;
    sala6: string | null;
    
    constructor(id: string, nome: string, sala2: string, sala3: string, sala4: string, sala5: string, sala6: string) {
        this.id = id;
        this.nome = nome;
        this.sala2 = sala2;
        this.sala3 = sala3;
        this.sala4 = sala4;
        this.sala5 = sala5;
        this.sala6 = sala6;
    }

    toString = () : string => {
        return `Boss (id: ${this.id} nome: ${this.nome}, sala2: ${this.sala2}, sala3: ${this.sala3}, sala4: ${this.sala4}, sala5: ${this.sala5}, sala6: ${this.sala6})`;
    }
}
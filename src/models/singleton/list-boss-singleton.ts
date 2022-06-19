import { Boss } from "../boss";

export class ListBossSingleton {
    private static instance: ListBossSingleton;

    boss: Boss[];

    constructor(boss: Boss[]) {
        this.boss = boss;
    }

    static getInstance(): ListBossSingleton {
        if (!this.instance) {
          this.instance = new this([] as Boss[]);
        }
        return this.instance;
    }
}
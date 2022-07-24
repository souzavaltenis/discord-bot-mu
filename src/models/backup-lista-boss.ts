import { Boss } from "./boss";

export class BackupListaBoss {
    timestamp: number;
    listaBoss: Boss[];

    constructor(timestamp: number, listaBoss: Boss[]) {
        this.timestamp = timestamp;
        this.listaBoss = listaBoss;
    }
}
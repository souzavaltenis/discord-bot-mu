export class InfoMember {
    id: string;
    timeOnline: number;
    lastConnect: number;

    constructor(id: string, timeOnline: number, lastConnect: number) {
        this.id = id;
        this.timeOnline = timeOnline;
        this.lastConnect = lastConnect;
    }
}
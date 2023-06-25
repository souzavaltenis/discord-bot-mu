export class InfoMember {
    id: string;
    nick: string;
    timeOnline: number;
    lastConnect: number;

    constructor(id: string, nick: string, timeOnline: number, lastConnect: number) {
        this.id = id;
        this.nick = nick;
        this.timeOnline = timeOnline;
        this.lastConnect = lastConnect;
    }
}
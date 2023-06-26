export class InfoMember {
    id: string;
    nick: string;
    timeOnline: number;
    lastConnect: number;
    connectSince: number;

    constructor(id: string, nick: string, timeOnline: number, lastConnect: number, connectSince: number) {
        this.id = id;
        this.nick = nick;
        this.timeOnline = timeOnline;
        this.lastConnect = lastConnect;
        this.connectSince = connectSince;
    }
}
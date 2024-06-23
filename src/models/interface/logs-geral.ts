import { TypeLog } from "../enum/type-log";

export interface ILogsGeral {
    type: TypeLog;
    userId: string;
    userName: string;
    command: string;
    guildId: string;
    guildName: string;
    timestamp: number;
}
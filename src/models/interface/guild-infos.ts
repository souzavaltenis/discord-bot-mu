import { Moment } from "moment";

export interface IGuildInfos {
    nomeGuild: string;
    idGuild: string;
    quantidadeMembros: number;
    dataEntradaBot: Moment;
    nomeOwnerGuild: string;
    idOwnerGuild: string;
}
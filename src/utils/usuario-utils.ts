/* eslint-disable @typescript-eslint/no-explicit-any */
import { Moment } from "moment";
import { TypeTimestamp } from "../models/enum/type-timestamp";
import { ITimeOnlineInfo } from "../models/interface/time-online-info";
import { dataNowMoment, isSameMoment, stringToMoment } from "./data-utils";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { consultarUsuarios } from "../db/db";

const prepararListaTimestampAnotacoes = (timestampsAnotacoes: any, timestampNewRankMoment: number, dataNow: Moment): number[] => {
    const listaTimestampsAnotacoes: number[] = (timestampsAnotacoes as number[] || [] as number[])
        .filter((timestamp: number) => timestamp >= timestampNewRankMoment)
        .map((timestamp: number) => {
            switch (true) {
                // case timestamp <= timestampNewRankMoment:
                //     return TypeTimestamp.OLD_TIMESTAMP_RANK;
                case !isSameMoment(dataNow, timestamp, 'week') && !isSameMoment(dataNow, timestamp, 'day'):
                    return TypeTimestamp.NEW_TIMESTAMP_DATED;
                default:
                    return timestamp;
            }
        });

    return listaTimestampsAnotacoes;
}

const prepararMapTimeOnline = (timeOnline: any, timestampNewRankMoment: number, dataNow: Moment): Map<string, ITimeOnlineInfo> => {
    const mapTimeOnline: Map<string, number> = new Map<string, number>(Object.entries(timeOnline ?? {}));
            
    let listTimeOnline: [string, ITimeOnlineInfo][] = [...mapTimeOnline].map(([k, v]) => {
        const timeOnlineInfo: ITimeOnlineInfo = {
            timestampDay: stringToMoment(k + '00:00 -03:00').valueOf(),
            timestampOnline: v,
            isOld: false
        };

        return [k, timeOnlineInfo];
    });

    listTimeOnline = listTimeOnline.filter(([, v]) =>  v.timestampDay >= timestampNewRankMoment);

    listTimeOnline.forEach(([, v]) => {
        v.isOld = !isSameMoment(dataNow, v.timestampDay, 'week') && !isSameMoment(dataNow, v.timestampDay, 'day');
    });

    return new Map<string, ITimeOnlineInfo>(listTimeOnline);
}

async function verificarAtualizacaoDiariaUsuarios(): Promise<void> {
    const dataNow: Moment = dataNowMoment();

    if (geralSingleton.lastViewRank.date() !== dataNow.date()) {
        await consultarUsuarios();
    }

    geralSingleton.lastViewRank = dataNow;
}

export {
    prepararListaTimestampAnotacoes,
    prepararMapTimeOnline,
    verificarAtualizacaoDiariaUsuarios
}
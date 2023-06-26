import { adicionarBackupListaBoss, salvarTempoOnlineMembros } from "../db/db";
import { millisecondsToNextHour } from "./data-utils";
import { agendarExecucoes } from "./geral-utils";

const initAllRoutinesBackups = (): void => {
    initBackupListaBoss();
    initBackupTempoOnlineMembros();
}

const initBackupListaBoss = (): void => {
    const msTriggerInit: number = millisecondsToNextHour();
    const msRepeat: number = 60 * 60 * 1000; // 1h

    agendarExecucoes(msTriggerInit, msRepeat, adicionarBackupListaBoss);
}

const initBackupTempoOnlineMembros = (): void => {
    const msTriggerInit: number = 60 * 1000; // 1m
    const msRepeat: number = 30 * 60 * 1000; // 30m

    agendarExecucoes(msTriggerInit, msRepeat, salvarTempoOnlineMembros);
}

export {
    initAllRoutinesBackups
}
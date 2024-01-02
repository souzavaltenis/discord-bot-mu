import { adicionarBackupListaBoss, salvarTempoOnlineMembros } from "../db/db";
import { millisecondsToMidnight, millisecondsToNextHour } from "./data-utils";
import { agendarExecucoes } from "./geral-utils";

const initAllRoutinesBackups = (): void => {
    initBackupListaBoss();
    initEveryBackupTempoOnlineMembros();
    initLastBackupDayTempoOnlineMembros();
}

const initBackupListaBoss = (): void => {
    const msTriggerInit: number = millisecondsToNextHour();
    const msRepeat: number = 60 * 60 * 1000; // 1h

    agendarExecucoes(msTriggerInit, msRepeat, adicionarBackupListaBoss);
}

const initEveryBackupTempoOnlineMembros = (): void => {
    const msTriggerInit: number = 60 * 1000; // 1m
    const msRepeat: number = 30 * 60 * 1000; // 30m

    agendarExecucoes(msTriggerInit, msRepeat, salvarTempoOnlineMembros);
}

const initLastBackupDayTempoOnlineMembros = (): void => {
    const msTriggerInit: number = millisecondsToMidnight() - (60 * 1000); // 23:59
    const msRepeat: number = 24 * 60 * 60 * 1000; // 24h

    agendarExecucoes(msTriggerInit, msRepeat, salvarTempoOnlineMembros);
}

export {
    initAllRoutinesBackups
}
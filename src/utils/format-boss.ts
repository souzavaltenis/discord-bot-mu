import { Boss } from "../models/boss";
import { isBossAberto } from "./is-boss-aberto";
import { isBossVencido } from "./is-boss-vencido";
import { previsaoBoss } from "./previsao-boss";

const formatBoss = (boss: Boss): string => {
    let infoBoss = '-------------------------------------------------------\n';

    Object.keys(boss).forEach((field: string) => {
        if (field.includes("sala")) {
            const numeroSala: string = field[field.length-1];
            const infos = (boss[field as keyof Boss] as string).split(';');
            const horario = infos[0];
            const data = infos[1] ? ` (${infos[1]}) ` : ''
            const previsao: string = previsaoBoss(horario);
            const bossVencido = isBossVencido(horario, data);
            const bossAberto = isBossAberto(horario, data);
            infoBoss += `**Sala ${numeroSala}**: ${horario} ${data} ${previsao} ${bossVencido ? ':x:' : bossAberto ? ':white_check_mark:' : ':zzz:'}\n`;
        }
    })

    return infoBoss + '\u200B\n';
};

export { formatBoss }
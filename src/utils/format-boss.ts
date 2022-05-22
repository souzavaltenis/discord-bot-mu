import { Boss } from "../models/boss";
import { previsaoBoss } from "./previsao-boss";

const formatBoss = (boss: Boss): string => {
    let infoBoss = '------------------------------------------\n';

    Object.keys(boss).forEach((field: string) => {
        if (field.includes("sala")) {
            const numeroSala: string = field[field.length-1];
            const infos = (boss[field as keyof Boss] as string).split(';');
            const horario = infos[0];
            const data = infos[1] ? ` (${infos[1]}) ` : ''
            const previsao: string = previsaoBoss(horario);
            infoBoss += `**Sala ${numeroSala}**: ${horario} ${data} ${previsao}\n`;
        }
    })

    return infoBoss + '\u200B\n';
};

export { formatBoss }
import { Boss } from "../models/boss";

const formatBoss = (boss: Boss): string => {
    return '----------------------------\n' +
            `**Sala 2**: ${boss.sala2}\n` + 
            `**Sala 3**: ${boss.sala3}\n` + 
            `**Sala 4**: ${boss.sala4}\n` + 
            `**Sala 5**: ${boss.sala5}\n` + 
            `**Sala 6**: ${boss.sala6}`;
};

export { formatBoss }
import { EmbedBuilder } from "discord.js";
import { Boss } from "../../models/boss";
import { numbersToEmoji, textoFooter, tracos, underbold } from "../../utils/geral-utils";
import { previsaoParaAbrir, previsaoParaFechar, sortBossPorHorario } from "../../utils/boss-utils";
import { Moment } from "moment";
import { config } from "../../config/get-configs";
import { Ids } from "../../models/ids";

const getEmbedTabelaProximos = (listaBoss: Boss[], tipoProximos: string): EmbedBuilder => {
    const isAbrir: boolean = [Ids.BUTTON_TABLE_PROXIMOS, Ids.BUTTON_ABRIR_PROXIMOS].includes(tipoProximos);

    const embedTabelaProximos = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle(`Próximos Horários que ${isAbrir ? "Abrirão ✅" : "Fecharão ❌"}`)
        .setDescription("\u200B")
        .setFooter({ text: config().mu.avisoFooter || textoFooter() })
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => {
        let infoBoss: string = tracos(38);

        sortBossPorHorario(boss.salas, isAbrir).forEach((horario: Moment, sala: number) => {
            const tempoRestante = isAbrir ? previsaoParaAbrir(horario) : previsaoParaFechar(horario);
            const previsaoString: string = tempoRestante.hours() + 'h ' + tempoRestante.minutes() + 'm';
            infoBoss += `\nSala ${numbersToEmoji(sala)} ${underbold(isAbrir ? "abrirá" : "fechará")} em ${underbold(previsaoString)}`;
        });

        infoBoss += '\n\u200B';

        embedTabelaProximos.addFields([{ name: boss.nome, value: infoBoss }]);
    });

    return embedTabelaProximos;
}

export { getEmbedTabelaProximos }
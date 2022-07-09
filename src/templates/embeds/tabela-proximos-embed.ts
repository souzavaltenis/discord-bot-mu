import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { numbersToEmoji, textoFooterRandom, tracos, underbold } from "../../utils/geral-utils";
import { previsaoParaAbrir, sortBossAbertosByHorario } from "../../utils/boss-utils";
import { Moment } from "moment";
import { config } from "../../config/get-configs";

const getEmbedTabelaProximos = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaProximos = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela Horários Mais Próximos")
        .setDescription("\u200B")
        .setFooter({ text: config().mu.avisoFooter || textoFooterRandom() })
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => {
        let infoBoss: string = '';

        sortBossAbertosByHorario(boss.salas).forEach((horario: Moment, sala: number) => {
            const tempoRestante = previsaoParaAbrir(horario);
            const previsaoString: string = tempoRestante.hours() + 'h ' + tempoRestante.minutes() + 'm';
            infoBoss += `Sala ${numbersToEmoji(sala)} abrirá em ${underbold(previsaoString)}\n`;
        });

        infoBoss += tracos(38);

        embedTabelaProximos.addField(boss.nome, infoBoss);
    });

    return embedTabelaProximos;
}

export { getEmbedTabelaProximos }
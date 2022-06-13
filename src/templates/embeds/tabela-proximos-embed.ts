import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { numberToEmoji, tracos, underbold } from "../../utils/geral-utils";
import { previsaoParaAbrir, sortBossAbertosByHorario } from "../../utils/boss-utils";
import { Moment } from "moment";

const getEmbedTabelaProximos = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaProximos = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela Horários Mais Próximos")
        .setDescription("\u200B")
        .setTimestamp();

    listaBoss.forEach((boss: Boss) => {
        let infoBoss: string = '';

        sortBossAbertosByHorario(boss.salas).forEach((horario: Moment, sala: number) => {
            const tempoRestante = previsaoParaAbrir(horario);
            const previsaoString: string = tempoRestante.hours() + 'h ' + tempoRestante.minutes() + 'm';
            infoBoss += `Sala ${numberToEmoji(sala)} abrirá em ${underbold(previsaoString)}\n`;
        });

        infoBoss += tracos(38);

        embedTabelaProximos.addField(boss.nome, infoBoss);
    });

    return embedTabelaProximos;
}

export { getEmbedTabelaProximos }
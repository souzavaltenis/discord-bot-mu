import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { SalaBoss } from "../../models/sala-boss";
import { dataNowMoment, diffDatas } from "../../utils/data-utils";
import { gerarListaSalaBoss, numberToEmoji, tracos, underbold } from "../../utils/geral-utils";
import { config } from '../../config/get-configs';
import moment from "moment";

const getEmbedTabelaProximos = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaProximos = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela Horários Mais Próximos")
        .setFooter({ text: "Listar horários: /list\nAdicionar horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' })
        .setTimestamp();

    const listaSalaBoss: SalaBoss[] = gerarListaSalaBoss(listaBoss).slice(0, 5);

    let infosProximos: string = '';

    listaSalaBoss.forEach((salaBoss: SalaBoss, index: number) => {
        const horarioAbertura = moment(salaBoss.horario).add(config.bossFirestoreConfig.horaBossInicial, 'hours');
        const tempoRestante = diffDatas(horarioAbertura, dataNowMoment());
        const previsaoString: string = tempoRestante.hours() + 'h ' + tempoRestante.minutes() + 'm ' + tempoRestante.seconds() + 's';
        infosProximos += `${index+1}. ${underbold(salaBoss.nomeBoss)} sala ${numberToEmoji(salaBoss.sala)} abrirá em ${underbold(previsaoString)}\n` + tracos(55) + '\n';
    });

    embedTabelaProximos.addField("\u200B", infosProximos || "Não foi encontrado nenhum horário próximo\n\u200B");

    return embedTabelaProximos;
}

export { getEmbedTabelaProximos }
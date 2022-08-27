import { bold, EmbedBuilder } from "discord.js";
import moment from "moment";
import { Moment } from "moment";
import { config } from "../../config/get-configs";
import { Boss } from "../../models/boss";
import { isBossVencido } from "../../utils/boss-utils";
import { dataNowMoment } from "../../utils/data-utils";
import { textoFooter, tracos } from "../../utils/geral-utils";

const getEmbedTabelaVencidos = (listaBoss: Boss[]): EmbedBuilder => {
    const embedTabelaVencidos = new EmbedBuilder()
        .setTitle("Boss Vencidos")
        .setDescription("\u200B")
        .setColor("DarkBlue")
        .setFooter({ text: config().mu.avisoFooter || textoFooter() })
        .setTimestamp();

    let qtdVencidos: number = 0;

    listaBoss.forEach(boss => {
        let info: string = tracos(62) + '\n';
        let existeVencido: boolean = false;

        boss.salas.forEach((horario: Moment, sala: number) => {
            if (isBossVencido(horario)) {
                existeVencido = true;
                qtdVencidos++;

                const horarioInicialAbrir: Moment = moment(horario).add(config().mu.horaBossInicial, 'hours');
                const horarioFinalAbrir: Moment = moment(horario).add(config().mu.horaBossFinal, 'hours');

                const horarioMinimoAbrirVencido: Moment = moment(horarioInicialAbrir).add(config().mu.horaBossInicial, 'hours');
                const horarioMaximoFecharVencido: Moment = moment(horarioFinalAbrir).add(config().mu.horaBossFinal, 'hours');

                info += `${bold(`Sala ${sala}`)}: ${horario.format("HH:mm (DD/MM)")} `;
                info += `Previsão: **[${horarioMinimoAbrirVencido.format("HH:mm")} até ${horarioMaximoFecharVencido.format("HH:mm")}]** `;
                info += getIconeSituacaoHorario(horarioMinimoAbrirVencido, horarioMaximoFecharVencido) + '\n';
            }
        });

        if (existeVencido) {
            embedTabelaVencidos.addFields({ name: boss.nome, value: info + '\u200B' });
        }
    });

    embedTabelaVencidos.setTitle(embedTabelaVencidos.data.title + `: ${qtdVencidos}`)

    return embedTabelaVencidos;
}

const getIconeSituacaoHorario = (horarioMinimoAbrirVencido: Moment, horarioMaximoFecharVencido: Moment): string => {
    const horarioAtual: Moment = dataNowMoment();

    switch (true) {
        case horarioAtual.isAfter(horarioMaximoFecharVencido): return '❌'
        case horarioAtual.isBefore(horarioMinimoAbrirVencido): return '💤'
        default: return '✅';
    }
};

export { getEmbedTabelaVencidos }
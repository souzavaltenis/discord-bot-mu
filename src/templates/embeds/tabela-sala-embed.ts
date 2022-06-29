import { MessageEmbed } from "discord.js";
import { Boss } from "../../models/boss";
import { SalaBoss } from "../../models/sala-boss";
import { formatSalaBoss } from "../../utils/boss-utils";
import { gerarTabelaSalas, underbold } from "../../utils/geral-utils";

const getEmbedTabelaSala = (listaBoss: Boss[]): MessageEmbed => {
    const embedTabelaSalas = new MessageEmbed()
        .setColor("DARK_BLUE")
        .setTitle("Tabela de Horários por Sala")
        .setDescription("\u200B")
        .setFooter({ text: `Alguma dúvida? Use /help`})
        .setTimestamp();

    const mapSalasHorarios: Map<number, SalaBoss[]> = gerarTabelaSalas(listaBoss);

    mapSalasHorarios.forEach((bossSala: SalaBoss[], sala: number) => {
        embedTabelaSalas.addField(`${underbold('Sala')} ${underbold(sala+'')}`, formatSalaBoss(bossSala));
    });

    return embedTabelaSalas;
}

export { getEmbedTabelaSala }
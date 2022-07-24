import { EmbedBuilder } from "discord.js";
import { config } from "../../config/get-configs";
import { Boss } from "../../models/boss";
import { SalaBoss } from "../../models/sala-boss";
import { formatSalaBoss } from "../../utils/boss-utils";
import { gerarTabelaSalas, textoFooterRandom, underbold } from "../../utils/geral-utils";

const getEmbedTabelaSala = (listaBoss: Boss[]): EmbedBuilder => {
    const embedTabelaSalas = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle("Tabela de Horários por Sala")
        .setDescription("\u200B")
        .setFooter({ text: config().mu.avisoFooter || textoFooterRandom() })
        .setTimestamp();

    const mapSalasHorarios: Map<number, SalaBoss[]> = gerarTabelaSalas(listaBoss);

    mapSalasHorarios.forEach((bossSala: SalaBoss[], sala: number) => {
        embedTabelaSalas.addFields([{ name: `${underbold('Sala ' + sala)}`, value: formatSalaBoss(bossSala) }]);
    });

    return embedTabelaSalas;
}

export { getEmbedTabelaSala }
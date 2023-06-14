/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { bold } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Moment } from "moment";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";
import { distanceDatasString } from "../../utils/data-utils";
import { getIdBossByDoc } from "../../utils/geral-utils";

const getEmbedAddBoss = (nomeDocBoss: string, horarioInformado: Moment, salaBoss: number, username: string, quantidadeAnotacoesUsuario?: number): EmbedBuilder => {
    const bossAntigo = ListBossSingleton.getInstance().boss.find(b => b.id === getIdBossByDoc(nomeDocBoss));
    const horarioAntigo: Moment | undefined = bossAntigo?.salas.get(salaBoss);
    const diferencaFormatada: string = distanceDatasString(horarioInformado, horarioAntigo!);

    const embedAddBoss = new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle(`${username} anotou ${bossAntigo?.nome} sala ${salaBoss}`)
        .addFields([{ name: `${bold('Horário Novo: ' + horarioInformado.format("HH:mm (DD/MM)"))}`, value: 'Horário Antigo: ' + horarioAntigo?.format("HH:mm (DD/MM)") }])
        .setFooter({ text: `Tempo gasto: ${diferencaFormatada}` })

    if (quantidadeAnotacoesUsuario) {
        embedAddBoss.addFields({ name: `\u200B`, value: `Anotações de ${username}: ${quantidadeAnotacoesUsuario}`});
    }

    return embedAddBoss;
}

export { getEmbedAddBoss }
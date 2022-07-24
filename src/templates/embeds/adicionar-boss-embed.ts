import { bold } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Moment } from "moment";
import { ListBossSingleton } from "../../models/singleton/list-boss-singleton";
import { getIdBossByDoc } from "../../utils/geral-utils";

const getEmbedAddBoss = (nomeDocBoss: string, horarioInformado: Moment, salaBoss: number, username: string): EmbedBuilder => {
    const bossAntigo = ListBossSingleton.getInstance().boss.find(b => b.id === getIdBossByDoc(nomeDocBoss));

    const horarioAntigo: string = bossAntigo?.salas.get(salaBoss)?.format("HH:mm (DD/MM)") + '';
    const horarioNovo: string = horarioInformado.format("HH:mm (DD/MM)");

    const embedAddBoss = new EmbedBuilder()
        .setTitle(`${username} anotou ${bossAntigo?.nome} sala ${salaBoss}`)
        .addFields([{ name: `${bold('Horário Novo: ' + horarioNovo)}`, value: 'Horário Antigo: ' + horarioAntigo }])
        .setColor("Purple");

    return embedAddBoss;
}

export { getEmbedAddBoss }
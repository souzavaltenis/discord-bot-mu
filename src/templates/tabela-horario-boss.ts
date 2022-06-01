import { MessageEmbed, TextBasedChannel } from "discord.js";
import { Boss } from "../models/boss";
import { consultarHorarioBoss } from "../db/db";
import { formatBoss, formatSalaBoss } from "../utils/boss-utils";
import { gerarTabelaSalas, tracos, underbold } from "../utils/geral-utils";
import { agendarAvisos } from "../utils/avisos-utils";
import { SalaBoss } from "../models/sala-boss";

const mostrarHorarios = async (textChannel: TextBasedChannel | null) => {

    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        agendarAvisos(listaBoss);

        const embedTabelaBoss = new MessageEmbed()
            .setColor("DARK_BLUE")
            .setTitle("Tabela de Horários por Boss")
            .setDescription("\u200B")
            .setFooter({ text: "Listar horários por sala: /list\nAdicionar horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' })
            .setTimestamp();

        listaBoss.forEach((boss: Boss) => embedTabelaBoss.addField(boss.nome, formatBoss(boss)));

        embedTabelaBoss.addField("Descrição Ícones", `${tracos(55)}\n✅ aberto ❌ vencido 💤 irá abrir\n${tracos(55)}`);

        await textChannel?.send({ embeds: [embedTabelaBoss] });
    });
}

const mostrarSalas = async (textChannel: TextBasedChannel | null) => {
    
    await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {

        agendarAvisos(listaBoss);

        const embedTabelaSalas = new MessageEmbed()
            .setColor("DARK_BLUE")
            .setTitle("Tabela de Horários por Sala")
            .setDescription("\u200B")
            .setFooter({ text: "Listar horários por sala: /list\nAdicionar horário: /add", iconURL: 'https://i.imgur.com/VzgX7yd.jpg' })
            .setTimestamp();

        const mapSalasHorarios: Map<number, SalaBoss[]> = gerarTabelaSalas(listaBoss);

        mapSalasHorarios.forEach((bossSala: SalaBoss[], sala: number) => {
            embedTabelaSalas.addField(`${underbold('Sala')} ${underbold(sala+'')}`, formatSalaBoss(bossSala));
        });

        embedTabelaSalas.addField("Descrição Ícones", `${tracos(62)}\n✅ aberto ❌ vencido 💤 irá abrir\n${tracos(62)}`);

        await textChannel?.send({ embeds: [embedTabelaSalas] });
    });
}

export { mostrarHorarios, mostrarSalas };
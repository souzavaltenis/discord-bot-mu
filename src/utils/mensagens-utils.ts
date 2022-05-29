import { TextBasedChannel, MessageEmbed } from "discord.js";
import { mostrarHorarios } from "../templates/tabela-horario-boss";
import { numberToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = async (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): Promise<void> => {
    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setTitle("✅ AVISO")
        .setDescription(`Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('abriu')}  🕗`)
        .setTimestamp();

    await mostrarHorarios(textChannel);
    await textChannel?.send({ embeds: [emebedAvisoAbertura] });
}

const mensagemAvisoFechamento = async (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): Promise<void> => {
    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setTitle("❌ AVISO")
        .setDescription(`Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('fechou')}  🕛`)
        .setTimestamp();

    await mostrarHorarios(textChannel);
    await textChannel?.send({ embeds: [emebedAvisoFechamento] });
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
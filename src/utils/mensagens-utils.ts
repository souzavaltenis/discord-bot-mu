import { underscore, bold } from "@discordjs/builders";
import { TextBasedChannel, MessageEmbed } from "discord.js";
import { numberToEmoji } from "./geral-utils";

const mensagemAvisoAbertura = (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): void => {
    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setTitle("✅ AVISO")
        .setDescription(`Boss ${underscore(bold(nomeBoss))} sala ${numberToEmoji(salaBoss)} abriu  🕗`)
        .setTimestamp();
    textChannel?.send({ embeds: [emebedAvisoAbertura] });
}

const mensagemAvisoFechamento = (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): void => {
    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setTitle("❌ AVISO")
        .setDescription(`Boss ${underscore(bold(nomeBoss))} sala ${numberToEmoji(salaBoss)} fechou  🕛`)
        .setTimestamp();
    textChannel?.send({ embeds: [emebedAvisoFechamento] });
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
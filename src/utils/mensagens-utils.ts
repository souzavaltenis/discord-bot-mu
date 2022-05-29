import { TextBasedChannel, MessageEmbed } from "discord.js";
import { numberToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): void => {
    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setTitle("✅ AVISO")
        .setDescription(`Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('abriu')}  🕗`)
        .setTimestamp();
    textChannel?.send({ embeds: [emebedAvisoAbertura] });
}

const mensagemAvisoFechamento = (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): void => {
    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setTitle("❌ AVISO")
        .setDescription(`Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('fechou')}  🕛`)
        .setTimestamp();
    textChannel?.send({ embeds: [emebedAvisoFechamento] });
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
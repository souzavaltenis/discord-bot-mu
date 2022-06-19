import { TextBasedChannel, MessageEmbed, Message } from "discord.js";
import { Boss } from "../models/boss";
import { LastMessageSingleton } from "../models/singleton/last-message-singleton";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { numberToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = async (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): Promise<void> => {
    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setDescription(`✅ Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('abriu')}  🕗`);

    await verificarAtualizacaoMessage(textChannel);

    await textChannel?.send({ embeds: [emebedAvisoAbertura] });
}

const mensagemAvisoFechamento = async (nomeBoss: string, salaBoss: number, textChannel: TextBasedChannel | null): Promise<void> => {
    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setDescription(`❌ Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('fechou')}  🕛`);

    await verificarAtualizacaoMessage(textChannel);
    
    await textChannel?.send({ embeds: [emebedAvisoFechamento] });
}

const verificarAtualizacaoMessage = async (textChannel: TextBasedChannel | null): Promise<void> => {
    const lastMessage: Message | undefined = LastMessageSingleton.getInstance().lastMessage;
    if (!lastMessage) return;

    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
    if (listaBoss.length === 0) return;

    await textChannel?.messages.fetch(lastMessage?.id+'')
        .then(async (message: Message) => {
            await message.edit({ embeds: [getEmbedTabelaBoss(listaBoss)] });
        }).catch(e => console.log(e));
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
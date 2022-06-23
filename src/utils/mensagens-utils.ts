import { bold } from "@discordjs/builders";
import { MessageEmbed, Message, TextChannel } from "discord.js";
import { config } from "../config/get-configs";
import { client } from "../index";
import { Boss } from "../models/boss";
import { GeralSingleton } from "../models/singleton/geral-singleton";
import { LastMessageSingleton } from "../models/singleton/last-message-singleton";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { dataNowString } from "./data-utils";
import { numberToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const textChannel = client.channels.cache.get(config.channelTextId) as TextChannel;

    const isIgnoreAviso = verificarAvisoReset();
    if (isIgnoreAviso) return;

    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setDescription(`✅ Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('abriu')}  🕗 [${dataNowString('HH:mm')}]`);

    await verificarAtualizacaoMessage();

    await textChannel?.send({ embeds: [emebedAvisoAbertura] });
}

const mensagemAvisoFechamento = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const textChannel = client.channels.cache.get(config.channelTextId) as TextChannel;

    const isIgnoreAviso = verificarAvisoReset();
    if (isIgnoreAviso) return;

    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setDescription(`❌ Boss ${underbold(nomeBoss)} sala ${numberToEmoji(salaBoss)} ${underbold('fechou')}  🕛 [${dataNowString('HH:mm')}]`);

    await verificarAtualizacaoMessage();
    
    await textChannel?.send({ embeds: [emebedAvisoFechamento] });
}

const verificarAtualizacaoMessage = async (): Promise<void> => {
    const textChannel = client.channels.cache.get(config.channelTextId) as TextChannel;

    const lastMessage: Message | undefined = LastMessageSingleton.getInstance().lastMessage;
    if (!lastMessage) return;

    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
    if (listaBoss.length === 0) return;

    await textChannel?.messages.fetch(lastMessage?.id+'')
        .then(async (message: Message) => {
            await message.edit({ embeds: [getEmbedTabelaBoss(listaBoss)] });
        }).catch(e => console.log(e));
}

const verificarAvisoReset = (): boolean => {
    const textChannel = client.channels.cache.get(config.channelTextId) as TextChannel;
    const geral = GeralSingleton.getInstance();

    if (geral.isReset && geral.isAvisoReset === false) {
        textChannel?.send(`📢 @everyone Bora ${textChannel.guild.name}, estão perdendo tempo, ${bold('TODOS OS BOSS ABRIRAM')}, boa sorte!`);
        verificarAtualizacaoMessage();
        geral.isAvisoReset = true;
    }

    return geral.isReset;
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
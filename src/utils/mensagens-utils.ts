import { bold } from "@discordjs/builders";
import { MessageEmbed, Message, TextChannel, MessageButton } from "discord.js";
import { config } from "../config/get-configs";
import { sincronizarConfigsBot } from "../db/db";
import { client } from "../index";
import { Boss } from "../models/boss";
import { Ids } from "../models/ids";
import { LastMessageSingleton } from "../models/singleton/last-message-singleton";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { atualizarStatusBot } from "./boss-utils";
import { disableButton } from "./buttons-utils";
import { dataNowString } from "./data-utils";
import { numbersToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

    const isIgnoreAviso = verificarAvisoReset();
    if (isIgnoreAviso) return;

    const emebedAvisoAbertura = new MessageEmbed()
        .setColor("GREEN")
        .setDescription(`✅ Boss ${underbold(nomeBoss)} sala ${numbersToEmoji(salaBoss)} ${underbold('abriu')}  🕗 [${dataNowString('HH:mm')}]`);

    await textChannel?.send({ embeds: [emebedAvisoAbertura] }).then(async messageAlert => await apagarUltimoAviso(messageAlert));
    await atualizarStatusBot();
    await verificarAtualizacaoMessage();
}

const mensagemAvisoFechamento = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

    const isIgnoreAviso = verificarAvisoReset();
    if (isIgnoreAviso) return;

    const emebedAvisoFechamento = new MessageEmbed()
        .setColor("RED")
        .setDescription(`❌ Boss ${underbold(nomeBoss)} sala ${numbersToEmoji(salaBoss)} ${underbold('fechou')}  🕛 [${dataNowString('HH:mm')}]`);
        
    await textChannel?.send({ embeds: [emebedAvisoFechamento] }).then(async messageAlert => await apagarUltimoAviso(messageAlert));
    await atualizarStatusBot();
    await verificarAtualizacaoMessage();
}

const apagarUltimoAviso = async (message: Message): Promise<void> => {
    const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
    const lastMessageAlert = LastMessageSingleton.getInstance().lastMessageAlert;

    if (lastMessageAlert) {
        await textChannel.messages.fetch(lastMessageAlert.id).then(m => m.delete());
    }

    LastMessageSingleton.getInstance().lastMessageAlert = message;
}

const verificarAtualizacaoMessage = async (): Promise<void> => {
    const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

    const lastMessage: Message | undefined = LastMessageSingleton.getInstance().lastMessage;
    if (!lastMessage) return;

    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
    if (listaBoss.length === 0) return;

    await textChannel?.messages.fetch(lastMessage?.id+'')
        .then(async (message: Message) => {
            const buttons: MessageButton[] = getButtonsTabela();
            const rowButtons = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);
            await message.edit({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] });
        }).catch(e => console.log(e));
}

const verificarAvisoReset = (): boolean => {
    if (config().mu.isHorariosReset && config().mu.isAvisoReset === false) {
        const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;
        textChannel?.send(`📢 @everyone Bora ${textChannel.guild.name}, ${bold('TODOS OS BOSS ABRIRAM')}, boa sorte!`);
        
        verificarAtualizacaoMessage();

        config().mu.isAvisoReset = true;
        sincronizarConfigsBot();
    }

    return config().mu.isHorariosReset;
}

export { mensagemAvisoAbertura, mensagemAvisoFechamento }
import { bold } from "@discordjs/builders";
import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { config } from "../config/get-configs";
import { sincronizarConfigsBot } from "../db/db";
import { Boss } from "../models/boss";
import { Ids } from "../models/ids";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { atualizarStatusBot } from "./boss-utils";
import { disableButton } from "./buttons-utils";
import { mainTextChannel } from "./channels-utils";
import { dataNowString } from "./data-utils";
import { numbersToEmoji, underbold } from "./geral-utils";

const mensagemAvisoAbertura = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const emebedAvisoAbertura = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ Boss ${underbold(nomeBoss)} sala ${numbersToEmoji(salaBoss)} ${underbold('abriu')} 🕗 [${dataNowString('HH:mm')}]`);

    await mainTextChannel()?.send({ embeds: [emebedAvisoAbertura] }).then(async messageAlert => await atualizarInformacoes(messageAlert.id));
}

const mensagemAvisoFechamento = async (nomeBoss: string, salaBoss: number): Promise<void> => {
    const emebedAvisoFechamento = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`❌ Boss ${underbold(nomeBoss)} sala ${numbersToEmoji(salaBoss)} ${underbold('fechou')} 🕛 [${dataNowString('HH:mm')}]`);
        
    await mainTextChannel()?.send({ embeds: [emebedAvisoFechamento] }).then(async messageAlert => await atualizarInformacoes(messageAlert.id));
}

const mensagemAvisoAberturaGeral = async (): Promise<void> => {
    const textChannel: TextChannel | undefined = mainTextChannel();
    
    const emebedAvisoAberturaGeral = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`📢 Bora ${textChannel?.guild.name}, ${bold('TODOS BOSS ABRIRAM')}, boa sorte!`);
    
    config().mu.isHorariosReset = false;
    await mostrarHorarios(textChannel);
    await mainTextChannel()?.send({ content: '@everyone', embeds: [emebedAvisoAberturaGeral] }).then(async messageAlert => await atualizarInformacoes(messageAlert.id));
}

const atualizarInformacoes = async (messageAlertId: string): Promise<void> => {
    await apagarUltimoAviso();
    config().geral.idLastMessageBossAlert = messageAlertId;

    await atualizarStatusBot();
    await verificarAtualizacaoMessage();
    await sincronizarConfigsBot();
}

const apagarUltimoAviso = async (): Promise<void> => {
    const idLastMessageBossAlert: string = config().geral.idLastMessageBossAlert;

    if (idLastMessageBossAlert) {
        await mainTextChannel()?.messages.fetch(idLastMessageBossAlert)
            .catch(() => null)
            .then(async (m: Message | null) => {
                if (!m) return;
                await m.delete();
            });
    }
}

const verificarAtualizacaoMessage = async (): Promise<void> => {
    const idLastMessageBoss: string = config().geral.idLastMessageBoss;
    if (!idLastMessageBoss) return;

    const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
    if (listaBoss.length === 0) return;

    await mainTextChannel()?.messages.fetch(idLastMessageBoss)
        .catch(() => null)
        .then(async (message: Message | null) => {
            if (!message) return;
            const rowButtons = disableButton(getButtonsTabela(), Ids.BUTTON_TABLE_BOSS);
            await message.edit({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] });
        });
}

export {
    mensagemAvisoAbertura, 
    mensagemAvisoFechamento,
    mensagemAvisoAberturaGeral
}
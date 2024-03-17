import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, bold, ButtonBuilder, ChatInputCommandInteraction, EmbedBuilder, Interaction, InteractionResponse, MessageComponentInteraction } from "discord.js";
import { Moment } from "moment";
import { realizarBackupHorarios, adicionarHorarioBoss, sincronizarConfigsBot, consultarUsuarios, resetarTempoOnlineUsuarios } from "../db/db";
import { Ids } from "../models/ids";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getButtonsSimNao } from "../templates/buttons/sim-nao-buttons";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from "../utils/data-utils";
import { getLogsGeralString, limparIntervalUpdate, sendLogErroInput, sleep } from "../utils/geral-utils";
import { config } from "../config/get-configs";
import { CategoryCommand } from "../models/enum/category-command";
import { mainTextChannel } from "../utils/channels-utils";

export = {
    category: CategoryCommand.BOSS,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Realize resets no bot')
        .addSubcommand(subcommand => {
            subcommand
            .setName('geral')
            .setDescription('Reseta horários em todas salas')
            .addStringOption(option => option.setName('horario').setDescription('Qual horário o servidor voltou?').setRequired(true))
            .addStringOption(option => option.setName('foi_ontem').setDescription('Esse horário foi ontem?').addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' }).setRequired(true));

            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand
            .setName('sala')
            .setDescription('Reseta horários em uma sala específica')
            .addStringOption(option => option.setName('horario').setDescription('Qual horário?').setRequired(true))
            .addNumberOption(option => option.setName('sala').setDescription('Qual sala?').setRequired(true).setMinValue(1).setMaxValue(20))
            .addStringOption(option => option.setName('foi_ontem').setDescription('Esse horário foi ontem?').addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' }).setRequired(true));

            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand
            .setName('rank')
            .setDescription('Reseta o rank de anotações/tempo online')
            .addStringOption(option => option.setName('nova_data').setDescription('Qual será a nova data? No padrão DD/MM/YYYY').setRequired(true))

            return subcommand;
        }),
    
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const opcaoSubCommand = interaction.options.getSubcommand();

        switch (opcaoSubCommand) {
            case 'geral':
            case 'sala':
                resetarHorarios(interaction, opcaoSubCommand);
                break;
            case 'rank':
                resetarRankAnotacoes(interaction);
                break;
        }
    },

}

async function resetarHorarios(interaction: ChatInputCommandInteraction, opcaoSubCommand: string): Promise<InteractionResponse<boolean> | undefined> {
    const horario: string = interaction.options.getString('horario') || '';

    if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) {
        const msgErroHorario: string = `${interaction.user} Horário (${bold(horario)}) não é reconhecido! Use como exemplo: 15:46`;
        await sendLogErroInput(interaction, msgErroHorario);
        return await interaction.reply({
            content: msgErroHorario,
            ephemeral: true
        });
    }

    const foiontem: string = interaction.options.getString('foi_ontem') || '';
    const horarioReset: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${horario} -0300`);

    if (foiontem === 'N' && distanceDatasInMinutes(horarioReset, dataNowMoment()) >= 40) {
        const msgErroHorarioData: string = `${interaction.user} Horário (${bold(horario)}) é muito distante! Se foi de ontem, preencha o último campo com ${bold('Sim')}`;
        await sendLogErroInput(interaction, msgErroHorarioData);
        return await interaction.reply({
            content: msgErroHorarioData,
            ephemeral: true
        });
    }

    if (foiontem === 'S') {
        horarioReset.subtract(1, 'day');
    }

    const sala: number = interaction.options.getNumber('sala') || 0;

    if (!config().mu.salasPermitidas.includes(sala) && opcaoSubCommand === "sala") {
        const msgErroSala: string = `${interaction.user} sala ${sala} não foi encontrada`;
        await sendLogErroInput(interaction, msgErroSala);

        return await interaction.reply({
            content: msgErroSala,
            ephemeral: true
        });
    }

    const buttonsSimNao: ButtonBuilder[] = getButtonsSimNao();
    const rowButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(buttonsSimNao);

    let mensagemReset: string = '';

    switch (opcaoSubCommand) {
        case 'geral': mensagemReset +=  `\nIsso substituirá ${bold('TODOS')} horários em ${bold('TODAS')} salas`; break;
        case 'sala': mensagemReset +=  `\nIsso substituirá ${bold('TODOS')} horários na ${bold('Sala ' + sala)}`; break;
    }

    const embedReset = new EmbedBuilder()
        .setColor('DarkRed')
        .addFields([
            { name: 'Tipo de Reset', value: opcaoSubCommand },
            { name: 'Novo Horário', value: horarioReset.format('HH:mm (DD/MM)') },
            { name: 'Aviso', value: mensagemReset }
        ])
        .setTimestamp();

    await interaction.reply({ embeds: [embedReset] });

    let msgComando: string = opcaoSubCommand === 'sala' ? `sala ${sala}` : opcaoSubCommand;
    msgComando = bold(msgComando);

    const message = await interaction.channel?.send({ content: `${interaction.user} você confirma esse reset ${msgComando}?`, components: [rowButtons] });

    const collector = message?.createMessageComponentCollector({ filter: (i: Interaction) => i.isButton(), time: 1000 * 60 });

    collector?.on("collect", async (interactionMessage: MessageComponentInteraction) => {

        await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

        let msgBotoes: string = '';

        switch(interactionMessage.customId) {
            case Ids.BUTTON_SIM_RESET: 
                msgBotoes = `🔄 Reset ${msgComando} foi confirmado por ${interactionMessage.user} e será concluído em instantes...`; 
                break;
            case Ids.BUTTON_NAO_RESET:
                msgBotoes = `❌ Reset ${msgComando} foi cancelado por ${interactionMessage.user}`;
                break;
        }
        
        limparIntervalUpdate();
        await message?.edit({content: msgBotoes, components: [] });
        await interactionMessage.deferUpdate();

        if (interactionMessage.customId === Ids.BUTTON_SIM_RESET) {
            await resetHorarios(interactionMessage, opcaoSubCommand, msgComando, horarioReset, sala); 
        }
    });

    async function resetHorarios(interaction: MessageComponentInteraction, opcaoSubCommand: string, msgComando: string, horarioReset: Moment, sala: number): Promise<void> {
        await realizarBackupHorarios(dataNowMoment(), `${interaction.user.tag} (${interaction.user.id})`, `${opcaoSubCommand}${sala ? sala : ''}`);

        const docsBoss: string[] = Object.values(config().documents);

        if (opcaoSubCommand === 'sala' && sala) {
            for (const doc of docsBoss) {
                await adicionarHorarioBoss({
                    nomeDocBoss: doc,
                    salaBoss: sala + '',
                    horarioInformado: momentToString(horarioReset),
                    timestampAcao: dataNowMoment().valueOf()
                } as IBossInfoAdd);
                await sleep(300);
            }

        } else if (opcaoSubCommand === 'geral') {
            for (const doc of docsBoss) {
                for (const salaPermitida of config().mu.salasPermitidas) {
                    await adicionarHorarioBoss({
                        nomeDocBoss: doc,
                        salaBoss: salaPermitida + '',
                        horarioInformado: momentToString(horarioReset),
                        timestampAcao: dataNowMoment().valueOf()
                    } as IBossInfoAdd);
                    await sleep(300);
                }
            }
        }

        config().mu.isHorariosReset = opcaoSubCommand === 'geral';
        
        await sleep(3000);
        await mostrarHorarios(interaction.channel);
        await interaction.channel?.send({ content: `✅ Reset ${msgComando} para ${bold(horarioReset.format('HH:mm (DD/MM)'))} confirmado por ${interaction.user} foi concluído com sucesso!` });
        await sincronizarConfigsBot();
    }
}

async function resetarRankAnotacoes(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | undefined> {
    const idUserOwnerGuild: string | undefined = interaction.guild?.ownerId;
    const idUserInteraction: string = interaction.user.id;
    const idGuildInteraction: string | null = interaction.guildId;
    const idGuildMain: string | undefined = mainTextChannel()?.guildId;

    if (idGuildInteraction !== idGuildMain || idUserInteraction !== idUserOwnerGuild) {
        const msgErroPermissao: string = `${interaction.user} somente o dono do servidor (<@${idUserOwnerGuild}>) pode usar esse comando!`;
        await sendLogErroInput(interaction, msgErroPermissao);
        return await interaction.reply({
            content: msgErroPermissao,
            ephemeral: true
        });
    }

    const textoNovaData: string = interaction.options.getString('nova_data') || '';

    if (!(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/).test(textoNovaData)) {
        const msgErroData: string = `${interaction.user} A data (${bold(textoNovaData)}) não é válida! Use como exemplo: 31/12/2023, padrão [DD/MM/YYYY]`;
        await sendLogErroInput(interaction, msgErroData);
        return await interaction.reply({
            content: msgErroData,
            ephemeral: true
        });
    }

    const textoNovaDataCompleto: string = textoNovaData + ' 00:00 -03:00'; 

    if (stringToMoment(textoNovaDataCompleto).valueOf() < dataNowMoment(true).valueOf()) {
        const msgErroData: string = `${interaction.user} A data informada precisa ser igual ou maior que a data de hoje (${dataNowMoment().format('DD/MM/YYYY')})`;
        await sendLogErroInput(interaction, msgErroData);
        return await interaction.reply({
            content: msgErroData,
            ephemeral: true
        });
    }

    config().geral.dateNewRank = textoNovaDataCompleto;
    await sincronizarConfigsBot();
    await resetarTempoOnlineUsuarios();
    await consultarUsuarios();

    await mostrarHorarios(interaction.channel);
    await interaction.channel?.send({
        content: `✅ Reset do Rank Anotações para ${textoNovaData} confirmado por ${interaction.user} foi concluído com sucesso!`
    });
}
import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { Moment } from "moment";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getButtonsSimNao } from "../templates/buttons/sim-nao-buttons";
import { dataNowMoment, dataNowString, distanceDatasInMinutes, momentToString, stringToMoment } from "../utils/data-utils";
import { getLogsGeralString, sendLogErroInput } from "../utils/geral-utils";
import { config } from '../config/get-configs';
import { Ids } from "../models/ids";
import { adicionarHorarioBoss, consultarHorarioBoss, realizarBackupHorarios } from "../db/db";
import { Boss } from "../models/boss";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { agendarAvisos } from "../utils/avisos-utils";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { GeralSingleton } from "../models/singleton/geral-singleton";

export class Reset {
    data = new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Informe horário que o servidor voltou')
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
            .addNumberOption(option => {
                option.setName('sala').setDescription('Qual sala?').setRequired(true);

                config().mu.salasPermitidas.forEach((sala: number) => {
                    option.addChoices({ name: `Sala ${sala}`, value: sala});
                });

                return option;
            })
            .addStringOption(option => option.setName('foi_ontem').setDescription('Esse horário foi ontem?').addChoices({ name: 'Não', value: 'N' }, { name: 'Sim', value: 'S' }).setRequired(true));

            return subcommand;
        });

    async execute(interaction: CommandInteraction): Promise<void> {
        const opcaoSubCommand = interaction.options.getSubcommand();

        const horario: string = interaction.options.getString('horario') || '';

        if (!(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) {
            const msgErroHorario: string = `${interaction.user} Horário (${bold(horario)}) não é reconhecido! Use como exemplo: 15:46`;
            await sendLogErroInput(interaction, msgErroHorario);
            await interaction.reply(msgErroHorario);
            return;
        }

        const foiontem: string = interaction.options.getString('foi_ontem') || '';
        const horarioReset: Moment = stringToMoment(`${dataNowString('DD/MM/YYYY')} ${horario} -0300`);

        if (foiontem === 'N' && distanceDatasInMinutes(horarioReset, dataNowMoment()) >= 40) {
            const msgErroHorarioData: string = `${interaction.user} Horário (${bold(horario)}) é muito distante! Se foi de ontem, preencha o último campo com ${bold('Sim')}`;
            await sendLogErroInput(interaction, msgErroHorarioData);
            await interaction.reply(msgErroHorarioData);
            return;
        }

        if (foiontem === 'S') {
            horarioReset.subtract(1, 'day');
        }

        const sala: number = interaction.options.getNumber('sala') || 0;

        const buttonsSimNao: MessageButton[] = getButtonsSimNao();
        const rowButtons = new MessageActionRow().setComponents(buttonsSimNao);

        let mensagemReset: string = '';

        switch (opcaoSubCommand) {
            case 'geral': mensagemReset +=  `\nIsso substituirá ${bold('TODOS')} horários em ${bold('TODAS')} salas`; break;
            case 'sala': mensagemReset +=  `\nIsso substituirá ${bold('TODOS')} horários na ${bold('Sala ' + sala)}`; break;
        }

        const embedReset = new MessageEmbed()
            .setColor('DARK_RED')
            .addFields(
                { name: 'Tipo de Reset', value: opcaoSubCommand },
                { name: 'Novo Horário', value: horarioReset.format('HH:mm (DD/MM)') },
                { name: 'Aviso', value: mensagemReset }
            )
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
                    this.resetHorarios(interactionMessage, opcaoSubCommand, msgComando, horarioReset, sala); 
                    break;
                case Ids.BUTTON_NAO_RESET:
                    msgBotoes = `❌ Reset ${msgComando} foi cancelado por ${interactionMessage.user}`;
                    break;
            }

            message?.edit({content: msgBotoes, components: [] });
            await interactionMessage.deferUpdate();
        });
    }

    async resetHorarios(interaction: MessageComponentInteraction, opcaoSubCommand: string, msgComando: string, horarioReset: Moment, sala: number): Promise<void> {

        await realizarBackupHorarios(dataNowMoment(), `${interaction.user.tag} (${interaction.user.id})`, `${opcaoSubCommand}${sala ? sala : ''}`);

        const docsBoss: string[] = [
            config().documents.rei,
            config().documents.relics,
            config().documents.fenix,
            config().documents.deathBeam,
            config().documents.geno
        ];

        if (opcaoSubCommand === 'sala' && sala) {
            for (const doc of docsBoss) {
                await adicionarHorarioBoss({
                    nomeDocBoss: doc,
                    salaBoss: sala+'',
                    horarioInformado: momentToString(horarioReset),
                    timestampAcao: dataNowMoment().valueOf()
                } as IBossInfoAdd);
            }

        } else if (opcaoSubCommand === 'geral') {
            for (const doc of docsBoss) {
                for (const salaPermitida of config().mu.salasPermitidas) {
                    await adicionarHorarioBoss({
                        nomeDocBoss: doc,
                        salaBoss: salaPermitida+'',
                        horarioInformado: momentToString(horarioReset),
                        timestampAcao: dataNowMoment().valueOf()
                    } as IBossInfoAdd);
                }
            }
        }

        await consultarHorarioBoss().then(async (listaBoss: Boss[]) => {
            await mostrarHorarios(interaction.channel);
            await interaction.channel?.send({ content: `✅ Reset ${msgComando} para ${bold(horarioReset.format('HH:mm (DD/MM)'))} confirmado por ${interaction.user} foi concluído com sucesso!` });
            agendarAvisos(listaBoss);
            GeralSingleton.getInstance().isReset = opcaoSubCommand === 'geral';
        });

    }
}
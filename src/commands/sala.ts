import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction, MessageComponentInteraction } from "discord.js";
import { config } from '../config/get-configs';
import { adicionarSala, removerSala, sincronizarConfigsBot } from "../db/db";
import { Ids } from "../models/ids";
import { sendMessageKafka } from "../services/kafka/kafka-producer";
import { getButtonsSimNaoSala } from "../templates/buttons/sim-nao-buttons-sala";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { getLogsGeralString, sendLogErroInput } from "../utils/geral-utils";

export class Sala {
    data = new SlashCommandBuilder()
        .setName('sala')
        .setDescription('Gerenciar salas')
        .addSubcommand(subcommand => {
            subcommand
                .setName('adicionar')
                .setDescription('Adiciona uma sala')
                .addNumberOption(option => option.setName('sala').setDescription('Qual sala?').setRequired(true).setMinValue(1).setMaxValue(20));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('remover')
                .setDescription('Remover uma sala')
                .addNumberOption(option => option.setName('sala').setDescription('Qual sala?').setRequired(true).setMinValue(1).setMaxValue(20));
            return subcommand;
        });

    async execute(interaction: CommandInteraction): Promise<void> {
        const opcaoSubCommand = interaction.options.getSubcommand();
        const sala: number = interaction.options.getNumber('sala', true);

        if (opcaoSubCommand === "adicionar") {
            if (config().mu.salasPermitidas.includes(sala)) {
                const msgErroSalaExiste: string = `Sala ${sala} já existe!`;
                await sendLogErroInput(interaction, msgErroSalaExiste);
                return await interaction.reply({
                    content: msgErroSalaExiste,
                    ephemeral: true
                });
            }

            if (config().mu.salasPermitidas.length >= config().mu.limitSalas) {
                const msgErroLimiteSala: string = `Falha! O limite de ${config().mu.limitSalas} salas foi atingido.`;
                await sendLogErroInput(interaction, msgErroLimiteSala);
                return await interaction.reply({
                    content: msgErroLimiteSala,
                    ephemeral: true
                });
            }

            config().mu.salasPermitidas.push(sala);
            await adicionarSala(sala);

            await interaction.deferReply();
            await interaction.deleteReply();

            await mostrarHorarios(interaction.channel);
            await interaction.channel?.send(
                `✅ ${interaction.user} sala ${sala} adicionada com sucesso!` +
                `\nCaso queira adicionar um horário único nessa sala, utilize o comando ${bold('/reset sala')}`
            );
        }

        if (opcaoSubCommand === "remover") {
            if (!config().mu.salasPermitidas.includes(sala)) {
                const msgErroSalaInvalida: string = `Sala ${sala} não existe.`;
                await sendLogErroInput(interaction, msgErroSalaInvalida);
                return await interaction.reply({
                    content: msgErroSalaInvalida,
                    ephemeral: true
                });
            }

            await interaction.deferReply();
            await interaction.deleteReply();

            const message = await interaction.channel?.send({ content: `${interaction.user} você confirma a exclusão da sala ${sala}?`, components: [getButtonsSimNaoSala()] });
            const collector = message?.createMessageComponentCollector({ filter: (i: Interaction) => i.isButton(), time: 1000 * 60 });
            collector?.on("collect", async (interactionMessage: MessageComponentInteraction) => {

                await sendMessageKafka(config().kafka.topicLogsGeralBot, getLogsGeralString({ msgInteraction: interactionMessage }));

                let msgBotoes: string = '';

                switch(interactionMessage.customId) {
                    case Ids.BUTTON_SIM_REMOVE_SALA: 
                        msgBotoes = `🔄 Exclusão sala ${sala} foi confirmado por ${interactionMessage.user} e será concluída em instantes...`; 
                        break;
                    case Ids.BUTTON_NAO_REMOVE_SALA:
                        msgBotoes = `❌ Exclusão sala ${sala} foi cancelada por ${interactionMessage.user}`;
                        break;
                }

                await message?.edit({content: msgBotoes, components: [] });
                await interactionMessage.deferUpdate();

                if (interactionMessage.customId === Ids.BUTTON_SIM_REMOVE_SALA) {
                    config().mu.salasPermitidas = config().mu.salasPermitidas.filter(s => s !== sala);
                    await removerSala(sala);
                    await mostrarHorarios(interaction.channel);
                    await interaction.channel?.send({ content: `✅ Sala ${sala} excluída com sucesso por ${interaction.user}` });
                }
            });
        }

        await sincronizarConfigsBot();
    }
}
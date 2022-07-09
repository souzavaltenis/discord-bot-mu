import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import { CommandInteraction, Message, MessageButton, TextChannel } from "discord.js";
import { client } from "../index";
import { config } from "../config/get-configs";
import { sincronizarConfigsBot } from "../db/db";
import { getButtonsTabela } from "../templates/buttons/style-tabela-buttons";
import { disableButton } from "../utils/buttons-utils";
import { Ids } from "../models/ids";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";
import { Boss } from "../models/boss";
import { ListBossSingleton } from "../models/singleton/list-boss-singleton";

export class Admin {
    data = new SlashCommandBuilder()
        .setName('admin')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Comandos para meu criador')
        .addSubcommand(subcommand => {
            subcommand.setName('say')
                .setDescription('Informe uma mensagem para enviar no canal de horários')
                .addStringOption(option => option.setName('msg').setDescription('.').setRequired(true));
            return subcommand;
        })
        .addSubcommand(subcommand => {
            subcommand.setName('aviso_footer')
                .setDescription('Informe uma aviso para aparecer no footer')
                .addStringOption(option => option.setName('msg_footer').setDescription('.'));
            return subcommand;
        });

    async execute(interaction: CommandInteraction): Promise<void> {
        if (interaction.user.id !== config().ownerId) {
            await interaction.reply({ content: 'Você não pode utilizar esse comando', ephemeral: true });
            return;
        }

        const opcaoSubCommand = interaction.options.getSubcommand();

        switch(opcaoSubCommand) {
            case "say": await this.subCommandSay(interaction); break;
            case "aviso_footer": await this.subCommandAvisoFooter(interaction); break;
        }
    }

    async subCommandSay(interaction: CommandInteraction): Promise<void> {
        const msg: string = interaction.options.getString('msg', true);
        const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

        if (!client || !textChannel) return;

        await textChannel.send({ content: msg.replace(/\\n/g, '\n') });
        await interaction.reply({ content: `Mensagem foi enviada com sucesso no canal ${bold(textChannel.name)}`, ephemeral: true });
    }

    async subCommandAvisoFooter(interaction: CommandInteraction): Promise<void> {
        const msgFooter: string = interaction.options.getString('msg_footer') || '';
        const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

        config().mu.avisoFooter = msgFooter;
        await sincronizarConfigsBot();

        const idLastMessageBoss: string = config().geral.idLastMessageBoss;

        if (idLastMessageBoss) {
            const listaBoss: Boss[] = ListBossSingleton.getInstance().boss;
            if (listaBoss.length === 0) return;

            await textChannel.messages.fetch(idLastMessageBoss)
                .then(async (m: Message) => {
                    const buttons: MessageButton[] = getButtonsTabela();
                    const rowButtons = disableButton(buttons, Ids.BUTTON_TABLE_BOSS);
                    await m.edit({ embeds: [getEmbedTabelaBoss(listaBoss)], components: [rowButtons] });
                })
                .catch(e => console.log(e));
        }

        await interaction.reply({
            content: `Aviso footer foi atualizado com sucesso para "${msgFooter}"`,
            ephemeral: true
        });
    }

}
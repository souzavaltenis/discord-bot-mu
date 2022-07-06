import { bold, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, TextChannel } from 'discord.js';
import { client } from '../index';
import { config } from '../config/get-configs';
import { PermissionFlagsBits } from 'discord-api-types/v9';

export class Say {
    data = new SlashCommandBuilder()
        .setName('say')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('.')
        .addStringOption(option => option.setName('msg').setDescription('.').setRequired(true));

    async execute(interaction: CommandInteraction): Promise<void> {
        if (interaction.user.id !== config().ownerId) {
            await interaction.reply({ content: 'Você não pode utilizar esse comando', ephemeral: true });
            return;
        }

        const msg: string = interaction.options.getString('msg') || '';
        const textChannel = client.channels.cache.get(config().channels.textHorarios) as TextChannel;

        if (!client || !textChannel) return;

        await textChannel.send({ content: msg.replace(/\\n/g, '\n') });
        await interaction.reply({ content: `Mensagem foi enviada com sucesso no canal ${bold(textChannel.name)}`, ephemeral: true });
    }
}
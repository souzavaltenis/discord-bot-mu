import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { version } from "../../package.json";
import { client } from "../index";
import { CategoryCommand } from "../models/enum/category-command";

export = {
    category: CategoryCommand.GERAL,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comando teste'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const embedPong = new EmbedBuilder()
            .setDescription('🏓 Pong!')
            .setColor('DarkVividPink')
            .setFooter({ text: `${client.ws.ping}ms | version ${version}` });

        await interaction.reply({
            embeds: [embedPong],
            ephemeral: true
        });
    }
}
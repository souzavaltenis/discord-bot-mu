import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { version } from "../../package.json";
import { client } from "../index";
import { CategoryCommand } from "../models/enum/category-command";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { dataNowMoment, distanceDatasString } from "../utils/data-utils";

export = {
    category: CategoryCommand.GERAL,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comando teste'),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const textOnlineSince: string = distanceDatasString(dataNowMoment(), geralSingleton.onlineSince);

        const embedPong = new EmbedBuilder()
            .setDescription('🏓 Pong!')
            .setColor('DarkVividPink')
            .setFooter({ text: `${client.ws.ping}ms | version ${version} | Online ${textOnlineSince}` });

        await interaction.reply({
            embeds: [embedPong],
            ephemeral: true
        });
    }
}
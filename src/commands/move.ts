/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandBuilder, GuildMember, VoiceChannel } from "discord.js";
import { config } from "../config/get-configs";
import { client } from "../index";
import { CategoryCommand } from "../models/enum/category-command";

export = {
    category: CategoryCommand.GERAL,
    data: new ContextMenuCommandBuilder()
        .setName('move')
        .setType(ApplicationCommandType.Message),
        
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const channelBC: VoiceChannel = client.channels.cache.get(config().channels.voiceBC)! as VoiceChannel;
        
        const listaMoves: Promise<GuildMember>[] = [];

        channelBC.members.forEach((member: GuildMember) => {
            listaMoves.push(member.voice.setChannel(config().channels.voiceHorarios));
        });

        await Promise.all(listaMoves);

        await interaction.reply({
            content: `${listaMoves.length} membros movidos!`,
            ephemeral: true
        });
    }
}
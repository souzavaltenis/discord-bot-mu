import { client } from '../index';
import { config } from '../config/get-configs';
import { ChannelType, TextChannel } from 'discord.js';

const mainTextChannel = (): TextChannel | undefined => {
    const channel = client.channels.cache.get(config().channels.textHorarios);
    if (!channel || channel.type !== ChannelType.GuildText) return undefined;
    return channel as TextChannel;
};

export { mainTextChannel }
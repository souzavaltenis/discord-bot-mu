import { Client, Intents } from 'discord.js';
import { config } from './src/config/get-configs';
import { setEvents } from './src/utils/set-events';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

setEvents(client);

client.login(config.token);

export { client }
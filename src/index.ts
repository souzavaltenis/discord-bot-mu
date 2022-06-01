import { Client, Intents } from 'discord.js';
import { config } from './config/get-configs';
import { setEvents } from './utils/set-events';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

setEvents(client);

client.login(config.token);

export { client }
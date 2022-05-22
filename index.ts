import { Client, Intents } from 'discord.js';
import { token } from './config.json';
import { setEvents } from './src/utils/set-events';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

setEvents(client);

client.login(token);
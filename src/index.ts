import { Client, Intents } from 'discord.js';
import { config, loadConfig } from './config/get-configs';
import { listenerErrors } from './utils/aviso-erro';
import { setEvents } from './utils/set-events';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

loadConfig().then(() => {
    setEvents(client);
    client.login(config().bot.token);
    listenerErrors();
});

export { client }
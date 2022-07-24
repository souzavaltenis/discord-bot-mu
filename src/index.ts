import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadData } from './config/get-configs';
import { listenerErrors } from './utils/aviso-erro';
import { setEvents } from './utils/set-events';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

loadData().then(() => {
    setEvents();
    listenerErrors();
    client.login(config().bot.token);
});

export { client }
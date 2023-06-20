import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadData } from './config/get-configs';
import { loadEvents } from './handlers/events-handler';
import { listenerErrors } from './utils/aviso-erro';
import { loadCommands } from './handlers/commands-handler';
import { deployCommands } from './utils/deploy-commands';
import { loadInteractions } from './handlers/interactions-handler';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

loadData().then(async () => {
    await loadInteractions();
    await loadCommands();
    await loadEvents();
    await client.login(config().bot.token);
    await deployCommands();

    listenerErrors();
});

export { client }
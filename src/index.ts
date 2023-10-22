import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadData } from './config/get-configs';
import { loadEvents } from './handlers/events-handler';
import { listenerErrors } from './utils/aviso-erro';
import { loadCommands } from './handlers/commands-handler';
import { deployCommands } from './utils/deploy-commands';
import { loadInteractions } from './handlers/interactions-handler';
import { listenersFirestore } from './db/listeners';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

loadData().then(async () => {
    await loadCommands();
    await loadEvents();
    await loadInteractions();
    await client.login(config().bot.token);
    await deployCommands();

    listenersFirestore();
    listenerErrors();
});

export { client }
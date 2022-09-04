import { Client, GatewayIntentBits } from 'discord.js';
import { config, loadData } from './config/get-configs';
import { loadEvents } from './handlers/events-handler';
import { listenerErrors } from './utils/aviso-erro';
import { Client as ClientStatcord} from 'statcord.js';
import { loadCommands } from './handlers/commands-handler';
import { deployCommands } from './utils/deploy-commands';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
let statcord: ClientStatcord;

loadData().then(async () => {
    statcord = new ClientStatcord({ client: client, key: config().bot.keyStatcord });
    
    await loadCommands();
    await loadEvents();
    await client.login(config().bot.token);
    await deployCommands();

    listenerErrors();
});

export { client, statcord }
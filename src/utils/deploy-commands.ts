import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { config } from '../config/get-configs';
import { Add } from '../commands/add';
import { List } from '../commands/list';
import { Reset } from '../commands/reset';
import { Client, Guild } from 'discord.js';
import { Anotar } from '../commands/anotar';
import { Help } from '../commands/help';
import { Config } from '../commands/config';
import { Sala } from '../commands/sala';
import { Admin } from '../commands/admin';

const deployCommands = async (client: Client, guild: Guild): Promise<unknown> => {
 
    if (!client.user?.id || !guild.id) return;

	const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
        new Add().data.toJSON(),
		new Admin().data.toJSON(),
		new Anotar().data.toJSON(),
		new Config().data.toJSON(),
		new List().data.toJSON(),
		new Reset().data.toJSON(),
		new Help().data.toJSON(),
		new Sala().data.toJSON()
	];
	
	const rest = new REST({ version: '10' }).setToken(config().bot.token);
	
	return rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
		.then((x) => x)
		.catch(console.error);
}

export { deployCommands }


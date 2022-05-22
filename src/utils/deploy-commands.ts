import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { token } from '../../config.json';
import { Add } from '../commands/add';
import { List } from '../commands/list';

const deployCommands = (clientId: string, guildId: string): void => {
	const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
		new Add().data.toJSON(),
		new List().data.toJSON()
	];
	
	const rest = new REST({ version: '9' }).setToken(token);
	
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Comandos registrados com sucesso.'))
		.catch(console.error);
}

export { deployCommands }


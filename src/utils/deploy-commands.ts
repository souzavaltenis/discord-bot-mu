/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { config } from '../config/get-configs';
import { commands } from '../models/singleton/commands-singleton';
import { client } from '../index';

const deployCommands = async (): Promise<void> => {
    if (!client.user?.id || !commands.size) return;

	const commandsData: RESTPostAPIApplicationCommandsJSONBody[] = [...commands].map(([key, value]) => ({ key, value })).map(c => c.value.data.toJSON());
	
	const rest = new REST({ version: '10' }).setToken(config().bot.token);
    
	await rest.put(Routes.applicationCommands(client.user.id), { body: commandsData })
        .then((response: any) => console.log(`📌 SlashCommands registrados: ${response.length}\n`))
        .catch(console.error);
}

export { deployCommands }


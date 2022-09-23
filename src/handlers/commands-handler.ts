import path from 'path';
import fs from 'fs';
import { commands } from '../models/singleton/commands-singleton';

const loadCommands = async (): Promise<void> => {
    const commandsPath: string = path.join(__dirname, '..', 'commands');
    const files: string[] = fs.readdirSync(commandsPath);

    for (const file of files) {
        const filePath: string = path.join(commandsPath, file);
        const command = await import(filePath);
        commands.set(command.data.name, command);
    }

    console.log(`✅ Comandos carregados: ${commands.size}`);
}

export {
    loadCommands
}
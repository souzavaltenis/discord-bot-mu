import path from 'path';
import fs from 'fs';
import { commands } from '../models/singleton/commands-singleton';

const loadCommands = async (): Promise<void> => {
    const eventsPath: string = path.join(__dirname, '..', 'commands');
    const files: string[] = fs.readdirSync(eventsPath);

    for (const file of files) {
        const filePath: string = path.join(eventsPath, file);
        const command = await import(filePath);
        commands.set(command.data.name, command);
    }

    console.log(`✅ Comandos carregados: ${commands.size}`);
}

export {
    loadCommands
}
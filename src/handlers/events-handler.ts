import path from 'path';
import fs from 'fs';
import { client } from "../index";

const loadEvents = async (): Promise<void> => {
    const eventsPath: string = path.join(__dirname, '..', 'events');
    const files: string[] = fs.readdirSync(eventsPath);

    for (const file of files) {
        const filePath: string = path.join(eventsPath, file);
        const event = await import(filePath);
        client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`✅ Eventos carregados: ${files.length}`);
}

export {
    loadEvents
}
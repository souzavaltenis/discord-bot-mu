import path from 'path';
import fs from 'fs';
import { client } from "../index";
import { interactions } from '../models/singleton/interactions-singleton';
import { IBaseHandlerInteraction } from '../models/interface/base-handler-interaction';

const loadEvents = async (): Promise<void> => {
    const eventsPath: string = path.join(__dirname, '..', 'events');
    const files: string[] = fs.readdirSync(eventsPath);

    for (const file of files) {
        const filePath: string = path.join(eventsPath, file);
        const event = await import(filePath);
        client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`✅ Eventos carregados: ${files.length}`);
    loadInteractions();
}

const loadInteractions = async (): Promise<void> => {
    const interactionsPath: string = path.join(__dirname, '..', 'handlers', 'interactions');
    const files: string[] = fs.readdirSync(interactionsPath);
    
    for (const file of files) {
        const filePath: string = path.join(interactionsPath, file);
        const interaction: IBaseHandlerInteraction = await import(filePath) as IBaseHandlerInteraction;
        interactions.set(interaction.name, interaction);
    }
}

export {
    loadEvents
}
import path from 'path';
import fs from 'fs';
import { interactions } from '../models/singleton/interactions-singleton';
import { IBaseHandlerInteraction } from '../models/interface/base-handler-interaction';

const loadInteractions = async (): Promise<void> => {
    const interactionsPath: string = path.join(__dirname, '..', 'interactions');
    const files: string[] = fs.readdirSync(interactionsPath);
    
    for (const file of files) {
        const filePath: string = path.join(interactionsPath, file);
        const interaction: IBaseHandlerInteraction = await import(filePath) as IBaseHandlerInteraction;
        interactions.set(interaction.name, interaction);
    }

    console.log(`✅ Interações carregadas: ${files.length}`);
}

export {
    loadInteractions
}
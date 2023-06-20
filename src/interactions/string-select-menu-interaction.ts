import { StringSelectMenuInteraction } from "discord.js";
import { Ids } from "../models/ids";
import { BackupListaBoss } from "../models/backup-lista-boss";
import { backupsBossSingleton } from "../models/singleton/lista-backup-singleton";
import { getEmbedTabelaBoss } from "../templates/embeds/tabela-boss-embed";

export = {
    name: 'StringSelectMenuInteraction',
    action: async (interaction: StringSelectMenuInteraction): Promise<void> => {
        await interaction.deferUpdate();

        if (interaction.customId === Ids.SELECT_MENU_BACKUP) {
            const indexBackup: number = backupsBossSingleton.backups.findIndex(backup => backup.timestamp+'' === interaction.values[0]);
            if (indexBackup === -1) return;
    
            const backupSelecionado: BackupListaBoss = backupsBossSingleton.backups[indexBackup];
    
            await interaction.message.edit({
                embeds: [getEmbedTabelaBoss(backupSelecionado.listaBoss, backupSelecionado.timestamp)]
            });
        }
    }
}
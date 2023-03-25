import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { BackupListaBoss } from "../../models/backup-lista-boss";
import { Ids } from "../../models/ids";
import { timestampToMoment } from "../../utils/data-utils";

const getSelectMenuBackup = (listaBackup: BackupListaBoss[]): ActionRowBuilder<StringSelectMenuBuilder> => {
    const menu = new StringSelectMenuBuilder()
        .setCustomId(Ids.SELECT_MENU_BACKUP)
        .setPlaceholder('Clique aqui e selecione um backup');

    listaBackup.forEach((backup: BackupListaBoss) => {
        menu.addOptions({ 
            label: `${timestampToMoment(backup.timestamp).format("HH:mm (DD/MM)")}`, 
            value: backup.timestamp + '' 
        })
    });

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export { getSelectMenuBackup }
import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { BackupListaBoss } from "../../models/backup-lista-boss";
import { Ids } from "../../models/ids";
import { timestampToMoment } from "../../utils/data-utils";

const getSelectMenuBackup = (listaBackup: BackupListaBoss[]): MessageActionRow => {
    const menu = new MessageSelectMenu()
        .setCustomId(Ids.SELECT_MENU_BACKUP)
        .setPlaceholder('Clique aqui e selecione um backup');

    listaBackup.forEach((backup: BackupListaBoss) => {
        menu.addOptions({ 
            label: `${timestampToMoment(backup.timestamp).format("HH:mm (DD/MM)")}`, 
            value: backup.timestamp + '' 
        })
    });

    return new MessageActionRow().addComponents(menu);
}

export { getSelectMenuBackup }
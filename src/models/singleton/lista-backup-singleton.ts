import { BackupListaBoss } from "../backup-lista-boss";

class ListaBossBackupSingleton {
    public backups: BackupListaBoss[] = [];
}

export const backupsBossSingleton = new ListaBossBackupSingleton();

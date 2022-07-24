import { adicionarBackupListaBoss } from "../db/db";

const initBackupListaBoss = () => {
    (function backup() {
        adicionarBackupListaBoss()
        setTimeout(backup, 60 * 60 * 1000);
    })();
}

export { initBackupListaBoss }
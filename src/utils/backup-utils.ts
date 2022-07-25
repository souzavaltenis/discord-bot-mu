import { adicionarBackupListaBoss } from "../db/db";
import { millisecondsToNextHour } from "./data-utils";

const initBackupListaBoss = () => {
    setTimeout(() => {

        (function backup() {
            adicionarBackupListaBoss()
            setTimeout(backup, 60 * 60 * 1000);
        })();
        
    }, millisecondsToNextHour());
}

export { initBackupListaBoss }
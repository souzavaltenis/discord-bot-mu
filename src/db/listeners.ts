import { CollectionReference, collection, onSnapshot } from "@firebase/firestore";
import { db } from "./db";
import { config } from "../config/get-configs";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { mainTextChannel } from "../utils/channels-utils";
import { geralSingleton } from "../models/singleton/geral-singleton";

function listenersFirestore() {
    listenerUpdatesBoss();
}

function listenerUpdatesBoss(): void {
    const collectionRef: CollectionReference = collection(db, config().collections.boss);

    onSnapshot(collectionRef, (snapshot) => {
        const hasBossUpdates: boolean = snapshot.docChanges().some(change => change.type === "modified");

        if (hasBossUpdates && !geralSingleton.updateBotInProgress) {
            mostrarHorarios(mainTextChannel());
        }
    });
}

export {
    listenersFirestore
}
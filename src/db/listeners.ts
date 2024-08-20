import { CollectionReference, DocumentData, QuerySnapshot, collection, onSnapshot } from "@firebase/firestore";
import { carregarConfiguracoes, db } from "./db";
import { config } from "../config/get-configs";
import { mostrarHorarios } from "../templates/messages/tabela-horario-boss";
import { mainTextChannel } from "../utils/channels-utils";
import { existeAtualizacaoExterna } from "../utils/geral-utils";
import dadosConfigJson from '../config/config.json';
import { IDadosConfigsJson } from "../models/interface/config-bot/dados-config-json";
import { name as nomeProjeto } from '../../package.json';

const { collectionConfig } = (dadosConfigJson as IDadosConfigsJson)[nomeProjeto];

function listenersFirestore() {
    listenerUpdatesBoss();
    listenerUpdatesConfig();
}

function listenerUpdatesBoss(): void {
    const bossCollectionRef: CollectionReference = collection(db, config().collections.boss);

    onSnapshot(bossCollectionRef, async (snapshot: QuerySnapshot<DocumentData>): Promise<void> => {
        if (existeAtualizacaoExterna(snapshot.docChanges())) {
            await mostrarHorarios(mainTextChannel());
        }
    });
}

function listenerUpdatesConfig(): void {
    const configCollectionRef: CollectionReference = collection(db, collectionConfig);

    onSnapshot(configCollectionRef, async (snapshot: QuerySnapshot<DocumentData>): Promise<void> => {
        if (existeAtualizacaoExterna(snapshot.docChanges())) {
            await carregarConfiguracoes();
            await mostrarHorarios(mainTextChannel());
        }
    });
}

export {
    listenersFirestore
}
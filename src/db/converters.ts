/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from "firebase/firestore";
import { Moment } from "moment";
import { BackupListaBoss } from "../models/backup-lista-boss";
import { Boss } from "../models/boss";
import { ConfigBot } from "../models/config-bot";
import { momentToString, stringToMoment } from "../utils/data-utils";

const bossConverter = {
    toFirestore(boss: WithFieldValue<Boss>): DocumentData {
        const salasMoment = boss.salas as Map<number, Moment>;
        const salasString = new Map<number, string>();
        salasMoment.forEach((value, key) => {
            salasString.set(key, momentToString(value));
        });
        return { id: boss.id, nome: boss.nome, salas: Object.fromEntries(salasString) };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Boss {
        const data = snapshot.data(options);
        const salas = new Map<number, Moment>();
        Object.keys(data.salas).forEach(key => {
            salas.set(parseInt(key), stringToMoment(data.salas[key]))
        });
        return new Boss(data.id, data.nome, salas);
    }
};

const backupListaBossConverter = {
    toFirestore(boss: WithFieldValue<BackupListaBoss>): DocumentData {
        return boss;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): BackupListaBoss {
        const data = snapshot.data(options);
        const listaBoss = data.listaBoss.map((element: any) => {
            
            const salas = new Map<number, Moment>();
            Object.keys(element.salas).forEach(key => {
                salas.set(parseInt(key), stringToMoment(element.salas[key]))
            });

            return new Boss(element.id, element.nome, salas);
        });

        return new BackupListaBoss(data.timestamp, listaBoss);
    }
};

const configConverter = {
    toFirestore(configBot: WithFieldValue<ConfigBot>): DocumentData {
        const configObj = JSON.parse(JSON.stringify(configBot));

        delete configObj["collections"];
        delete configObj["documents"];

        return configObj;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ConfigBot {
        const data = snapshot.data(options);
        return new ConfigBot(
            data.bot, 
            data.cargos, 
            data.channels, 
            data.collections, 
            data.dicasFooter, 
            data.documents,
            data.geral,
            data.mu, 
            data.kafka, 
            data.ownerId
        );
    }
};

export {
    bossConverter,
    backupListaBossConverter,
    configConverter
}
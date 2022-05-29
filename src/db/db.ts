import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection, arrayUnion, orderBy, query, setDoc } from "firebase/firestore";
import { Moment } from "moment";
import { firebaseConfig, bossFirestoreConfig } from '../../config.json';
import { Boss } from "../models/boss";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { dataNowString, momentToString, stringToMoment } from "../utils/data-utils";

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

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

const adicionarHorarioBoss = async (nomeDoc: string, sala: number, horario: string): Promise<void> => {
    const bossRef = doc(db, bossFirestoreConfig.collectionBoss, nomeDoc);
    return updateDoc(bossRef, {
        [`salas.${sala}`]: horario
    });
}

const consultarHorarioBoss = async (): Promise<Boss[]> => {
    return new Promise<Boss[]>(async (resolve) => {
        const querySnapshot = await getDocs(query(collection(db, bossFirestoreConfig.collectionBoss), orderBy("id")).withConverter(bossConverter));
        const listaBoss = [] as Boss[];
        querySnapshot.forEach(boss => listaBoss.push(boss.data()));
        resolve(listaBoss);
    });
}

const adicionarLog = async (log: string): Promise<void> => {
    const logsRef = doc(db, bossFirestoreConfig.collectionLogs, bossFirestoreConfig.documentLogs);
    await updateDoc(logsRef, {
        [dataNowString("DD-MM-YY")]: arrayUnion(log)
    });
}

const adicionarTimeoutsDB = async(): Promise<void> => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const logsRef = doc(db, bossFirestoreConfig.collectionLogs, bossFirestoreConfig.documentTimeouts);
    await setDoc(logsRef, {
        _0: Array.from(timeouts.keys())
    });
}

export { adicionarHorarioBoss, consultarHorarioBoss, adicionarLog, adicionarTimeoutsDB};
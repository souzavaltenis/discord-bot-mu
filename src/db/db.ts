import { User } from "discord.js";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection, arrayUnion, orderBy, query, setDoc, QuerySnapshot } from "firebase/firestore";
import { Moment } from "moment";
import { config } from '../config/get-configs';
import { Boss } from "../models/boss";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { GeralSingleton } from "../models/singleton/geral-singleton";
import { TimeoutSingleton } from "../models/singleton/timeout-singleton";
import { Usuario } from "../models/usuario";
import { dataNowString, momentToString, stringToMoment } from "../utils/data-utils";

const appFirebase = initializeApp(config.firebaseConfig);
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

const adicionarHorarioBoss = async (bossInfo: IBossInfoAdd): Promise<void> => {
    const bossRef = doc(db, config.bossFirestoreConfig.collectionBoss, bossInfo.nomeDocBoss);
    return updateDoc(bossRef, {
        [`salas.${bossInfo.salaBoss}`]: bossInfo.horarioInformado
    });
}

const consultarHorarioBoss = async (): Promise<Boss[]> => {
    return new Promise<Boss[]>(async (resolve) => {
        const querySnapshot = await getDocs(query(collection(db, config.bossFirestoreConfig.collectionBoss), orderBy("id")).withConverter(bossConverter));
        const listaBoss = [] as Boss[];
        querySnapshot.forEach(boss => listaBoss.push(boss.data()));
        resolve(listaBoss);
    });
}

const adicionarLog = async (log: string): Promise<void> => {
    const logsRef = doc(db, config.bossFirestoreConfig.collectionLogs, config.bossFirestoreConfig.documentLogs);
    await updateDoc(logsRef, {
        [dataNowString("DD-MM-YY")]: arrayUnion(`[${dataNowString('HH:mm:ss')}] ${log}`)
    });
}

const adicionarTimeoutsDB = async (): Promise<void> => {
    const timeouts: Map<string, NodeJS.Timeout> = TimeoutSingleton.getInstance().timeouts;
    const logsRef = doc(db, config.bossFirestoreConfig.collectionLogs, config.bossFirestoreConfig.documentTimeouts);
    await setDoc(logsRef, {
        mapTimeouts: Array.from(timeouts.keys())
    });
}

const adicionarErroInput = async (erro: string): Promise<void> => {
    const logsRef = doc(db, config.bossFirestoreConfig.collectionLogs, config.bossFirestoreConfig.documentErrosInput);
    await setDoc(logsRef, {
        erros: arrayUnion(`[${dataNowString('HH:mm:ss')}] ${erro}`)
    }, { merge: true });
}

const adicionarAnotacaoHorario = async (user: User, timestampAcao: number): Promise<void> => {
    if (!user || !timestampAcao) return;

    GeralSingleton.getInstance().isReset = false;
    GeralSingleton.getInstance().isAvisoReset = false;

    const userRef = doc(db, config.bossFirestoreConfig.collectionUsuarios, user.id);
    
    await setDoc(userRef, {
        id: user.id,
        name: user.tag,
        timestampsAnotacoes: arrayUnion(timestampAcao)
    }, { merge: true });
}

const consultarUsuarios = async(): Promise<Usuario[]> => {
    const collectionUsuariosRef = collection(db, config.bossFirestoreConfig.collectionUsuarios);

    const listaUsuariosSnap: QuerySnapshot<DocumentData> = await getDocs(collectionUsuariosRef);
    
    return listaUsuariosSnap.docs
        .map(docUser => docUser.data())
        .map(user => new Usuario(user.id || 0, user.name || '', user.timestampsAnotacoes || []));
}

const realizarBackupHorarios = async(momento: Moment, autor: string, tipoReset: string): Promise<void> => {
    const momentoAcao: string = momento.format("DD-MM-YY HH:mm:ss");

    const querySnapshot = await getDocs(query(collection(db, config.bossFirestoreConfig.collectionBoss), orderBy("id")));
    const refDocBackup = doc(db, config.bossFirestoreConfig.collectionBackups, momentoAcao);

    const horariosBackup = querySnapshot.docs.map(d => d.data()).reduce((a, v) => ({...a, [v.id]: v}), {});

    await setDoc(refDocBackup, {
        _momentoAcao: momentoAcao,
        _tipoReset: tipoReset,
        autor: autor,
        horariosBackup: horariosBackup
    });
}

export { 
    adicionarHorarioBoss,
    consultarHorarioBoss,
    adicionarLog,
    adicionarTimeoutsDB,
    adicionarErroInput,
    adicionarAnotacaoHorario,
    consultarUsuarios,
    realizarBackupHorarios
};
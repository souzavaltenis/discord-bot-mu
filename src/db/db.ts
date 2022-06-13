import { User } from "discord.js";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection, arrayUnion, orderBy, query, setDoc, QuerySnapshot } from "firebase/firestore";
import { Moment } from "moment";
import { config } from '../config/get-configs';
import { Boss } from "../models/boss";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
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

const adicionarAnotacaoHorario = async (user: User, bossInfo: IBossInfoAdd): Promise<void> => {
    if (!user || !bossInfo) return;

    const nameCollectionUsuarios: string = config.bossFirestoreConfig.collectionUsuarios;
    const nameCollectionAnotacoes: string = config.bossFirestoreConfig.collectionAnotacoes;

    const userRef = doc(db, nameCollectionUsuarios, user.id);
    
    await setDoc(userRef, {
        id: user.id,
        name: user.tag,
    }, { merge: true });
    
    const userAnotacoesRef = doc(db, nameCollectionUsuarios, user.id, nameCollectionAnotacoes, bossInfo.timestampAcao.toString());

    await setDoc(userAnotacoesRef, bossInfo);
}

const consultarUsuarios = async(): Promise<Usuario[]> => {
    const nameCollectionUsuarios: string = config.bossFirestoreConfig.collectionUsuarios;
    const nameCollectionAnotacoes: string = config.bossFirestoreConfig.collectionAnotacoes;
    
    const collectionAnotacoesRef = collection(db, nameCollectionUsuarios);

    const listaUsuarios = await getDocs(collectionAnotacoesRef).then(async (usuarios: QuerySnapshot<DocumentData>) => {
        const docsUsuarios: DocumentData[] = usuarios.docs.map(u => u.data());

        for(const docUsuario of docsUsuarios) {
            const anotacoes: QuerySnapshot<DocumentData> = await getDocs(collection(db, nameCollectionUsuarios, docUsuario.id, nameCollectionAnotacoes));
            docUsuario.anotacoes = anotacoes.docs.map(a => a.data() as IBossInfoAdd);
        }

        return docsUsuarios;
    });

    return listaUsuarios.map(user => new Usuario(user.id, user.name, user.anotacoes));
}

export { 
    adicionarHorarioBoss,
    consultarHorarioBoss,
    adicionarLog,
    adicionarTimeoutsDB,
    adicionarErroInput,
    adicionarAnotacaoHorario,
    consultarUsuarios
};
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User } from "discord.js";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection, arrayUnion, orderBy, query, setDoc, QuerySnapshot, getDoc, deleteField } from "firebase/firestore";
import { Moment } from "moment";
import { firebaseConfig, collectionConfig, documentConfigProd, documentConfigTest } from '../config/config.json';
import { Boss } from "../models/boss";
import { ConfigBot } from "../models/config-bot";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { ConfigBotSingleton } from "../models/singleton/config-bot-singleton";
import { Usuario } from "../models/usuario";
import { momentToString, stringToMoment } from "../utils/data-utils";
import { botIsProd, bdIsProd, config } from "../config/get-configs";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";

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

const carregarDadosBot = async (): Promise<void> => {
    const docConfigRef = doc(db, collectionConfig, botIsProd ? documentConfigProd : documentConfigTest).withConverter(configConverter);
    const snapDocConfig = await getDoc(docConfigRef);
    ConfigBotSingleton.getInstance().configBot = snapDocConfig.data()!;

    if (!botIsProd && bdIsProd) {
        const docConfigProdRef = doc(db, collectionConfig, documentConfigProd).withConverter(configConverter);
        const snapDocConfigProd = await getDoc(docConfigProdRef);
        const dataConfigProd = snapDocConfigProd.data()!;
        ConfigBotSingleton.getInstance().configBot.collections = dataConfigProd?.collections;
        ConfigBotSingleton.getInstance().configBot.documents = dataConfigProd?.documents;
    }

    await consultarUsuarios();
}

const sincronizarConfigsBot = async (): Promise<void> => {
    const docConfigRef = doc(db, collectionConfig, botIsProd ? documentConfigProd : documentConfigTest).withConverter(configConverter);
    await setDoc(docConfigRef, config(), { merge: true });
}

const adicionarSala = async (sala: number): Promise<void> => {
    const documentsBoss: string[] = Object.values(config().documents);

    for (const docBoss of documentsBoss) {
        await adicionarHorarioBoss({
            nomeDocBoss: docBoss,
            salaBoss: sala + '',
            horarioInformado: '',
            timestampAcao: new Date().valueOf()
        } as IBossInfoAdd);
    }
}

const removerSala = async (sala: number): Promise<void> => {
    const documentsBoss: string[] = Object.values(config().documents);

    for (const docBoss of documentsBoss) {
        const bossRef = doc(db, config().collections.boss, docBoss);
        await updateDoc(bossRef, {
            [`salas.${sala}`]: deleteField()
        });
    }
}

const adicionarHorarioBoss = async (bossInfo: IBossInfoAdd): Promise<void> => {
    const bossRef = doc(db, config().collections.boss, bossInfo.nomeDocBoss);
    return updateDoc(bossRef, {
        [`salas.${bossInfo.salaBoss}`]: bossInfo.horarioInformado
    });
}

const consultarHorarioBoss = async (): Promise<Boss[]> => {
    return new Promise<Boss[]>(async (resolve) => {
        const querySnapshot = await getDocs(query(collection(db, config().collections.boss), orderBy("id")).withConverter(bossConverter));
        const listaBoss = [] as Boss[];
        querySnapshot.forEach(boss => listaBoss.push(boss.data()));
        resolve(listaBoss);
    });
}

const adicionarAnotacaoHorario = async (user: User, timestampAcao: number): Promise<void> => {
    if (!user || !timestampAcao) return;

    const userRef = doc(db, config().collections.usuarios, user.id);
    
    await setDoc(userRef, {
        id: user.id,
        name: user.tag,
        timestampsAnotacoes: arrayUnion(timestampAcao)
    }, { merge: true }).then(() => {

        if (usuariosSingleton.usuarios.length > 0) {
            const indexUsuario: number = usuariosSingleton.usuarios.findIndex(u => u.id === user.id);
    
            if (indexUsuario === -1) {
                usuariosSingleton.usuarios.push({
                    id: user.id,
                    name: user.tag,
                    timestampsAnotacoes: [timestampAcao]
                });
            } else if (indexUsuario > -1) {
                usuariosSingleton.usuarios[indexUsuario].timestampsAnotacoes.push(timestampAcao);
            }
        }

    });
}

const consultarUsuarios = async(): Promise<void> => {
    const collectionUsuariosRef = collection(db, config().collections.usuarios);

    const listaUsuariosSnap: QuerySnapshot<DocumentData> = await getDocs(collectionUsuariosRef);
    
    usuariosSingleton.usuarios = listaUsuariosSnap.docs
        .map(docUser => docUser.data())
        .map(user => new Usuario(user.id || 0, user.name || '', user.timestampsAnotacoes || []));
}

const realizarBackupHorarios = async(momento: Moment, autor: string, tipoReset: string): Promise<void> => {
    const momentoAcao: string = momento.format("DD-MM-YY HH:mm:ss");

    const querySnapshot = await getDocs(query(collection(db, config().collections.boss), orderBy("id")));
    const refDocBackup = doc(db, config().collections.backups, momentoAcao);

    const horariosBackup = querySnapshot.docs.map(d => d.data()).reduce((a, v) => ({...a, [v.id]: v}), {});

    await setDoc(refDocBackup, {
        _momentoAcao: momentoAcao,
        _tipoReset: tipoReset,
        autor: autor,
        horariosBackup: horariosBackup
    });
}

export {
    carregarDadosBot,
    sincronizarConfigsBot,
    adicionarSala,
    removerSala,
    adicionarHorarioBoss,
    consultarHorarioBoss,
    adicionarAnotacaoHorario,
    consultarUsuarios,
    realizarBackupHorarios
};
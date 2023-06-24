/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User } from "discord.js";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, DocumentData, updateDoc, getDocs, collection, arrayUnion, orderBy, query, setDoc, QuerySnapshot, getDoc, deleteField, limit, increment, DocumentReference } from "firebase/firestore";
import { Moment } from "moment";
import { firebaseConfig, collectionConfig, documentConfigProd, documentConfigTest } from '../config/config.json';
import { Boss } from "../models/boss";
import { IBossInfoAdd } from "../models/interface/boss-info-add";
import { ConfigBotSingleton } from "../models/singleton/config-bot-singleton";
import { Usuario } from "../models/usuario";
import { dataNowMoment, dataNowString, isSameMoment, stringToMoment, timestampToMoment } from "../utils/data-utils";
import { botIsProd, bdIsProd, config } from "../config/get-configs";
import { usuariosSingleton } from "../models/singleton/usuarios-singleton";
import { BackupListaBoss } from "../models/backup-lista-boss";
import { bossConverter, backupListaBossConverter, configConverter, sorteioConverter } from "./converters";
import { Sorteio } from "../models/sorteio";
import { TypeTimestamp } from "../models/enum/type-timestamp";
import { client } from "..";
import { InfoMember } from "../models/info-member";

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const carregarConfiguracoes = async (): Promise<void> => {
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
}

const carregarDadosBot = async (): Promise<void> => {
    await carregarConfiguracoes();
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
                    timestampsAnotacoes: [timestampAcao],
                    totalTimeOnline: 0
                });
            } else if (indexUsuario > -1) {
                usuariosSingleton.usuarios[indexUsuario].timestampsAnotacoes.push(timestampAcao);
            }
        }

    });
}

const adicionarTempoUsuario = async (infoMember: InfoMember): Promise<void> => {
    if (!infoMember.id || !infoMember.timeOnline) return;

    const user: User = await client.users.fetch(infoMember.id);
    const userRef: DocumentReference<DocumentData> = doc(db, config().collections.usuarios, user.id);
    
    await setDoc(userRef, {
        id: user.id,
        name: user.tag,
        totalTimeOnline: increment(infoMember.timeOnline)
    }, { merge: true }).then(() => {

        if (usuariosSingleton.usuarios.length === 0) {
            return;
        }

        const indexUsuario: number = usuariosSingleton.usuarios.findIndex(u => u.id === user.id);

        if (indexUsuario === -1) {
            usuariosSingleton.usuarios.push({
                id: user.id,
                name: user.tag,
                timestampsAnotacoes: [],
                totalTimeOnline: infoMember.timeOnline
            });
        } else if (indexUsuario > -1) {
            usuariosSingleton.usuarios[indexUsuario].totalTimeOnline += infoMember.timeOnline;
        }

    });
}

const consultarUsuarios = async(): Promise<void> => {
    const collectionUsuariosRef = collection(db, config().collections.usuarios);

    const listaUsuariosSnap: QuerySnapshot<DocumentData> = await getDocs(collectionUsuariosRef);
    const dataNow: Moment = dataNowMoment();

    const timestampNewRankMoment: number = stringToMoment(config().geral.dateNewRank).valueOf();
    
    usuariosSingleton.usuarios = listaUsuariosSnap.docs
        .map(docUser => docUser.data())
        .map(user => {
            const timestamps: number[] = (user.timestampsAnotacoes as number[] || [] as number[])
                .map((timestamp: number) => {
                    switch (true) {
                        case timestamp <= timestampNewRankMoment:
                            return TypeTimestamp.OLD_TIMESTAMP_RANK;
                        case !isSameMoment(dataNow, timestamp, 'week') && !isSameMoment(dataNow, timestamp, 'day'):
                            return TypeTimestamp.NEW_TIMESTAMP_DATED;
                        default:
                            return timestamp;
                    }
                });

            return new Usuario(user.id || 0, user.name || '', timestamps, user.totalTimeOnline || 0);
        });
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

const adicionarBackupListaBoss = async (): Promise<void> => {
    const querySnapshot = await getDocs(query(collection(db, config().collections.boss), orderBy("id")));
    const listaBoss: any[] = [];
    querySnapshot.forEach(boss => listaBoss.push(boss.data()));

    const nomeDocHoraBackup: string = dataNowString("HH");
    const refDocBackup = doc(db, config().collections.backupsListaBoss, nomeDocHoraBackup);
    
    await setDoc(
        refDocBackup,
        {
            timestamp: dataNowMoment().valueOf(),
            listaBoss: listaBoss
        },
        { merge: true }
    );
}

const consultarBackupsListaBoss = async (): Promise<BackupListaBoss[]> => {
    const querySnapshot = await getDocs(query(collection(db, config().collections.backupsListaBoss), orderBy("timestamp", "desc"), limit(24)).withConverter(backupListaBossConverter));

    const listaBoss: BackupListaBoss[] = [];
    querySnapshot.forEach(snapshot => listaBoss.push(snapshot.data()));

    return listaBoss;
}

const salvarSorteio = async (sorteio: Sorteio): Promise<void> => {
    const nameDoc: string = timestampToMoment(sorteio.timestamp).format("DD-MM-YY HH:mm:ss") + ` (${sorteio.criador}) `;
    const refDocSorteio = doc(db, config().collections.sorteios, nameDoc).withConverter(sorteioConverter);
    await setDoc(refDocSorteio, Object.assign(sorteio));
}

export {
    carregarConfiguracoes,
    carregarDadosBot,
    sincronizarConfigsBot,
    adicionarSala,
    removerSala,
    adicionarHorarioBoss,
    consultarHorarioBoss,
    adicionarAnotacaoHorario,
    consultarUsuarios,
    realizarBackupHorarios,
    adicionarBackupListaBoss,
    consultarBackupsListaBoss,
    salvarSorteio,
    adicionarTempoUsuario
};
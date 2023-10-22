/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GuildMember, codeBlock } from "discord.js";
import { initializeApp } from "firebase/app";
import {
    doc,
    getFirestore,
    DocumentData,
    updateDoc,
    setDoc,
    getDocs,
    collection,
    arrayUnion,
    orderBy,
    query,
    QuerySnapshot,
    getDoc,
    deleteField,
    limit,
    increment,
    DocumentReference,
    DocumentSnapshot
} from "firebase/firestore";
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
import { InfoMember } from "../models/info-member";
import { getNickGuildMember, sinalizarAlteracaoPeloBot } from "../utils/geral-utils";
import { geralSingleton } from "../models/singleton/geral-singleton";
import { logInOutTextChannel } from "../utils/channels-utils";

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
    sinalizarAlteracaoPeloBot();
    
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
        sinalizarAlteracaoPeloBot();
        const bossRef = doc(db, config().collections.boss, docBoss);
        await updateDoc(bossRef, {
            [`salas.${sala}`]: deleteField()
        });
    }
}

const adicionarHorarioBoss = async (bossInfo: IBossInfoAdd): Promise<void> => {
    sinalizarAlteracaoPeloBot();

    const bossRef = doc(db, config().collections.boss, bossInfo.nomeDocBoss);
    return updateDoc(bossRef, {
        [`salas.${bossInfo.salaBoss}`]: bossInfo.horarioInformado
    });
}

const consultarHorarioBoss = async (): Promise<Boss[]> => {
    const querySnapshot = await getDocs(query(collection(db, config().collections.boss), orderBy("id")).withConverter(bossConverter));
    
    const listaBoss = [] as Boss[];

    querySnapshot.forEach(snapshot => {
        const boss: Boss = snapshot.data();

        if (boss.ativo) {
            listaBoss.push(boss);
        }
    });

    return listaBoss;
}

const adicionarAnotacaoHorario = async (member: GuildMember, timestampAcao: number): Promise<void> => {
    if (!member || !timestampAcao) return;

    const userRef = doc(db, config().collections.usuarios, member.id);
    
    await setDoc(userRef, {
        id: member.id,
        name: getNickGuildMember(member),
        timestampsAnotacoes: arrayUnion(timestampAcao)
    }, { merge: true }).then(() => {

        if (usuariosSingleton.usuarios.length > 0) {
            const indexUsuario: number = usuariosSingleton.usuarios.findIndex(u => u.id === member.id);
    
            if (indexUsuario === -1) {
                usuariosSingleton.usuarios.push({
                    id: member.id,
                    name: getNickGuildMember(member),
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

    const userRef: DocumentReference<DocumentData> = doc(db, config().collections.usuarios, infoMember.id);
    
    await setDoc(userRef, {
        id: infoMember.id,
        name: infoMember.nick,
        totalTimeOnline: increment(infoMember.timeOnline)
    }, { merge: true }).then(() => {

        if (usuariosSingleton.usuarios.length === 0) {
            return;
        }

        const indexUsuario: number = usuariosSingleton.usuarios.findIndex(u => u.id === infoMember.id);

        if (indexUsuario === -1) {
            usuariosSingleton.usuarios.push({
                id: infoMember.id,
                name: infoMember.nick,
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

const salvarTempoOnlineMembros = async (): Promise<void> => {
    const listaRequisicoes: Promise<void>[] = [];

    geralSingleton.infoMember.forEach((infoMember: InfoMember) => {
        if (infoMember.lastConnect !== 0) {
            const timestampNow: number = new Date().valueOf();

            infoMember.timeOnline = timestampNow - infoMember.lastConnect;
            infoMember.lastConnect = timestampNow;

            listaRequisicoes.push(adicionarTempoUsuario(infoMember));
        }
    });

    await Promise.all(listaRequisicoes).then(() => {
        logInOutTextChannel()?.send({
            content: '\u200B\n\u200B\n' + codeBlock(`[${dataNowString()}]: O tempo online de ${listaRequisicoes.length} membros foram atualizados`) + '\u200B\n\u200B\n'
        });
    });
}

const isBossAtivo = async (nomeDocBoss: string): Promise<boolean> => {
    const documentReference: DocumentReference = doc(db, config().collections.boss, nomeDocBoss);
    const documentSnapshot: DocumentSnapshot = await getDoc(documentReference);

    const boss: Boss = documentSnapshot.data() as Boss;

    return boss.ativo;
}

export {
    db,
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
    adicionarTempoUsuario,
    salvarTempoOnlineMembros,
    isBossAtivo
};
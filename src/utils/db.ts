import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection, arrayUnion } from "firebase/firestore";
import { firebaseConfig} from '../../config.json';
import { Boss } from "../models/boss";

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const bossConverter = {
    toFirestore(boss: WithFieldValue<Boss>): DocumentData {
      return {id: boss.id, nome: boss.nome, sala2: boss.sala2, sala3: boss.sala3, sala4: boss.sala4, sala5: boss.sala5, sala6: boss.sala6};
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Boss {
      const data = snapshot.data(options);
      return new Boss(data.id, data.nome, data.sala2, data.sala3, data.sala4, data.sala5, data.sala6);
    }
};

const adicionarHorarioBoss = async function (nome: string, sala: string, horario: string, data: string): Promise<void> {
    const bossRef = doc(db, "boss", nome);
    return updateDoc(bossRef, {
        [`sala${sala}`]: horario + ';' + data
    });
}

const consultarHorarioBoss = async function(): Promise<Boss[]> {
    return new Promise<Boss[]>(async (resolve) => {
        const querySnapshot = await getDocs(collection(db, "boss").withConverter(bossConverter));
        const listaBoss = [] as Boss[];
        querySnapshot.forEach(boss => listaBoss.push(boss.data()));

        listaBoss.sort(function(x: Boss, y: Boss) {

            if (x.id < y.id) {
              return -1;
            }

            if (x.id > y.id) {
              return 1;
            }

            return 0;
        });

        resolve(listaBoss);
    });
}

const adicionarLog = async (log: string, tipo: string): Promise<void> => {
    const logsRef = doc(db, "logs", "log-discord");

    await updateDoc(logsRef, {
        [tipo]: arrayUnion(log)
    });
}

export { adicionarHorarioBoss, consultarHorarioBoss, adicionarLog };
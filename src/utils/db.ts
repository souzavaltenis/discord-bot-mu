import { initializeApp } from "firebase/app";
import { doc, getFirestore, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, updateDoc, getDocs, collection } from "firebase/firestore";
import { firebaseConfig} from '../../config.json';
import { BossDAO } from "../entities/boss-dao";
import { Boss } from "../entities/boss";

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

const adicionarHorarioBoss = async function (bossDAO: BossDAO): Promise<void> {
    const bossRef = doc(db, "boss", bossDAO.nome);
    return updateDoc(bossRef, {
        [`sala${bossDAO.sala}`]: bossDAO.horario
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

export { adicionarHorarioBoss, consultarHorarioBoss };
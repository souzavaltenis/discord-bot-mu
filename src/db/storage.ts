import { initializeApp } from "firebase/app";
import dadosConfigJson from '../config/config.json';
import { UploadResult, getStorage, ref, uploadString, getDownloadURL, StorageReference } from "firebase/storage";
import { IDadosConfigsJson } from "../models/interface/config-bot/dados-config-json";
import { name as nomeProjeto } from '../../package.json';

const { firebaseConfig, bucketUrl } = (dadosConfigJson as IDadosConfigsJson)[nomeProjeto];

const appFirebase = initializeApp(firebaseConfig);
const storage = getStorage(appFirebase, bucketUrl);

async function uploadFileString(pathFile: string, contentFile: string): Promise<UploadResult> {
    const newTextFileRef: StorageReference = ref(storage, pathFile);
    return uploadString(newTextFileRef, contentFile);
}

async function getLinkDownloadFile(pathFile: string): Promise<string> {
    const refFile: StorageReference = ref(storage, pathFile);
    return getDownloadURL(refFile);
}

export {
    uploadFileString,
    getLinkDownloadFile
}
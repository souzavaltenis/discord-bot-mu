import { initializeApp } from "firebase/app";
import { firebaseConfig, bucketUrl } from '../config/config.json';
import { UploadResult, getStorage, ref, uploadString, getDownloadURL, StorageReference } from "firebase/storage";

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
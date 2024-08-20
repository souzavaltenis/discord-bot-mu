export interface IDadosConfigsJson {
    [key: string]: IDadosConfigJson
}

export interface IDadosConfigJson {
    collectionConfig: string,
    documentConfigProd: string,
    documentConfigTest: string,
    firebaseConfig: {
        apiKey: string,
        authDomain: string,
        projectId: string,
        storageBucket: string,
        messagingSenderId: string,
        appId: string,
        measurementId: string
    },
    bucketUrl: string
}
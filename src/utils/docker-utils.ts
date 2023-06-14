import { name as nomeProjeto, version as versaoProjeto } from '../../package.json';
import path from 'path';
import { exec } from 'child_process';

async function getResultBatCommandOrFile(command: string): Promise<string> {
    return new Promise(function (resolve, reject) {
        exec(command, function (err, stdout, stderr) {
            if (err) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function buildDockerImage(): Promise<string> {
    const nameImage: string = `${nomeProjeto}:${versaoProjeto}`;
    const pathDockerfile: string = path.join(process.cwd(), 'Dockerfile');

    const commandBuildImage: string = `docker build -t ${nameImage} -f ${pathDockerfile} .`;

    console.log(`- gerando imagem docker: ${nameImage}`);

    return getResultBatCommandOrFile(commandBuildImage);
}

buildDockerImage()
    .then(() => console.log('- imagem docker criada com sucesso!'))
    .catch(() => console.log('- erro ao criar Imagem docker.'));
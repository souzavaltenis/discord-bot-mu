import { name as nameApplication } from "../../package.json";

export class ErrorGeral {
    nameApplication: string = nameApplication;
    nameError: string;
    messageError: string;
    stackError: string;

    constructor(nameError: string, messageError: string, stackError: string) {
        this.nameError = nameError;
        this.messageError = messageError;
        this.stackError = stackError;
    }
}
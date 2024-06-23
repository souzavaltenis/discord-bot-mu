import { ErrorGeral } from "../models/error-geral";
import { sendLogErroApp } from "./logs-utils";

const listenerErrors = (): void => {
    process.on('unhandledRejection', sendAlertError);
    process.on('uncaughtException', sendAlertError);
}

const sendAlertError = (err: Error): void => {
    const errorGeral: ErrorGeral = new ErrorGeral(err.name, err.message, err.stack || '');

    if (err.stack?.includes('amqplib')) {
        return;
    }

    sendLogErroApp(errorGeral);
}

export { listenerErrors }
import { config } from "../config/get-configs";
import { ErrorGeral } from "../models/error-geral";
import { clientRabbitMQ } from "../services/rabbitmq/client-rabbitmq";

const listenerErrors = (): void => {
    process.on('unhandledRejection', async (err: Error) => await sendAlertError(err));
    process.on('uncaughtException', async (err: Error) => await sendAlertError(err));
}

const sendAlertError = async (err: Error): Promise<void> => {
    const errorGeral: ErrorGeral = new ErrorGeral(err.name, err.message, err.stack || '');

    if (err.stack?.includes('amqplib')) {
        return;
    }

    await clientRabbitMQ.produceMessage(config().rabbitmq.routingKeys.errosApp, JSON.stringify(errorGeral));
}

export { listenerErrors }
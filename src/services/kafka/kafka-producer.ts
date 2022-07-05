import { Kafka, logLevel, Partitioners, Producer, RecordMetadata } from 'kafkajs';
import { botIsProd, config } from '../../config/get-configs';

let producer: Producer;
let kafkaClient: Kafka;

const sendMessageKafka = async (topic: string, message: string): Promise<RecordMetadata[]> => {
    if (!botIsProd) return [];

    checkInitClient();
    checkInitProducer();
    
    await producer.connect();
    return await producer.send({
        topic: topic,
        messages: [
            { value: Buffer.from(message) },
        ],
    });
}

const checkInitProducer = (): void => {
    if (producer) return;

    producer = kafkaClient.producer({ createPartitioner: Partitioners.LegacyPartitioner });
}

const checkInitClient = (): void => {
    if (kafkaClient) return;

    kafkaClient = new Kafka({
        clientId: 'bot-logs-producer',
        brokers: config().kafka.brokers,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        logLevel: logLevel.NOTHING,
        ssl: true,
        sasl: {
            mechanism: 'scram-sha-256',
            username: config().kafka.saslUsername,
            password: config().kafka.saslPassword 
        }
    });
}

export { sendMessageKafka }
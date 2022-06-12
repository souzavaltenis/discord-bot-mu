import { Kafka, logLevel } from 'kafkajs';
import { config } from '../../config/get-configs';

const kafkaClient = new Kafka({
    clientId: 'bot-logs-producer',
    brokers: config.kafkaConfig.brokers,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    logLevel: logLevel.NOTHING,
    ssl: true,
    sasl: {
        mechanism: 'scram-sha-256',
        username: config.kafkaConfig.saslUsername,
        password: config.kafkaConfig.saslPassword
    }
});

export { kafkaClient }
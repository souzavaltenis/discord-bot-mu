export interface IKafkaConfigBot {
    brokers: string[];
    saslUsername: string;
    saslPassword: string;
    topicLogsErrosInputBot: string;
    topicLogsGeralBot: string;
}
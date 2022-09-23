export class TimeoutSingleton {
    private static instance: TimeoutSingleton;

    timeouts: Map<string, NodeJS.Timeout>;

    constructor(timeouts: Map<string, NodeJS.Timeout>) {
        this.timeouts = timeouts;
    }

    static getInstance(): TimeoutSingleton {
        if (!this.instance) {
            this.instance = new this(new Map<string, NodeJS.Timeout>());
        }
        return this.instance;
    }
}
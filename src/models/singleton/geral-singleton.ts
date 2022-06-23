export class GeralSingleton {
    private static instance: GeralSingleton;

    isReset: boolean = false;
    isAvisoReset: boolean = false;

    static getInstance(): GeralSingleton {
        if (!this.instance) {
          this.instance = new this();
        }
        return this.instance;
    }
}
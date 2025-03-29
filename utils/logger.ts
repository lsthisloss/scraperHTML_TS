export class Logger {
    private static isEnabled: boolean = true;

    static enable(): void {
        this.isEnabled = true;
    }

    static disable(): void {
        this.isEnabled = false;
    }
    static isDebugEnabled(): boolean {
        return this.isEnabled;
    }
    static log(...args: any[]): void {
        if (this.isEnabled) {
            console.log(...args);
        }
    }
    static error(...args: any[]): void {
        if (this.isEnabled) {
            console.error(...args);
        }
    }
}
export class Logger {
    private static debug: boolean = true;

    static enable(): void {
        this.debug = true;
    }

    static disable(): void {
        this.debug = false;
    }
    static isDebugEnabled(): boolean {
        return this.debug;
    }
    static log(...args: any[]): void {
        if (this.debug) {
            console.log(...args);
        }
    }
    static error(message: string, ...error: any[]): void { 
        if (this.debug) { 
            const firstError = error[0] instanceof Error 
                ? error[0] 
                : new Error(error[0] ? String(error[0]) : message);
            console.error(message, firstError);
            throw firstError;
        }
    }
}
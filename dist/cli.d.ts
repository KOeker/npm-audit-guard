import { CliOptions } from './types';
export declare class AuditGuardCLI {
    private program;
    private auditExecutor;
    private formatter;
    private configLoader;
    private junitReporter;
    constructor();
    setupCommands(): void;
    run(options: CliOptions): Promise<void>;
    parse(argv: string[]): void;
}
//# sourceMappingURL=cli.d.ts.map
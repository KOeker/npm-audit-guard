import { AuditResult } from './types';
export interface AuditOptions {
    includeDev: boolean;
}
export declare class AuditExecutor {
    runAudit(options: AuditOptions): Promise<AuditResult>;
    isValidNpmProject(): Promise<boolean>;
}
//# sourceMappingURL=audit.d.ts.map
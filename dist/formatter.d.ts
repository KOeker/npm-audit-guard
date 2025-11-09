import { AuditResult, FormattedResults } from './types';
export declare class ResultFormatter {
    formatResults(auditResult: AuditResult, blacklist: string[]): FormattedResults;
    printResults(results: FormattedResults): void;
    private printSeverityGroup;
}
//# sourceMappingURL=formatter.d.ts.map
import { AuditGuardConfig } from './types';
export declare class ConfigLoader {
    private configFileName;
    loadConfig(cwd?: string): AuditGuardConfig | null;
    mergeConfig(cliBlacklist?: string, cliIncludeDev?: boolean, configFile?: AuditGuardConfig | null): {
        blacklist: string[];
        includeDev: boolean;
    };
}
//# sourceMappingURL=config.d.ts.map
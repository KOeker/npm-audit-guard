import * as fs from 'fs';
import * as path from 'path';
import {AuditGuardConfig} from './types';

export class ConfigLoader {
  private configFileName = '.auditguardrc.json';

  loadConfig(cwd: string = process.cwd()): AuditGuardConfig | null {
    const configPath = path.join(cwd, this.configFileName);

    if (!fs.existsSync(configPath)) {
      return null;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent) as AuditGuardConfig;
    } catch (error: any) {
      throw new Error(
        `Error loading config file: ${error.message}`
      );
    }
  }

  mergeConfig(
    cliBlacklist?: string,
    cliIncludeDev?: boolean,
    configFile?: AuditGuardConfig | null
  ): { blacklist: string[]; includeDev: boolean } {
    let blacklist: string[] = [];
    let includeDev = false;

    if (configFile) {
      if (configFile.blacklist) {
        blacklist = [...configFile.blacklist];
      }
      if (configFile.includeDev !== undefined) {
        includeDev = configFile.includeDev;
      }
    }

    if (cliBlacklist) {
      blacklist = cliBlacklist.split(',').map((pkg) => pkg.trim());
    }

    if (cliIncludeDev !== undefined) {
      includeDev = cliIncludeDev;
    }

    return { blacklist, includeDev };
  }
}
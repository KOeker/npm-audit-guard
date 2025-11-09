import { exec } from 'child_process';
import { promisify } from 'util';
import { AuditResult } from './types';

const execAsync = promisify(exec);

export interface AuditOptions {
  includeDev: boolean;
}

export class AuditExecutor {
  async runAudit(options: AuditOptions): Promise<AuditResult> {
    try {
      const auditCommand = options.includeDev 
        ? 'npm audit --json' 
        : 'npm audit --json --omit=dev';

      const { stdout} = await execAsync(auditCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });


      if (stdout) {
        return JSON.parse(stdout) as AuditResult;
      }

      throw new Error('No output from npm audit command');
    } catch (error: any) {
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout) as AuditResult;
        } catch (parseError) {
          throw new Error(`Failed to parse npm audit output: ${parseError}`);
        }
      }

      if (error.message.includes('ENOENT')) {
        throw new Error('npm is not installed or not found in PATH');
      }

      if (error.message.includes('package.json')) {
        throw new Error('No package.json found in current directory');
      }

      if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        throw new Error('Network error: Could not reach npm registry');
      }

      throw new Error(`npm audit failed: ${error.message}`);
    }
  }

  async isValidNpmProject(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('npm prefix');
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }
}
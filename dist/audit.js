"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditExecutor = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class AuditExecutor {
    async runAudit(options) {
        try {
            const auditCommand = options.includeDev
                ? 'npm audit --json'
                : 'npm audit --json --omit=dev';
            const { stdout } = await execAsync(auditCommand, {
                maxBuffer: 10 * 1024 * 1024, // 10MB
            });
            if (stdout) {
                return JSON.parse(stdout);
            }
            throw new Error('No output from npm audit command');
        }
        catch (error) {
            if (error.stdout) {
                try {
                    return JSON.parse(error.stdout);
                }
                catch (parseError) {
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
    async isValidNpmProject() {
        try {
            const { stdout } = await execAsync('npm prefix');
            return stdout.trim().length > 0;
        }
        catch {
            return false;
        }
    }
}
exports.AuditExecutor = AuditExecutor;
//# sourceMappingURL=audit.js.map
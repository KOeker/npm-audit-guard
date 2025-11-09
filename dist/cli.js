"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditGuardCLI = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const audit_1 = require("./audit");
const formatter_1 = require("./formatter");
const config_1 = require("./config");
const junit_1 = require("./junit");
class AuditGuardCLI {
    constructor() {
        this.program = new commander_1.Command();
        this.auditExecutor = new audit_1.AuditExecutor();
        this.formatter = new formatter_1.ResultFormatter();
        this.configLoader = new config_1.ConfigLoader();
        this.junitReporter = new junit_1.JUnitReporter();
    }
    setupCommands() {
        this.program
            .name('audit-guard')
            .description('CLI tool for npm security audit with blacklist functionality')
            .version('1.0.0')
            .option('--dev', 'Include dev dependencies in scan')
            .option('--blacklist <packages>', 'Comma-separated list of packages to ignore')
            .option('--junit', 'Generate JUnit XML report for CI/CD integration')
            .option('--output <path>', 'Path for JUnit XML output (default: ./audit-results.xml)')
            .action(async (options) => {
            await this.run(options);
        });
    }
    async run(options) {
        try {
            const isValid = await this.auditExecutor.isValidNpmProject();
            if (!isValid) {
                console.error(chalk_1.default.red('Error: No package.json found in current directory'));
                process.exit(2);
            }
            const configFile = this.configLoader.loadConfig();
            const { blacklist, includeDev } = this.configLoader.mergeConfig(options.blacklist, options.dev, configFile);
            const progressBar = new cli_progress_1.default.SingleBar({
                format: 'Running security audit... [{bar}] {percentage}%',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true,
            });
            progressBar.start(100, 0);
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                if (currentProgress < 90) {
                    currentProgress += 10;
                    progressBar.update(currentProgress);
                }
            }, 200);
            const auditResult = await this.auditExecutor.runAudit({ includeDev });
            clearInterval(progressInterval);
            progressBar.update(100);
            progressBar.stop();
            const results = this.formatter.formatResults(auditResult, blacklist);
            this.formatter.printResults(results);
            if (options.junit) {
                const outputPath = this.junitReporter.saveReport(results, options.output);
                console.log(chalk_1.default.green(`\nJUnit XML report saved: ${outputPath}`));
            }
            if (results.totalCount > 0) {
                process.exit(1); // Vulnerabilities found
            }
            else {
                process.exit(0); // No vulnerabilities
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}`));
            process.exit(2);
        }
    }
    parse(argv) {
        this.program.parse(argv);
    }
}
exports.AuditGuardCLI = AuditGuardCLI;
//# sourceMappingURL=cli.js.map
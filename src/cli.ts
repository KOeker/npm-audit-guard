import { Command } from 'commander';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { AuditExecutor } from './audit';
import { ResultFormatter } from './formatter';
import { ConfigLoader } from './config';
import { JUnitReporter } from './junit';
import { CliOptions } from './types';

export class AuditGuardCLI {
  private program: Command;
  private auditExecutor: AuditExecutor;
  private formatter: ResultFormatter;
  private configLoader: ConfigLoader;
  private junitReporter: JUnitReporter;

  constructor() {
    this.program = new Command();
    this.auditExecutor = new AuditExecutor();
    this.formatter = new ResultFormatter();
    this.configLoader = new ConfigLoader();
    this.junitReporter = new JUnitReporter();
  }

  setupCommands(): void {
    this.program
      .name('audit-guard')
      .description('CLI tool for npm security audit with blacklist functionality')
      .version('1.0.0')
      .option('--dev', 'Include dev dependencies in scan')
      .option(
        '--blacklist <packages>',
        'Comma-separated list of packages to ignore'
      )
      .option(
        '--junit',
        'Generate JUnit XML report for CI/CD integration'
      )
      .option(
        '--output <path>',
        'Path for JUnit XML output (default: ./audit-results.xml)'
      )
      .action(async (options: CliOptions) => {
        await this.run(options);
      });
  }

  async run(options: CliOptions): Promise<void> {
    try {
      const isValid = await this.auditExecutor.isValidNpmProject();
      if (!isValid) {
        console.error(
          chalk.red('Error: No package.json found in current directory')
        );
        process.exit(2);
      }

      const configFile = this.configLoader.loadConfig();
      const { blacklist, includeDev } = this.configLoader.mergeConfig(
        options.blacklist,
        options.dev,
        configFile
      );

      const progressBar = new cliProgress.SingleBar({
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
        const outputPath = this.junitReporter.saveReport(
          results,
          options.output
        );
        console.log(
          chalk.green(`\nJUnit XML report saved: ${outputPath}`)
        );
      }

      if (results.totalCount > 0) {
        process.exit(1); // Vulnerabilities found
      } else {
        process.exit(0); // No vulnerabilities
      }
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(2);
    }
  }

  parse(argv: string[]): void {
    this.program.parse(argv);
  }
}
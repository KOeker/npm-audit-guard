import { Command } from 'commander';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { readFileSync } from 'fs';
import { join } from 'path';
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

  private getVersion(): string {
    try {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.version;
    } catch (error) {
      return 'unknown';
    }
  }

  setupCommands(): void {
    this.program
      .name('audit-guard')
      .description('CLI tool for npm security audit with blacklist functionality')
      .version(this.getVersion());

    this.program
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

    this.program
      .command('init')
      .description('Create a .auditguardrc.json config file in the current directory')
      .action(() => {
        this.initConfig();
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

  initConfig(): void {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), '.auditguardrc.json');

    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('  .auditguardrc.json already exists in this directory'));
      console.log(chalk.gray(`   Location: ${configPath}`));
      process.exit(0);
    }

    const defaultConfig = {
      blacklist: [
      ],
      includeDev: false
    };

    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      console.log(chalk.green('✓ Created .auditguardrc.json'));
      console.log(chalk.gray(`  Location: ${configPath}`));
      console.log(chalk.cyan('\n  Edit this file to configure your audit settings:'));
      console.log(chalk.cyan('   - Add packages to the blacklist array'));
      console.log(chalk.cyan('   - Set includeDev to true to scan dev dependencies'));
    } catch (error: any) {
      console.error(chalk.red(`Error creating config file: ${error.message}`));
      process.exit(2);
    }
  }
}
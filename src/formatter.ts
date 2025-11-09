import chalk from 'chalk';
import {
  AuditResult,
  GroupedVulnerabilities,
  FormattedResults,
  BlacklistedPackage,
} from './types';

export class ResultFormatter {
  formatResults(
    auditResult: AuditResult,
    blacklist: string[]
  ): FormattedResults {
    const grouped: GroupedVulnerabilities = {
      critical: [],
      high: [],
      moderate: [],
      low: [],
    };
    const ignored: BlacklistedPackage[] = [];
    const blacklistWarnings: string[] = [];
    const blacklistSet = new Set(blacklist.map((pkg) => pkg.toLowerCase()));

    for (const [packageName, vulnerability] of Object.entries(
      auditResult.vulnerabilities
    )) {
      const isBlacklisted = blacklistSet.has(packageName.toLowerCase());

      if (isBlacklisted) {
        ignored.push({
          name: packageName,
          severity: vulnerability.severity,
        });
      } else {
        const vulnEntry = {
          name: packageName,
          range: vulnerability.range,
        };

        switch (vulnerability.severity) {
          case 'critical':
            grouped.critical.push(vulnEntry);
            break;
          case 'high':
            grouped.high.push(vulnEntry);
            break;
          case 'moderate':
            grouped.moderate.push(vulnEntry);
            break;
          case 'low':
            grouped.low.push(vulnEntry);
            break;
        }
      }
    }

    for (const blacklistedPkg of blacklist) {
      const found = Object.keys(auditResult.vulnerabilities).some(
        (pkg) => pkg.toLowerCase() === blacklistedPkg.toLowerCase()
      );
      if (!found) {
        blacklistWarnings.push(
          `Warning: Blacklisted package "${blacklistedPkg}" not found in audit results`
        );
      }
    }

    const totalCount =
      grouped.critical.length +
      grouped.high.length +
      grouped.moderate.length +
      grouped.low.length;

    return {
      grouped,
      ignored,
      blacklistWarnings,
      totalCount,
    };
  }

  printResults(results: FormattedResults): void {
    console.log('\n' + chalk.bold('=== Security Audit Results ===\n'));

    this.printSeverityGroup('Critical', results.grouped.critical, chalk.red);
    this.printSeverityGroup('High', results.grouped.high, chalk.yellow);
    this.printSeverityGroup('Moderate', results.grouped.moderate, chalk.blue);
    this.printSeverityGroup('Low', results.grouped.low, chalk.gray);

    if (results.ignored.length > 0) {
      console.log(chalk.cyan.bold('\nIgnored (Blacklisted):'));
      for (const pkg of results.ignored) {
        console.log(
          chalk.cyan(`  - ${pkg.name} (${pkg.severity})`)
        );
      }
    }

    if (results.blacklistWarnings.length > 0) {
      console.log('');
      for (const warning of results.blacklistWarnings) {
        console.log(chalk.yellow(warning));
      }
    }

    console.log(chalk.bold('\n=== Summary ==='));
    console.log(
      `Total vulnerabilities found: ${results.totalCount > 0 ? chalk.red(results.totalCount) : chalk.green(results.totalCount)}`
    );
    console.log(`Ignored (blacklisted): ${results.ignored.length}`);

    if (results.totalCount === 0) {
      console.log(chalk.green('\n✓ No vulnerabilities found!'));
    } else {
      console.log(
        chalk.red(
          `\n✗ ${results.totalCount} vulnerabilit${results.totalCount === 1 ? 'y' : 'ies'} require${results.totalCount === 1 ? 's' : ''} attention!`
        )
      );
    }
  }

  private printSeverityGroup(
    severityLabel: string,
    vulnerabilities: Array<{ name: string; range: string }>,
    colorFn: chalk.Chalk
  ): void {
    if (vulnerabilities.length > 0) {
      console.log(colorFn.bold(`\n${severityLabel}:`));
      for (const vuln of vulnerabilities) {
        console.log(colorFn(`  - ${vuln.name} (${vuln.range})`));
      }
    }
  }
}
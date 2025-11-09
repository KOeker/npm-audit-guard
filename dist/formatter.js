"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ResultFormatter {
    formatResults(auditResult, blacklist) {
        const grouped = {
            critical: [],
            high: [],
            moderate: [],
            low: [],
        };
        const ignored = [];
        const blacklistWarnings = [];
        const blacklistSet = new Set(blacklist.map((pkg) => pkg.toLowerCase()));
        for (const [packageName, vulnerability] of Object.entries(auditResult.vulnerabilities)) {
            const isBlacklisted = blacklistSet.has(packageName.toLowerCase());
            if (isBlacklisted) {
                ignored.push({
                    name: packageName,
                    severity: vulnerability.severity,
                });
            }
            else {
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
            const found = Object.keys(auditResult.vulnerabilities).some((pkg) => pkg.toLowerCase() === blacklistedPkg.toLowerCase());
            if (!found) {
                blacklistWarnings.push(`Warning: Blacklisted package "${blacklistedPkg}" not found in audit results`);
            }
        }
        const totalCount = grouped.critical.length +
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
    printResults(results) {
        console.log('\n' + chalk_1.default.bold('=== Security Audit Results ===\n'));
        this.printSeverityGroup('Critical', results.grouped.critical, chalk_1.default.red);
        this.printSeverityGroup('High', results.grouped.high, chalk_1.default.yellow);
        this.printSeverityGroup('Moderate', results.grouped.moderate, chalk_1.default.blue);
        this.printSeverityGroup('Low', results.grouped.low, chalk_1.default.gray);
        if (results.ignored.length > 0) {
            console.log(chalk_1.default.cyan.bold('\nIgnored (Blacklisted):'));
            for (const pkg of results.ignored) {
                console.log(chalk_1.default.cyan(`  - ${pkg.name} (${pkg.severity})`));
            }
        }
        if (results.blacklistWarnings.length > 0) {
            console.log('');
            for (const warning of results.blacklistWarnings) {
                console.log(chalk_1.default.yellow(warning));
            }
        }
        console.log(chalk_1.default.bold('\n=== Summary ==='));
        console.log(`Total vulnerabilities found: ${results.totalCount > 0 ? chalk_1.default.red(results.totalCount) : chalk_1.default.green(results.totalCount)}`);
        console.log(`Ignored (blacklisted): ${results.ignored.length}`);
        if (results.totalCount === 0) {
            console.log(chalk_1.default.green('\n✓ No vulnerabilities found!'));
        }
        else {
            console.log(chalk_1.default.red(`\n✗ ${results.totalCount} vulnerabilit${results.totalCount === 1 ? 'y' : 'ies'} require${results.totalCount === 1 ? 's' : ''} attention!`));
        }
    }
    printSeverityGroup(severityLabel, vulnerabilities, colorFn) {
        if (vulnerabilities.length > 0) {
            console.log(colorFn.bold(`\n${severityLabel}:`));
            for (const vuln of vulnerabilities) {
                console.log(colorFn(`  - ${vuln.name} (${vuln.range})`));
            }
        }
    }
}
exports.ResultFormatter = ResultFormatter;
//# sourceMappingURL=formatter.js.map
import * as fs from 'fs';
import * as path from 'path';
import { FormattedResults } from './types';

export class JUnitReporter {
  saveReport(results: FormattedResults, outputPath?: string): string {
    const xml = this.generateJUnitXML(results);
    
    const finalPath = outputPath || './audit-results.xml';
    
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(finalPath, xml, 'utf-8');
    
    return finalPath;
  }

  private generateJUnitXML(results: FormattedResults): string {
    const totalTests = results.totalCount + results.ignored.length + results.blacklistWarnings.length;
    const failures = results.totalCount + results.blacklistWarnings.length;
    const timestamp = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites name="npm-audit-guard" tests="${totalTests}" failures="${failures}" time="0">\n`;
    xml += `  <testsuite name="Security Audit" tests="${totalTests}" failures="${failures}" timestamp="${timestamp}">\n`;

    const addTestCases = (
      vulns: Array<{ name: string; range: string }>,
      severity: string
    ) => {
      vulns.forEach((vuln) => {
        xml += `    <testcase name="${this.escapeXml(vuln.name)}" classname="security.${severity}">\n`;
        xml += `      <failure message="${severity.toUpperCase()} vulnerability found" type="${severity}">\n`;
        xml += `        Package: ${this.escapeXml(vuln.name)}\n`;
        xml += `        Vulnerable Range: ${this.escapeXml(vuln.range)}\n`;
        xml += `        Severity: ${severity}\n`;
        xml += `      </failure>\n`;
        xml += `    </testcase>\n`;
      });
    };

    addTestCases(results.grouped.critical, 'critical');
    addTestCases(results.grouped.high, 'high');
    addTestCases(results.grouped.moderate, 'moderate');
    addTestCases(results.grouped.low, 'low');

    results.ignored.forEach((pkg) => {
      xml += `    <testcase name="${this.escapeXml(pkg.name)}" classname="security.ignored">\n`;
      xml += `      <skipped message="Package is blacklisted (severity: ${pkg.severity})" />\n`;
      xml += `    </testcase>\n`;
    });

    results.blacklistWarnings.forEach((pkgName) => {
      xml += `    <testcase name="${this.escapeXml(pkgName)}" classname="security.blacklist.warning">\n`;
      xml += `      <failure message="Blacklisted package has no security issues" type="blacklist_cleanup_required">\n`;
      xml += `        Package: ${this.escapeXml(pkgName)}\n`;
      xml += `        Issue: Package is on blacklist but has no security vulnerabilities\n`;
      xml += `        Action Required: Remove this package from blacklist or verify it's still needed\n`;
      xml += `      </failure>\n`;
      xml += `    </testcase>\n`;
    });

    xml += '  </testsuite>\n';
    xml += '</testsuites>\n';

    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
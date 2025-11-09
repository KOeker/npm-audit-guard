"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JUnitReporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class JUnitReporter {
    saveReport(results, outputPath) {
        const xml = this.generateJUnitXML(results);
        const finalPath = outputPath || './audit-results.xml';
        const dir = path.dirname(finalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(finalPath, xml, 'utf-8');
        return finalPath;
    }
    generateJUnitXML(results) {
        const totalTests = results.totalCount + results.ignored.length + results.blacklistWarnings.length;
        const failures = results.totalCount + results.blacklistWarnings.length;
        const timestamp = new Date().toISOString();
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<testsuites name="npm-audit-guard" tests="${totalTests}" failures="${failures}" time="0">\n`;
        xml += `  <testsuite name="Security Audit" tests="${totalTests}" failures="${failures}" timestamp="${timestamp}">\n`;
        const addTestCases = (vulns, severity) => {
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
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
exports.JUnitReporter = JUnitReporter;
//# sourceMappingURL=junit.js.map
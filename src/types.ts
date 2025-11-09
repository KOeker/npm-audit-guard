export interface AuditVulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  range: string;
  via: string[];
  effects: string[];
  fixAvailable: boolean | { name: string; version: string };
}

export interface AuditResult {
  vulnerabilities: Record<string, AuditVulnerability>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
}

export interface GroupedVulnerabilities {
  critical: Array<{ name: string; range: string }>;
  high: Array<{ name: string; range: string }>;
  moderate: Array<{ name: string; range: string }>;
  low: Array<{ name: string; range: string }>;
}

export interface BlacklistedPackage {
  name: string;
  severity: string;
}

export interface AuditGuardConfig {
  blacklist?: string[];
  includeDev?: boolean;
}

export interface CliOptions {
  dev?: boolean;
  blacklist?: string;
  junit?: boolean;
  output?: string;
}

export interface FormattedResults {
  grouped: GroupedVulnerabilities;
  ignored: BlacklistedPackage[];
  blacklistWarnings: string[];
  totalCount: number;
}
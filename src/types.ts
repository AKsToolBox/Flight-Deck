/**
 * Core type definitions for Enterprise Infrastructure & Systems Management Console
 */

export type NavigationTab =
  | "windows"
  | "linux"
  | "automation"
  | "iac"
  | "vmware"
  | "performance"
  | "configmgmt"
  | "reporting"
  | "copilot";

// Windows Admin Types
export interface ADUser {
  id: string;
  samAccountName: string;
  displayName: string;
  userPrincipalName: string;
  department: string;
  title: string;
  enabled: boolean;
  lockedOut: boolean;
  passwordLastSet: string;
  lastLogon: string;
  memberOf: string[];
}

export interface ADGroup {
  id: string;
  name: string;
  scope: "Domain Local" | "Global" | "Universal";
  category: "Security" | "Distribution";
  memberCount: number;
  description: string;
}

export interface EntraUserSync {
  id: string;
  upn: string;
  syncStatus: "Synced" | "Cloud-Only" | "Sync-Error";
  mfaState: "Enforced" | "Enabled" | "Disabled";
  conditionalAccessState: "Compliant" | "Non-Compliant" | "Grace-Period";
  pimRoles: string[];
}

export interface GPOItem {
  id: string;
  name: string;
  status: "Enabled" | "Disabled" | "User Disabled" | "Computer Disabled";
  linkedOU: string;
  enforced: boolean;
  wmiFilter?: string;
  lastModified: string;
  version: string;
  description: string;
}

export interface DNSRecord {
  id: string;
  zone: string;
  name: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "PTR" | "SRV" | "TXT";
  data: string;
  ttl: number;
  timestamp: string;
}

export interface DHCPScope {
  id: string;
  scopeId: string;
  name: string;
  startRange: string;
  endRange: string;
  subnetMask: string;
  leaseDuration: string;
  activeLeases: number;
  totalAddresses: number;
  state: "Active" | "Inactive" | "Exhausted";
}

export interface EventLogEntry {
  id: string;
  logType: "System" | "Application" | "Security";
  level: "Information" | "Warning" | "Error" | "Critical";
  eventId: number;
  source: string;
  timeGenerated: string;
  computer: string;
  message: string;
}

// Linux Admin Types
export interface LinuxServer {
  id: string;
  hostname: string;
  distro: "RHEL 9.4" | "Ubuntu 24.04 LTS" | "Rocky Linux 9.3" | "CentOS Stream 9" | "AlmaLinux 9.4";
  kernel: string;
  ipAddress: string;
  uptime: string;
  status: "Online" | "Degraded" | "Maintenance";
  cpuUsage: number;
  memUsage: number;
  loadAverage: [number, number, number];
}

export interface SystemdService {
  id: string;
  unitName: string;
  description: string;
  loadState: "loaded" | "not-found";
  activeState: "active" | "inactive" | "failed" | "activating";
  subState: "running" | "exited" | "dead" | "waiting";
  enabled: boolean;
  pid?: number;
  memoryUsage?: string;
}

export interface SysctlParameter {
  key: string;
  currentValue: string;
  recommendedValue: string;
  category: "Memory" | "Network" | "File System" | "Security";
  description: string;
  requiresReboot: boolean;
}

// Automation & Provisioning
export interface AutomationWorkflow {
  id: string;
  name: string;
  type: "PowerShell" | "Bash" | "Python" | "Ansible";
  category: "Administrative" | "Provisioning" | "Maintenance" | "Disaster Recovery";
  description: string;
  lastRunStatus: "Success" | "Failed" | "Running" | "Scheduled";
  lastRunDuration: string;
  lastRunTime: string;
  scriptContent: string;
}

// IaC & DevOps
export interface IaCTemplate {
  id: string;
  name: string;
  framework: "Terraform" | "Azure Bicep" | "ARM" | "Ansible";
  targetPlatform: "Azure" | "AWS" | "VMware vSphere" | "Hybrid Cloud";
  version: string;
  code: string;
  complianceStatus: "Compliant" | "Non-Compliant" | "Pending Review";
}

export interface GitBranch {
  name: string;
  lastCommit: string;
  author: string;
  updatedAt: string;
  isDefault: boolean;
  protected: boolean;
}

// VMware Virtualization
export interface VMwareCluster {
  id: string;
  name: string;
  vCenter: string;
  hostsCount: number;
  vmsCount: number;
  cpuCapacityGhz: number;
  cpuUsedGhz: number;
  ramCapacityGb: number;
  ramUsedGb: number;
  drsStatus: "Fully Automated" | "Partially Automated" | "Manual";
  haStatus: "Protected" | "Degraded" | "Disabled";
}

export interface VirtualMachine {
  id: string;
  name: string;
  guestOS: string;
  host: string;
  cluster: string;
  vCpu: number;
  vRamGb: number;
  storageGb: number;
  powerState: "Powered On" | "Powered Off" | "Suspended";
  cpuReadyPct: number;
  balloonMemoryMb: number;
  snapshotCount: number;
  toolsStatus: "Running (Current)" | "Out of Date" | "Not Installed";
}

// Incident Resolution & Performance
export interface IncidentTicket {
  id: string;
  title: string;
  severity: string;
  environment?: string;
  targetHost?: string;
  affectedHost?: string;
  assignedTo?: string;
  status: string;
  createdTime?: string;
  timestamp?: string;
  description?: string;
  symptoms: string[];
  logsSnapshot?: string;
  rawLogs?: string;
  metrics?: {
    cpu: number;
    memory: number;
    diskIoMs: number;
    networkDropPct: number;
  };
  rootCauseAnalysis?: string;
  remediationPlan?: string;
}

export type IncidentRecord = IncidentTicket;

export interface ChefNode {
  id: string;
  name: string;
  platform: string;
  policyGroup: string;
  policyName: string;
  lastCheckin: string;
  convergenceTime: string;
  status: "Compliant" | "Non-Compliant" | "Error";
  driftDetected: boolean;
}

export interface ExecutiveMetrics {
  fleetUptimeSla: number;
  cisComplianceScore: number;
  patchCompliancePct: number;
  totalServers: number;
  criticalAlerts: number;
  activeRunbooks: number;
  meanTimeToRecoveryMinutes: number;
}

// Configuration Management & Compliance
export interface ChefCookbook {
  id?: string;
  name: string;
  version: string;
  description?: string;
  maintainer?: string;
  recipeCode?: string;
  recipes: string[];
  nodesApplied: number;
  complianceRate: number;
  status: "Synced" | "Drift Detected" | "Updating";
  attributesSample: string;
}

export interface InSpecControl {
  id: string;
  title: string;
  impact: "critical" | "high" | "medium" | "low";
  standard: "CIS Benchmark Level 1" | "CIS Benchmark Level 2" | "NIST 800-53" | "HIPAA";
  status: "Passed" | "Failed" | "Skipped";
  remediation: string;
}

// Chat & AI
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
  roleMode?: string;
  thinkingMode?: boolean;
}

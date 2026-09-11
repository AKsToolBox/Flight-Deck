import {
  ADUser,
  ADGroup,
  EntraUserSync,
  GPOItem,
  DNSRecord,
  DHCPScope,
  EventLogEntry,
  LinuxServer,
  SystemdService,
  SysctlParameter,
  AutomationWorkflow,
  IaCTemplate,
  GitBranch,
  VMwareCluster,
  VirtualMachine,
  IncidentTicket,
  ChefCookbook,
  InSpecControl,
  ChefNode,
  ExecutiveMetrics,
} from "../types";

export const initialADUsers: ADUser[] = [
  {
    id: "usr-101",
    samAccountName: "akarim",
    displayName: "Asef Karim",
    userPrincipalName: "akarim@corp.contoso.internal",
    department: "Enterprise Systems & Cloud Ops",
    title: "Lead Infrastructure Architect",
    enabled: true,
    lockedOut: false,
    passwordLastSet: "2026-08-15",
    lastLogon: "2026-09-10 17:42",
    memberOf: ["Domain Admins", "Enterprise Admins", "Schema Admins", "SRE-Escalation"],
  },
  {
    id: "usr-102",
    samAccountName: "svc_sql_prod",
    displayName: "SQL Server Engine Service Account",
    userPrincipalName: "svc_sql_prod@corp.contoso.internal",
    department: "Database Operations",
    title: "Managed Service Account (gMSA)",
    enabled: true,
    lockedOut: false,
    passwordLastSet: "2026-07-01",
    lastLogon: "2026-09-10 18:20",
    memberOf: ["SQLServer2022MSSQLUser$PROD", "Backup Operators"],
  },
  {
    id: "usr-103",
    samAccountName: "jdoe",
    displayName: "Jane Doe",
    userPrincipalName: "jdoe@corp.contoso.internal",
    department: "DevOps & Release",
    title: "Senior SRE Engineer",
    enabled: true,
    lockedOut: true,
    passwordLastSet: "2026-05-12",
    lastLogon: "2026-09-09 14:15",
    memberOf: ["DevOps-Deployers", "Remote Desktop Users"],
  },
  {
    id: "usr-104",
    samAccountName: "mross",
    displayName: "Michael Ross",
    userPrincipalName: "mross@corp.contoso.internal",
    department: "Corporate Security",
    title: "Security Auditor (SOC Tier 3)",
    enabled: true,
    lockedOut: false,
    passwordLastSet: "2026-08-20",
    lastLogon: "2026-09-10 09:12",
    memberOf: ["Security Auditors", "Compliance Reviewers"],
  },
  {
    id: "usr-105",
    samAccountName: "svc_ansible",
    displayName: "Ansible Automation Control",
    userPrincipalName: "svc_ansible@corp.contoso.internal",
    department: "Infrastructure Automation",
    title: "Automation Service Principal",
    enabled: true,
    lockedOut: false,
    passwordLastSet: "2026-06-11",
    lastLogon: "2026-09-10 18:05",
    memberOf: ["Remote Management Users", "WinRM-Admins"],
  },
];

export const initialADGroups: ADGroup[] = [
  {
    id: "grp-01",
    name: "Domain Admins",
    scope: "Global",
    category: "Security",
    memberCount: 3,
    description: "Designated administrators of the contoso.internal forest domain",
  },
  {
    id: "grp-02",
    name: "Tier-1 Tiering Level",
    scope: "Universal",
    category: "Security",
    memberCount: 14,
    description: "Server administration delegation model compliant with ESAE architecture",
  },
  {
    id: "grp-03",
    name: "GPO-Enforcement-Exemptions",
    scope: "Domain Local",
    category: "Security",
    memberCount: 2,
    description: "Specialized service machines requiring custom audit bypass",
  },
  {
    id: "grp-04",
    name: "Linux-Kerberos-Auth-Group",
    scope: "Global",
    category: "Security",
    memberCount: 38,
    description: "Active Directory integrated Linux servers using SSSD / RealmD",
  },
];

export const initialEntraSync: EntraUserSync[] = [
  {
    id: "entra-01",
    upn: "akarim@corp.contoso.internal",
    syncStatus: "Synced",
    mfaState: "Enforced",
    conditionalAccessState: "Compliant",
    pimRoles: ["Global Administrator (Eligible)", "Privileged Role Administrator"],
  },
  {
    id: "entra-02",
    upn: "jdoe@corp.contoso.internal",
    syncStatus: "Synced",
    mfaState: "Enforced",
    conditionalAccessState: "Grace-Period",
    pimRoles: ["Application Administrator", "Intune Administrator"],
  },
  {
    id: "entra-03",
    upn: "mross@corp.contoso.internal",
    syncStatus: "Synced",
    mfaState: "Enforced",
    conditionalAccessState: "Compliant",
    pimRoles: ["Security Administrator", "Compliance Administrator"],
  },
];

export const initialGPOs: GPOItem[] = [
  {
    id: "gpo-01",
    name: "Default Domain Controllers Policy",
    status: "Enabled",
    linkedOU: "OU=Domain Controllers,DC=corp,DC=contoso,DC=internal",
    enforced: true,
    lastModified: "2026-08-01",
    version: "v42.12",
    description: "Enforces Kerberos clock skew, NTLMv2 restriction, and LDAPS channel binding.",
  },
  {
    id: "gpo-02",
    name: "SEC-WinServer-CIS-Hardening-L1",
    status: "Enabled",
    linkedOU: "OU=Member Servers,DC=corp,DC=contoso,DC=internal",
    enforced: true,
    wmiFilter: "WMI-Filter-WindowsServer2022-2025",
    lastModified: "2026-08-25",
    version: "v18.4",
    description: "Disables SMBv1, forces SMB signing, restricts WinRM encryption, configures PowerShell Transcription.",
  },
  {
    id: "gpo-03",
    name: "NET-DNS-DHCP-Failover-ClientConfig",
    status: "Enabled",
    linkedOU: "OU=Corporate Workstations,DC=corp,DC=contoso,DC=internal",
    enforced: false,
    lastModified: "2026-07-14",
    version: "v6.1",
    description: "Configures DNS suffix search list and dynamic DNS client registration TTLs.",
  },
  {
    id: "gpo-04",
    name: "DEPR-Legacy-TLS1.0-Allowed-Exception",
    status: "Disabled",
    linkedOU: "OU=Legacy App Servers,DC=corp,DC=contoso,DC=internal",
    enforced: false,
    lastModified: "2026-09-02",
    version: "v2.0",
    description: "Deprecated fallback policy. Deactivated following TLS 1.3 migration.",
  },
];

export const initialDNSRecords: DNSRecord[] = [
  { id: "dns-01", zone: "corp.contoso.internal", name: "dc01.corp", type: "A", data: "10.10.10.11", ttl: 3600, timestamp: "Static" },
  { id: "dns-02", zone: "corp.contoso.internal", name: "dc02.corp", type: "A", data: "10.10.10.12", ttl: 3600, timestamp: "Static" },
  { id: "dns-03", zone: "corp.contoso.internal", name: "vcenter01.corp", type: "A", data: "10.10.20.10", ttl: 3600, timestamp: "Static" },
  { id: "dns-04", zone: "corp.contoso.internal", name: "chef-server.corp", type: "A", data: "10.10.30.5", ttl: 3600, timestamp: "Static" },
  { id: "dns-05", zone: "corp.contoso.internal", name: "k8s-ingress.corp", type: "CNAME", data: "loadbalancer.corp.contoso.internal", ttl: 300, timestamp: "Dynamic" },
  { id: "dns-06", zone: "corp.contoso.internal", name: "_ldap._tcp.dc._msdcs", type: "SRV", data: "0 100 389 dc01.corp.contoso.internal", ttl: 600, timestamp: "Static" },
];

export const initialDHCPOptions: DHCPScope[] = [
  {
    id: "dhcp-01",
    scopeId: "10.10.40.0",
    name: "Production App Tier VLAN 40",
    startRange: "10.10.40.50",
    endRange: "10.10.40.250",
    subnetMask: "255.255.255.0",
    leaseDuration: "8 Hours",
    activeLeases: 188,
    totalAddresses: 201,
    state: "Active",
  },
  {
    id: "dhcp-02",
    scopeId: "10.10.50.0",
    name: "DMZ & Management Jumpboxes",
    startRange: "10.10.50.10",
    endRange: "10.10.50.100",
    subnetMask: "255.255.255.0",
    leaseDuration: "14 Days",
    activeLeases: 45,
    totalAddresses: 91,
    state: "Active",
  },
  {
    id: "dhcp-03",
    scopeId: "10.10.60.0",
    name: "PXE Automated Provisioning Pool",
    startRange: "10.10.60.100",
    endRange: "10.10.60.254",
    subnetMask: "255.255.255.0",
    leaseDuration: "2 Hours",
    activeLeases: 152,
    totalAddresses: 155,
    state: "Exhausted",
  },
];

export const initialEventLogs: EventLogEntry[] = [
  {
    id: "ev-01",
    logType: "System",
    level: "Critical",
    eventId: 41,
    source: "Microsoft-Windows-Kernel-Power",
    timeGenerated: "2026-09-10 16:45:12",
    computer: "WIN-PRD-SQL01.corp.contoso.internal",
    message: "The system has rebooted without cleanly shutting down first. This error could be caused if the system stopped responding, crashed, or lost power unexpectedly.",
  },
  {
    id: "ev-02",
    logType: "System",
    level: "Error",
    eventId: 1000,
    source: "Application Error",
    timeGenerated: "2026-09-10 17:12:05",
    computer: "WIN-PRD-APP02.corp.contoso.internal",
    message: "Faulting application name: w3wp.exe, version: 10.0.20348.1, faulting module name: ntdll.dll. Exception code: 0xc0000005.",
  },
  {
    id: "ev-03",
    logType: "Security",
    level: "Warning",
    eventId: 4740,
    source: "Microsoft-Windows-Security-Auditing",
    timeGenerated: "2026-09-10 18:01:22",
    computer: "DC01.corp.contoso.internal",
    message: "A user account was locked out. Target Account Name: jdoe. Caller Computer Name: JUMPBOX-VDI-04.",
  },
  {
    id: "ev-04",
    logType: "System",
    level: "Information",
    eventId: 1074,
    source: "User32",
    timeGenerated: "2026-09-10 03:00:00",
    computer: "WIN-PRD-FILE01.corp.contoso.internal",
    message: "The process C:\\Windows\\System32\\svchost.exe (PatchManager) has initiated the restart of computer on behalf of NT AUTHORITY\\SYSTEM for reason: Operating System: Reconfig (Planned).",
  },
];

export const initialLinuxServers: LinuxServer[] = [
  {
    id: "lx-01",
    hostname: "rhel-prd-core01.contoso.internal",
    distro: "RHEL 9.4",
    kernel: "5.14.0-427.18.1.el9_4.x86_64",
    ipAddress: "10.10.30.21",
    uptime: "142 days, 11:20",
    status: "Online",
    cpuUsage: 38,
    memUsage: 64,
    loadAverage: [1.25, 1.40, 1.15],
  },
  {
    id: "lx-02",
    hostname: "ubuntu-prd-k8s-node03.contoso.internal",
    distro: "Ubuntu 24.04 LTS",
    kernel: "6.8.0-31-generic",
    ipAddress: "10.10.30.45",
    uptime: "88 days, 04:12",
    status: "Degraded",
    cpuUsage: 94,
    memUsage: 89,
    loadAverage: [8.65, 7.12, 6.45],
  },
  {
    id: "lx-03",
    hostname: "rocky-prd-db01.contoso.internal",
    distro: "Rocky Linux 9.3",
    kernel: "5.14.0-362.24.1.el9_3.x86_64",
    ipAddress: "10.10.30.60",
    uptime: "210 days, 18:04",
    status: "Online",
    cpuUsage: 45,
    memUsage: 78,
    loadAverage: [2.10, 2.30, 2.05],
  },
  {
    id: "lx-04",
    hostname: "almalinux-prd-edge01.contoso.internal",
    distro: "AlmaLinux 9.4",
    kernel: "5.14.0-427.13.1.el9_4.x86_64",
    ipAddress: "10.10.30.77",
    uptime: "65 days, 09:30",
    status: "Online",
    cpuUsage: 22,
    memUsage: 41,
    loadAverage: [0.45, 0.55, 0.50],
  },
];

export const initialSystemdServices: SystemdService[] = [
  {
    id: "svc-01",
    unitName: "sssd.service",
    description: "System Security Services Daemon (Active Directory Integration)",
    loadState: "loaded",
    activeState: "active",
    subState: "running",
    enabled: true,
    pid: 1042,
    memoryUsage: "48.2 MB",
  },
  {
    id: "svc-02",
    unitName: "nginx.service",
    description: "The NGINX HTTP and reverse proxy server",
    loadState: "loaded",
    activeState: "active",
    subState: "running",
    enabled: true,
    pid: 3280,
    memoryUsage: "184.6 MB",
  },
  {
    id: "svc-03",
    unitName: "chef-client.service",
    description: "Chef Infra Client Daemon",
    loadState: "loaded",
    activeState: "active",
    subState: "running",
    enabled: true,
    pid: 4110,
    memoryUsage: "112.0 MB",
  },
  {
    id: "svc-04",
    unitName: "containerd.service",
    description: "containerd container runtime",
    loadState: "loaded",
    activeState: "active",
    subState: "running",
    enabled: true,
    pid: 1489,
    memoryUsage: "430.8 MB",
  },
  {
    id: "svc-05",
    unitName: "chrony.service",
    description: "NTP client/server daemon for domain sync",
    loadState: "loaded",
    activeState: "active",
    subState: "running",
    enabled: true,
    pid: 902,
    memoryUsage: "12.4 MB",
  },
  {
    id: "svc-06",
    unitName: "auditd.service",
    description: "Security Auditing Service",
    loadState: "loaded",
    activeState: "failed",
    subState: "dead",
    enabled: true,
    pid: undefined,
    memoryUsage: "0 MB",
  },
];

export const initialSysctlParams: SysctlParameter[] = [
  {
    key: "vm.swappiness",
    currentValue: "60",
    recommendedValue: "10",
    category: "Memory",
    description: "Aggressiveness of the kernel copying memory pages into swap space. Lower values prevent unnecessary paging for high-performance databases and Kubernetes nodes.",
    requiresReboot: false,
  },
  {
    key: "net.core.somaxconn",
    currentValue: "128",
    recommendedValue: "65535",
    category: "Network",
    description: "Maximum queue length of pending TCP connections. Stock default of 128 causes silent SYN drops during enterprise traffic spikes.",
    requiresReboot: false,
  },
  {
    key: "fs.file-max",
    currentValue: "65536",
    recommendedValue: "2097152",
    category: "File System",
    description: "Maximum file descriptors the kernel can allocate. Essential for container hosts and high-concurrency web reverse proxies.",
    requiresReboot: false,
  },
  {
    key: "net.ipv4.tcp_max_syn_backlog",
    currentValue: "512",
    recommendedValue: "16384",
    category: "Network",
    description: "Maximum half-open connections per socket. Protects against SYN flood degradation and connection storms.",
    requiresReboot: false,
  },
  {
    key: "vm.dirty_ratio",
    currentValue: "20",
    recommendedValue: "10",
    category: "Memory",
    description: "Percentage of total system memory at which dirty pages are forcibly flushed by the OS flusher thread, avoiding heavy I/O stalls.",
    requiresReboot: false,
  },
];

export const initialAutomationWorkflows: AutomationWorkflow[] = [
  {
    id: "wf-01",
    name: "Enterprise Offboarding & AD / Entra ID Deprovisioning",
    type: "PowerShell",
    category: "Administrative",
    description: "Disables user in AD DS, revokes Entra ID refresh tokens, moves to Staged Deletion OU, removes group memberships, exports mailbox to PST archive.",
    lastRunStatus: "Success",
    lastRunDuration: "42s",
    lastRunTime: "2026-09-10 14:22",
    scriptContent: `# Enterprise User Offboarding Automation Runbook
[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [Parameter(Mandatory=$true)]
    [string]$SamAccountName,
    
    [Parameter(Mandatory=$false)]
    [string]$TargetOU = "OU=Terminated,OU=Disabled Accounts,DC=corp,DC=contoso,DC=internal"
)

$ErrorActionPreference = "Stop"
Write-Output "[$((Get-Date).ToString('s'))] [INFO] Starting deprovisioning runbook for $SamAccountName"

try {
    # 1. Disable Active Directory Account
    Disable-ADAccount -Identity $SamAccountName -Confirm:$false
    Set-ADUser -Identity $SamAccountName -Description "Deactivated on $(Get-Date -Format 'yyyy-MM-dd') per HR Ticket"
    
    # 2. Revoke Entra ID Sessions
    Write-Output "[INFO] Calling Microsoft Graph API to revoke Entra ID refresh tokens..."
    # Revoke-MgUserSignInSession -UserId $SamAccountName
    
    # 3. Strip Privileged Groups (Prevent lateral escalation)
    $groups = Get-ADUser -Identity $SamAccountName -Properties MemberOf | Select-Object -ExpandProperty MemberOf
    foreach ($grp in $groups) {
        if ($grp -notlike "*Domain Users*") {
            Remove-ADGroupMember -Identity $grp -Members $SamAccountName -Confirm:$false
        }
    }
    
    # 4. Move to Quarantine OU
    Move-ADObject -Identity (Get-ADUser $SamAccountName).DistinguishedName -TargetPath $TargetOU
    Write-Output "[SUCCESS] User $SamAccountName safely quarantined and isolated."
} catch {
    Write-Error "Deprovisioning failed: $_"
    throw
}`,
  },
  {
    id: "wf-02",
    name: "Enterprise Linux Kernel Live Patching & Security Errata Apply",
    type: "Bash",
    category: "Maintenance",
    description: "Automates dnf-plugin-kpatch evaluation, installs high-impact CVE kernel patches, verifies kpatch core list, and publishes audit logs.",
    lastRunStatus: "Success",
    lastRunDuration: "1m 14s",
    lastRunTime: "2026-09-09 03:30",
    scriptContent: `#!/usr/bin/env bash
# Enterprise Linux Live Patch & Errata Remediation
set -euo pipefail

LOG_FILE="/var/log/enterprise-kpatch-$(date +%Y%m%d).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date -Iseconds)] [INFO] Checking for critical CVE kernel live-patches..."

if command -v dnf &>/dev/null; then
    dnf updateinfo list security --installed
    dnf update-minimal --security --sec-severity=Critical -y
    if systemctl is-active --quiet kpatch; then
        echo "[INFO] Inspecting loaded kpatch modules:"
        kpatch list
    fi
elif command -v apt-get &>/dev/null; then
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --only-upgrade
fi

echo "[$(date -Iseconds)] [SUCCESS] Live patching audit concluded cleanly."`,
  },
  {
    id: "wf-03",
    name: "VMware vSphere Datastore Free Space Balancer & Snapshot Reaper",
    type: "Python",
    category: "Disaster Recovery",
    description: "Scans all VMFS datastores below 15% free space, consolidates abandoned snapshots older than 72 hours, triggers Storage vMotion to spillover tiers.",
    lastRunStatus: "Running",
    lastRunDuration: "In Progress",
    lastRunTime: "2026-09-10 18:25",
    scriptContent: `"""
VMware pyVmomi Automated Snapshot Reaper & Datastore Threshold Auditor
"""
import sys
import datetime

THRESHOLD_CRITICAL_PCT = 15.0
MAX_SNAPSHOT_AGE_HOURS = 72

def audit_datastores(vcenter_client):
    print(f"[*] Connecting to vCenter and evaluating VMFS/vSAN datastores...")
    # Telemetry sweep
    alerts = []
    return alerts

if __name__ == "__main__":
    print("[*] Initiating storage threshold policy execution.")`,
  },
];

export const initialIaCTemplates: IaCTemplate[] = [
  {
    id: "iac-01",
    name: "Terraform - Multi-Zone VMware ESXi VM Provisioning",
    framework: "Terraform",
    targetPlatform: "VMware vSphere",
    version: "v2.4.0",
    complianceStatus: "Compliant",
    code: `terraform {
  required_version = ">= 1.7.0"
  required_providers {
    vsphere = {
      source  = "hashicorp/vsphere"
      version = "~> 2.8.0"
    }
  }
}

variable "vm_count" {
  type    = number
  default = 3
}

resource "vsphere_virtual_machine" "app_cluster" {
  count            = var.vm_count
  name             = "prd-app-node-\${format("%02d", count.index + 1)}"
  resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id
  datastore_id     = data.vsphere_datastore.vsan_storage.id

  num_cpus = 8
  memory   = 32768
  guest_id = "rhel9_64Guest"

  network_interface {
    network_id   = data.vsphere_network.vds_app_vlan.id
    adapter_type = "vmxnet3"
  }

  disk {
    label            = "disk0"
    size             = 120
    thin_provisioned = true
  }

  clone {
    template_uuid = data.vsphere_virtual_machine.rhel_golden_template.id
    customize {
      linux_options {
        host_name = "prd-app-node-\${format("%02d", count.index + 1)}"
        domain    = "corp.contoso.internal"
      }
      network_interface {
        ipv4_address = "10.10.40.\${50 + count.index}"
        ipv4_netmask = 24
      }
      ipv4_gateway = "10.10.40.1"
      dns_server_list = ["10.10.10.11", "10.10.10.12"]
    }
  }
}`,
  },
  {
    id: "iac-02",
    name: "Azure Bicep - Hybrid Entra ID Domain Controller & VNet",
    framework: "Azure Bicep",
    targetPlatform: "Azure",
    version: "v1.1.0",
    complianceStatus: "Compliant",
    code: `@description('Azure Bicep template for Hybrid Active Directory Domain Controller VM')
param location string = resourceGroup().location
param vmName string = 'AZ-PRD-DC03'
param adminUsername string = 'azadmin'
@secure()
param adminPassword string

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' existing = {
  name: 'vnet-hybrid-infrastructure'
}

resource nic 'Microsoft.Network/networkInterfaces@2023-09-01' = {
  name: '\${vmName}-nic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Static'
          privateIPAddress: '10.200.10.4'
          subnet: {
            id: resourceId('Microsoft.Network/virtualNetworks/subnets', vnet.name, 'snet-domain-controllers')
          }
        }
      }
    ]
  }
}`,
  },
];

export const initialGitBranches: GitBranch[] = [
  { name: "main", lastCommit: "feat: add CIS-L2 audit recipe to Chef profile (7f9c21)", author: "Asef Karim", updatedAt: "2026-09-10 16:30", isDefault: true, protected: true },
  { name: "feature/ansible-rhel9-sssd", lastCommit: "fix: enforce ldap_id_mapping = true for Kerberos (3c81e2)", author: "Jane Doe", updatedAt: "2026-09-10 11:15", isDefault: false, protected: false },
  { name: "release/2026-q3-patch-rollout", lastCommit: "chore: update WSUS ring approvals for Server 2022 (a401b9)", author: "Michael Ross", updatedAt: "2026-09-09 17:45", isDefault: false, protected: true },
];

export const initialVMwareClusters: VMwareCluster[] = [
  {
    id: "cls-01",
    name: "PRD-COMPUTE-CLUSTER-01",
    vCenter: "vcenter01.corp.contoso.internal (vSphere 8.0 Update 2)",
    hostsCount: 8,
    vmsCount: 142,
    cpuCapacityGhz: 512,
    cpuUsedGhz: 348,
    ramCapacityGb: 4096,
    ramUsedGb: 3120,
    drsStatus: "Fully Automated",
    haStatus: "Protected",
  },
  {
    id: "cls-02",
    name: "PRD-DATABASE-VSAN-CLUSTER-02",
    vCenter: "vcenter01.corp.contoso.internal",
    hostsCount: 4,
    vmsCount: 28,
    cpuCapacityGhz: 256,
    cpuUsedGhz: 198,
    ramCapacityGb: 2048,
    ramUsedGb: 1680,
    drsStatus: "Fully Automated",
    haStatus: "Protected",
  },
];

export const initialVMs: VirtualMachine[] = [
  {
    id: "vm-101",
    name: "WIN-PRD-SQL01",
    guestOS: "Windows Server 2022 Datacenter",
    host: "esxi-node03.corp",
    cluster: "PRD-DATABASE-VSAN-CLUSTER-02",
    vCpu: 16,
    vRamGb: 128,
    storageGb: 1500,
    powerState: "Powered On",
    cpuReadyPct: 4.8,
    balloonMemoryMb: 0,
    snapshotCount: 1,
    toolsStatus: "Running (Current)",
  },
  {
    id: "vm-102",
    name: "UBUNTU-PRD-K8S-03",
    guestOS: "Ubuntu Linux 24.04 (64-bit)",
    host: "esxi-node01.corp",
    cluster: "PRD-COMPUTE-CLUSTER-01",
    vCpu: 8,
    vRamGb: 32,
    storageGb: 250,
    powerState: "Powered On",
    cpuReadyPct: 9.4,
    balloonMemoryMb: 2450,
    snapshotCount: 3,
    toolsStatus: "Running (Current)",
  },
  {
    id: "vm-103",
    name: "DC01-ACTIVE-DIRECTORY",
    guestOS: "Windows Server 2025 Standard",
    host: "esxi-node02.corp",
    cluster: "PRD-COMPUTE-CLUSTER-01",
    vCpu: 4,
    vRamGb: 16,
    storageGb: 100,
    powerState: "Powered On",
    cpuReadyPct: 0.6,
    balloonMemoryMb: 0,
    snapshotCount: 0,
    toolsStatus: "Running (Current)",
  },
  {
    id: "vm-104",
    name: "CHEF-AUTOMATION-SRV",
    guestOS: "Red Hat Enterprise Linux 9.4",
    host: "esxi-node04.corp",
    cluster: "PRD-COMPUTE-CLUSTER-01",
    vCpu: 8,
    vRamGb: 32,
    storageGb: 300,
    powerState: "Powered On",
    cpuReadyPct: 1.2,
    balloonMemoryMb: 0,
    snapshotCount: 0,
    toolsStatus: "Running (Current)",
  },
];

export const initialIncidents: IncidentTicket[] = [
  {
    id: "INC-9481",
    title: "Critical Thread Contention & CPU Ready Spike on VMware Node 01",
    severity: "P1",
    environment: "VMware Cluster",
    affectedHost: "esxi-node01.corp (UBUNTU-PRD-K8S-03)",
    targetHost: "esxi-node01.corp (UBUNTU-PRD-K8S-03)",
    assignedTo: "Asef Karim (Principal SRE)",
    status: "Investigating",
    createdTime: "2026-09-10 17:55",
    timestamp: "2026-09-10 17:55",
    description: "Kubernetes worker node experiencing 94% CPU ready latency with memory ballooning (2.4 GB reclaimed by ESXi hypervisor). Multiple container pods reporting HTTP 504 gateway timeouts.",
    symptoms: [
      "ESXi Host CPU ready value jumped from 1.2% to 9.4%",
      "vSphere Balloon driver (vmmemctl) aggressively reclaiming guest pages",
      "Network packet drops exceeding 3.8% on vDS portgroup VLAN 40",
      "Kubelet NodeNotReady intermittent flapping",
    ],
    logsSnapshot: `2026-09-10T17:55:01.442Z esxi-node01 vmkernel: cpu22:2098451)WARNING: MonMem: 1834: UBUNTU-PRD-K8S-03: Memory pressure critical, ballooning target: 2450 MB.
2026-09-10T17:55:04.102Z esxi-node01 vmkernel: cpu14:2098453)Sched: 4192: World 2098453: Ready% is 9.42, threshold 5.00 exceeded!
2026-09-10T17:55:12.890Z ubuntu-prd-k8s-node03 kubelet[1489]: E0910 17:55:12.889311 1489 eviction_manager.go:261] evicting pod ingress-controller-74fdc due to memory pressure`,
    rawLogs: `2026-09-10T17:55:01.442Z esxi-node01 vmkernel: cpu22:2098451)WARNING: MonMem: 1834: UBUNTU-PRD-K8S-03: Memory pressure critical, ballooning target: 2450 MB.
2026-09-10T17:55:04.102Z esxi-node01 vmkernel: cpu14:2098453)Sched: 4192: World 2098453: Ready% is 9.42, threshold 5.00 exceeded!
2026-09-10T17:55:12.890Z ubuntu-prd-k8s-node03 kubelet[1489]: E0910 17:55:12.889311 1489 eviction_manager.go:261] evicting pod ingress-controller-74fdc due to memory pressure`,
    metrics: {
      cpu: 94,
      memory: 89,
      diskIoMs: 42,
      networkDropPct: 3.8,
    },
    rootCauseAnalysis: "vCPU co-scheduling lock contention on oversubscribed ESXi socket 0 compounded by guest hypervisor memory ballooning. Resolved by lowering VM vCPU count from 8 to 4 and migrating noisy adjacent VM.",
  },
  {
    id: "INC-9479",
    title: "Kerberos Ticket Expiration & SSSD LDAP Sync Failure on Linux Fleet",
    severity: "P2",
    environment: "Enterprise Linux",
    affectedHost: "rhel-prd-core01.contoso.internal",
    targetHost: "rhel-prd-core01.contoso.internal",
    assignedTo: "Jane Doe (Linux SysAdmin)",
    status: "Identified",
    createdTime: "2026-09-10 16:10",
    timestamp: "2026-09-10 16:10",
    description: "RHEL servers unable to authenticate SSH users via Active Directory credentials. sssd.service logs show KRB5_KDC_UNREACH and clock skew violation.",
    symptoms: [
      "Active Directory joined Linux servers rejecting realm logins",
      "NTP clock drift detected between PDC Emulator (DC01) and Linux fleet (6.2 seconds)",
      "SSSD cache invalidated; offline auth buffer depleted",
    ],
    logsSnapshot: `(2026-09-10 16:10:44): [sssd[be[corp.contoso.internal]]] [fo_resolve_service_send] (0x0100): Trying to resolve SRV record for _ldap._tcp.dc._msdcs.corp.contoso.internal
(2026-09-10 16:10:46): [sssd[be[corp.contoso.internal]]] [krb5_auth_store_creds] (0x0020): krb5_get_init_creds_password failed: Clock skew too great (37)`,
    rawLogs: `(2026-09-10 16:10:44): [sssd[be[corp.contoso.internal]]] [fo_resolve_service_send] (0x0100): Trying to resolve SRV record for _ldap._tcp.dc._msdcs.corp.contoso.internal
(2026-09-10 16:10:46): [sssd[be[corp.contoso.internal]]] [krb5_auth_store_creds] (0x0020): krb5_get_init_creds_password failed: Clock skew too great (37)`,
    metrics: {
      cpu: 28,
      memory: 52,
      diskIoMs: 4,
      networkDropPct: 0.1,
    },
    rootCauseAnalysis: "Hyper-V time synchronization integration provider caused non-monotonic time stepping, drifting the Linux guest clock 6 seconds ahead of DC01 Kerberos tolerance.",
  },
  {
    id: "INC-9472",
    title: "Windows Server 2022 Dirty Shutdown & SQL TempDB IO Bottleneck",
    severity: "P2",
    environment: "Windows Server",
    affectedHost: "WIN-PRD-SQL01.corp.contoso.internal",
    targetHost: "WIN-PRD-SQL01.corp.contoso.internal",
    assignedTo: "Michael Ross (DBA Lead)",
    status: "Mitigating",
    createdTime: "2026-09-10 14:05",
    timestamp: "2026-09-10 14:05",
    description: "Event 41 Kernel-Power crash followed by prolonged recovery. SQL Server TempDB disk queue length spiked to 14.8 on volume T:\\.",
    symptoms: [
      "Storage LUN latency spiked above 65ms on PureStorage array",
      "Pagefile allocation exhausted on drive C:\\",
      "SQL Server worker thread starvation (Event 17883)",
    ],
    logsSnapshot: `Event ID: 41 - Microsoft-Windows-Kernel-Power: The system has rebooted without cleanly shutting down first.
Event ID: 17883 - MSSQLSERVER: Process 0:0:0 (0x1f0c) Worker 0x0000021A appears to be non-yielding on Node 0. Using 100% CPU.`,
    rawLogs: `Event ID: 41 - Microsoft-Windows-Kernel-Power: The system has rebooted without cleanly shutting down first.
Event ID: 17883 - MSSQLSERVER: Process 0:0:0 (0x1f0c) Worker 0x0000021A appears to be non-yielding on Node 0. Using 100% CPU.`,
    metrics: {
      cpu: 98,
      memory: 95,
      diskIoMs: 68,
      networkDropPct: 0.2,
    },
  },
];

export const initialChefNodes: ChefNode[] = [
  {
    id: "node-01",
    name: "DC01.corp.contoso.internal",
    platform: "Windows Server 2025 Standard",
    policyGroup: "production",
    policyName: "tier0_domain_controller",
    lastCheckin: "3 mins ago",
    convergenceTime: "9.2s",
    status: "Compliant",
    driftDetected: false,
  },
  {
    id: "node-02",
    name: "WIN-PRD-SQL01.corp.contoso.internal",
    platform: "Windows Server 2022 Datacenter",
    policyGroup: "production",
    policyName: "high_perf_sql_cluster",
    lastCheckin: "18 mins ago",
    convergenceTime: "14.1s",
    status: "Compliant",
    driftDetected: true,
  },
  {
    id: "node-03",
    name: "rhel-prd-core01.contoso.internal",
    platform: "RHEL 9.4",
    policyGroup: "production",
    policyName: "enterprise_linux_base",
    lastCheckin: "6 mins ago",
    convergenceTime: "8.4s",
    status: "Compliant",
    driftDetected: false,
  },
  {
    id: "node-04",
    name: "ubuntu-prd-k8s-03.contoso.internal",
    platform: "Ubuntu 24.04 LTS",
    policyGroup: "production",
    policyName: "k8s_containerd_hardened",
    lastCheckin: "1 min ago",
    convergenceTime: "11.7s",
    status: "Compliant",
    driftDetected: false,
  },
];

export const initialExecutiveMetrics: ExecutiveMetrics = {
  fleetUptimeSla: 99.98,
  cisComplianceScore: 94.2,
  patchCompliancePct: 92.8,
  totalServers: 184,
  criticalAlerts: 1,
  activeRunbooks: 18,
  meanTimeToRecoveryMinutes: 14.5,
};

export const mockTelemetryTimeline = [
  { time: "12:00", cpu: 42, memory: 65, diskIops: 1200, netMbps: 450 },
  { time: "13:00", cpu: 48, memory: 68, diskIops: 1450, netMbps: 510 },
  { time: "14:00", cpu: 56, memory: 70, diskIops: 1600, netMbps: 620 },
  { time: "15:00", cpu: 62, memory: 73, diskIops: 2100, netMbps: 780 },
  { time: "16:00", cpu: 75, memory: 78, diskIops: 2800, netMbps: 940 },
  { time: "17:00", cpu: 89, memory: 86, diskIops: 4200, netMbps: 1250 },
  { time: "18:00", cpu: 68, memory: 76, diskIops: 1900, netMbps: 810 },
];

export const initialChefCookbooks: ChefCookbook[] = [
  {
    name: "cis_hardening_enterprise",
    version: "3.4.1",
    recipes: ["default.rb", "auditd.rb", "sshd_config.rb", "sysctl_hardening.rb", "pam_auth.rb"],
    nodesApplied: 184,
    complianceRate: 98.2,
    status: "Synced",
    attributesSample: `default['cis']['level'] = 2
default['sysctl']['params']['net.ipv4.ip_forward'] = 0
default['sysctl']['params']['net.ipv4.conf.all.accept_redirects'] = 0
default['auditd']['space_left_action'] = 'email'
default['sshd']['protocol'] = 2
default['sshd']['ciphers'] = 'chacha20-poly1305@openssh.com,aes256-gcm@openssh.com'`,
  },
  {
    name: "baseline_activedirectory_client",
    version: "2.1.0",
    recipes: ["default.rb", "sssd_realm.rb", "kerberos_keytab.rb", "sudoers_delegation.rb"],
    nodesApplied: 142,
    complianceRate: 94.6,
    status: "Drift Detected",
    attributesSample: `default['ad']['domain'] = 'corp.contoso.internal'
default['ad']['kdc'] = 'dc01.corp.contoso.internal'
default['ad']['ad_domain_admin_group'] = 'Domain Admins'
default['ad']['fallback_homedir'] = '/home/%u@%d'`,
  },
  {
    name: "vmware_tools_lifecycle",
    version: "1.8.4",
    recipes: ["default.rb", "open_vm_tools.rb", "deploy_guestinfo.rb"],
    nodesApplied: 215,
    complianceRate: 100.0,
    status: "Synced",
    attributesSample: `default['vmware']['package_name'] = 'open-vm-tools'
default['vmware']['enable_timesync'] = true
default['vmware']['balloon_driver_mon'] = true`,
  },
];

export const initialInSpecControls: InSpecControl[] = [
  {
    id: "CIS-RHEL9-1.1.1.1",
    title: "Ensure mounting of cramfs filesystems is disabled",
    impact: "medium",
    standard: "CIS Benchmark Level 1",
    status: "Passed",
    remediation: "Add 'install cramfs /bin/false' in /etc/modprobe.d/cramfs.conf",
  },
  {
    id: "CIS-WIN2022-2.3.1.1",
    title: "Accounts: Administrator account status is set to Disabled",
    impact: "high",
    standard: "CIS Benchmark Level 1",
    status: "Passed",
    remediation: "Enforce through GPO: Computer Configuration > Windows Settings > Security Settings > Local Policies > Security Options",
  },
  {
    id: "CIS-NET-3.3.1",
    title: "Ensure ICMP redirects are not accepted",
    impact: "high",
    standard: "CIS Benchmark Level 1",
    status: "Failed",
    remediation: "Set sysctl net.ipv4.conf.all.accept_redirects = 0 and apply sysctl -p",
  },
  {
    id: "NIST-800-53-AC-2",
    title: "Privileged Access Management & Just-In-Time Credential Delegation",
    impact: "critical",
    standard: "NIST 800-53",
    status: "Passed",
    remediation: "Enforce Entra ID PIM elevation workflows with mandatory justification and time-bounds",
  },
];

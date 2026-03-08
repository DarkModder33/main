#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [ValidateSet("print", "verify", "api")]
    [string]$Command = "print",
    [string]$Domain = $(if ($env:DOMAIN) { $env:DOMAIN } else { "tradehax.net" }),
    [string]$Target = $(if ($env:TARGET) { $env:TARGET } else { "cname.vercel-dns.com" }),
    [string]$Ttl = $(if ($env:TTL) { $env:TTL } else { "Automatic" })
)

$ErrorActionPreference = "Stop"

function Show-Records {
@"
Namecheap Advanced DNS - copy/paste these values

Delete existing records for host '@' and 'www' first.

Record 1
  Type : CNAME
  Host : @
  Value: $Target
  TTL  : $Ttl

Record 2
  Type : CNAME
  Host : www
  Value: $Target
  TTL  : $Ttl

After saving, run:
  .\namecheap-dns-copypasta.ps1 -Command verify
"@
}

function Verify-Dns {
    $answers = @()
    try {
        $answers += Resolve-DnsName -Name $Domain -Type CNAME -ErrorAction Stop | Select-Object -ExpandProperty NameHost
    } catch {}

    if ($answers.Count -eq 0) {
        try {
            $answers += Resolve-DnsName -Name $Domain -Type A -ErrorAction Stop | Select-Object -ExpandProperty IPAddress
        } catch {}
    }

    Write-Output "DNS lookup for ${Domain}:"
    if ($answers.Count -eq 0) {
        Write-Output "No DNS answer returned."
    } else {
        $answers | ForEach-Object { Write-Output $_ }
    }
    Write-Output ""

    if (($answers -join "`n") -match [regex]::Escape($Target)) {
        Write-Output "OK: $Domain appears to point to $Target."
    } else {
        Write-Output "WARN: $Domain does not appear to point to $Target yet."
        Write-Output "Propagation may take a few minutes."
    }
}

function Set-HostsViaApi {
    $required = @("NAMECHEAP_API_USER", "NAMECHEAP_API_KEY", "NAMECHEAP_USERNAME", "NAMECHEAP_CLIENT_IP")
    foreach ($name in $required) {
        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
            throw "Missing required env var: $name"
        }
    }

    $parts = $Domain.Split('.')
    if ($parts.Length -lt 2) {
        throw "Invalid domain format: $Domain"
    }

    $tld = $parts[-1]
    $sld = ($parts[0..($parts.Length - 2)] -join '.')

    $query = @{
        ApiUser = [Environment]::GetEnvironmentVariable("NAMECHEAP_API_USER")
        ApiKey = [Environment]::GetEnvironmentVariable("NAMECHEAP_API_KEY")
        UserName = [Environment]::GetEnvironmentVariable("NAMECHEAP_USERNAME")
        ClientIp = [Environment]::GetEnvironmentVariable("NAMECHEAP_CLIENT_IP")
        Command = "namecheap.domains.dns.setHosts"
        SLD = $sld
        TLD = $tld
        HostName1 = "@"
        RecordType1 = "CNAME"
        Address1 = $Target
        TTL1 = "60"
        HostName2 = "www"
        RecordType2 = "CNAME"
        Address2 = $Target
        TTL2 = "60"
    }

    $pairs = $query.GetEnumerator() | ForEach-Object {
        "{0}={1}" -f [uri]::EscapeDataString($_.Key), [uri]::EscapeDataString([string]$_.Value)
    }
    $uri = "https://api.namecheap.com/xml.response?" + ($pairs -join "&")

    Write-Output "Calling Namecheap API to set hosts for $Domain..."
    $resp = Invoke-WebRequest -Uri $uri -Method Get -UseBasicParsing
    if ($resp.Content -match 'Status="OK"') {
        Write-Output "OK: DNS records submitted via Namecheap API."
    } else {
        Write-Error "API call did not return OK."
        Write-Output $resp.Content
        exit 1
    }
}

switch ($Command) {
    "print" { Show-Records }
    "verify" { Verify-Dns }
    "api" { Set-HostsViaApi }
}


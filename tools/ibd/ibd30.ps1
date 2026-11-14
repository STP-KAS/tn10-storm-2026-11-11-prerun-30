# ibd30.ps1 (pre-run 30 IBD part). TESTNET-10 ONLY. A disposable kaspad (a copy of the existing v2.1.0 binary) in its own data
# directory and its own loopback ports, syncing from scratch. Retry 1 (04:05Z): default --rpcmaxclients and --maxinpeers (see LOCKED). Guard every 30 s: desk free below 150 GB -> stop and delete;
# deadline -> stop and delete. Never touches the main node (pid 3196) or its data directory. Logs to the run dir only.
param([string]$Deadline = '2026-11-14T06:20:00Z')
$ErrorActionPreference = 'Continue'
$R = 'C:\Users\Fermi\tn10-storm-2026-10-30\prerun-30-ibd'; $A = 'C:\kaspa-tn10-ibd-p30'; $EXE = "$A\bin\kaspad.exe"
$NODE = 'node'; $SDK = (Get-Content 'C:\Users\Fermi\tn10-storm-2026-10-30\prerun-30-desk\config.json' -Raw | ConvertFrom-Json).kaspa_sdk
$LOG = "$R\logs\ibd-guard.log"; $PJ = "$R\logs\ibd-progress.jsonl"
function L($m) { Add-Content $LOG ((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' ' + $m) }
function FreeGB { [math]::Round((Get-PSDrive C).Free / 1GB, 1) }
function DirGB { if (Test-Path $A) { [math]::Round(((Get-ChildItem $A -Recurse -File -EA 0 | Measure-Object Length -Sum).Sum) / 1GB, 2) } else { 0 } }
if ($A -eq 'C:\kaspa-tn10-private' -or $A -notlike 'C:\kaspa-tn10-ibd-p30*') { L 'REFUSE wrong appdir'; exit 2 }
New-Item -ItemType Directory "$A\bin", "$R\logs" -Force | Out-Null
Copy-Item 'C:\Users\Fermi\Documents\kaspa\groks-wallet\bin\v2.1.0\kaspad.exe' $EXE -Force
$f0 = FreeGB; L "START free_gb=$f0 floor=150 deadline=$Deadline"
if ($f0 -lt 160) { L "REFUSE free below 160 GB at start"; exit 2 }
$p = Start-Process -FilePath $EXE -ArgumentList @("--appdir=$A\data", '--testnet', '--netsuffix=10', '--disable-upnp', '--listen=127.0.0.1:26211', '--rpclisten=127.0.0.1:26210', '--rpclisten-borsh=127.0.0.1:27210', '--outpeers=8', '--ram-scale=0.5') -WindowStyle Hidden -PassThru -RedirectStandardOutput "$R\logs\kaspad-ibd.out" -RedirectStandardError "$R\logs\kaspad-ibd.err"
$p.Id | Set-Content "$R\logs\ibd.pid"; L "KASPAD_START pid=$($p.Id) (disposable; main node pid 3196 untouched)"
$why = 'deadline'
while ($true) {
  Start-Sleep 30
  $fr = FreeGB; $dg = DirGB
  $j = (& $NODE "$R\ibdprobe.mjs" $SDK 27210 2>$null | Select-Object -Last 1)
  if (-not $j) { $j = '{}' }
  $alive = [bool](Get-Process -Id $p.Id -EA 0)
  $line = $j.TrimEnd('}') + $(if ($j -ne '{}') { ',' } else { '' }) + "`"free_gb`":$fr,`"dir_gb`":$dg,`"alive`":$($alive.ToString().ToLower())}"
  if ($j -eq '{}') { $line = "{`"t`":`"$((Get-Date).ToUniversalTime().ToString('o'))`",`"free_gb`":$fr,`"dir_gb`":$dg,`"alive`":$($alive.ToString().ToLower())}" }
  Add-Content $PJ $line
  if (-not $alive) { $why = 'kaspad-exited'; L "KASPAD exited on its own"; break }
  if ($fr -lt 150) { $why = 'disk-floor'; L "ABORT free_gb=$fr below 150"; break }
  if ((Get-Date).ToUniversalTime() -ge [datetime]::Parse($Deadline).ToUniversalTime()) { break }
  if (Test-Path "$R\control\STOP") { $why = 'stop-file'; break }
}
L "STOPPING why=$why"
$pp = Get-Process -Id $p.Id -EA 0; if ($pp -and $pp.Path -eq $EXE) { Stop-Process -Id $p.Id -Force; Start-Sleep 5 }
New-Item -ItemType Directory "$R\logs\kaspad-log" -Force | Out-Null; Get-ChildItem "$A\data" -Recurse -File -Filter *.log -EA 0 | ForEach-Object { Copy-Item $_.FullName "$R\logs\kaspad-log\" -Force -EA 0 }
$dg = DirGB; L "DATA_DIR_SIZE_GB=$dg before delete"
Remove-Item $A -Recurse -Force -EA 0
L "DELETED appdir exists=$(Test-Path $A) free_gb=$(FreeGB)"
L "END why=$why"

# PowerShell script to download and install Node.js LTS on Windows 10

$nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
$installerPath = "$env:TEMP\nodejs.msi"

Write-Host "Downloading Node.js installer..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

Write-Host "Starting Node.js installer..."
Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait

Write-Host "Node.js installation completed."

# Verify installation
Write-Host "Verifying Node.js installation..."
node -v
npm -v

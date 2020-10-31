Write-Host "Starting Xvfb.."
Start-Job -ScriptBlock {
  /usr/bin/Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 
} -ErrorAction Stop

Write-Host "Started Xvfb.."

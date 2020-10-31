<#
Install dependencies required to build t00ls
#>
Write-Host "Installing 'vsce'"
npm install -g vsce

Write-Host "Installing t00ls dependencies"
npm install

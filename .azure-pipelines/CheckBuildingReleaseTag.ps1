
if (!($env:BUILD_SOURCEBRANCH -match "refs/tags/(.*-?v\d+)")) {
  throw "'${env:BUILD_SOURCEBRANCH}' is not a release tag."
}

Write-Host "Building tag: ${Matches[2]}"

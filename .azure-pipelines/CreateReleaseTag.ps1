
# get the latest tag
[string]$latestTag = (git describe --abbrev=0)
if (!($latestTag -match "(.*-?v.+)-rc")) {
  throw "A release candidate tag has not yet been created."
}

[string]$releaseTag = $Matches[1]

Write-Host "Creating new release tag '${releaseTag}'"
git tag $releaseTag $latestTag

Write-Host "Deleting old release candidate tag"
git tag -d $latestTag

Write-Host "Deleting old release candidate tag from GitHub"
git push origin ":refs/tags/$latestTag"

Write-Host "Publishing new Release Tag to GitHub"
git push --tags

[string]$latestTag = (git describe --abbrev=0)

if (!($latestTag -match "(.*)-?v(.+)-rc")) {
  throw "A release candidate tag has not yet been created."
}

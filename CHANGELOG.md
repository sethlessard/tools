# Change Log

All notable changes to the "t00ls" extension will be documented in this file.

## Unreleased
 - None

## v1.1.5
### Fixed
 - `t00ls: Release` now deletes the prodcution release branch after merging into production.

## v1.1.4
This is the actual release for `v1.1.3`...

## v1.1.3
### Changed
 - `t00ls: Clear Production Release Branch/Feature Branch Relationship` now shows all relationships in the repository, allowing for the deletion of stranded relationships.

## v1.1.2
### Added
 - Added support for the `main` branch. t00ls will recognized either `main` or `master` as the main repository branch.

### Fixed
 - Resolved an issue with `t00ls: Sync Repo` where branch relationships weren't being saved.
 - Resolved an issue with `t00ls: Sync Repo` where production release branches were being treated as feature branches.

## v1.1.1
### Fixed
 - Fixed an issue where `t00ls: New Feature Branch` wasn't storing the production release branch/feature branch relationship. 

## v1.1.0
### Added
 - Added safety checks to `t00ls: Delete Production Release Branch`. A warning will now be thrown when trying to delete a production release branch that contains code that has not been merged into `master`.
 - Added safety checks to `t00ls: Delete Feature Branch`.  A warning will now be thrown when trying to delete a feature branch that contains code that has not been merged into `master` or a production release branch.
 - Added the ability to specify which remote to use when running `t00ls: Sync Repo` with mutiple remotes set up.
 - Added a prompt to `t00ls: New feature Branch`, `t00ls: New Production Release Branch`, `t00ls: Merge Features into Production Release`, `t00ls: Sync Repo` and `t00ls: Release` that warns about working changes in the Git directory. Also added the option to stash the working changes.
 - Added a `local-only` mode to t00ls that tells Git to work in a local only mode. No remotes are updated when `local-only` mode is active.
 - Added a status bar item that displays the current t00ls "mode".
 - Added TypeScript templates.

### Fixed
 - Issue with `t00ls: Delete Tag` taking forever if deleting more than one tag.
 - Issue with clearing branch relationships when feature branches or production release branches are deleted via the t00ls commands.

## v1.0.1
### Added
 - New `t00ls: Clear Production Release Branch/Feature Branch Relationship` command to clear the relationships created by `t00ls: Sync Repo`. See the `Changed` section below.

### Changed
 - `t00ls: Sync Repo` now saves the production release branch & feature branch relationship.

## v1.0.0

- Initial release


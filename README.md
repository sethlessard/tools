# t00ls

- [t00ls](#t00ls)
  - [Building from Source](#building-from-source)
    - [Cloning the Repo](#cloning-the-repo)
    - [Building](#building)
    - [Packaging](#packaging)
  - [Commands](#commands)
    - [Git Commands](#git-commands)
      - [t00ls: Delete Feature Branch](#t00ls-delete-feature-branch)
      - [t00ls: Delete Production Release Branch](#t00ls-delete-production-release-branch)
      - [t00ls: Delete Tag](#t00ls-delete-tag)
      - [t00ls: Merge Features into Production Release](#t00ls-merge-features-into-production-release)
      - [t00ls: New Feature Branch](#t00ls-new-feature-branch)
      - [t00ls: New Production Release Branch](#t00ls-new-production-release-branch)
      - [t00ls: Release](#t00ls-release)
      - [t00ls: Sync Repo](#t00ls-sync-repo)
    - [Project Commands](#project-commands)
      - [t00ls: New Project](#t00ls-new-project)

## Building from Source

### Cloning the Repo

```bash
git clone https://github.com/sethlessard/tools
cd tools/
```

### Building

```bash
npm install
npm run compile
```

### Packaging

```bash
npm install
npm run package
```

## Commands

### Git Commands

#### t00ls: Delete Feature Branch

Description: Delete a feature branch from the local & remote repositories.

#### t00ls: Delete Production Release Branch

Description: Delete a production release branch from the local & remote repositories.

#### t00ls: Delete Tag

Description: Delete a tag from the local & remote repositories.

#### t00ls: Merge Features into Production Release

Description: Merge one or more feature branches into a production release branch.

#### t00ls: New Feature Branch

Description: Create a new feature branch.

#### t00ls: New Production Release Branch

Description: Create a new production release branch.

#### t00ls: Release

Description: Complete a production release branch and merge into master.

#### t00ls: Sync Repo

Description: Syncronize the Git repository.

### Project Commands

#### t00ls: New Project

Description: Create a new project.

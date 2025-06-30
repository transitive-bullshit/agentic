<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/cli"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/cli.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/cli <!-- omit from toc -->

> CLI for the Agentic platform.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so/publishing)

## Install

```bash
npm i -g @agentic/cli
```

## Usage

```sh
Usage: agentic [options] [command]

Options:
  -j, --json                                Print output as JSON
  -V, --version                             output the version number
  -h, --help                                display help for command

Commands:
  login|signin [options]                    Signs in to Agentic. If no credentials are provided, uses GitHub auth.
  signup [options]                          Creates a new account for Agentic. If no credentials are provided, uses
                                            GitHub auth.
  whoami                                    Displays info about the current user.
  logout|signout                            Signs the current user out.
  deploy [options]                          Creates a new deployment.
  publish [options] [deploymentIdentifier]  Publishes a deployment. Defaults to the most recent deployment for the
                                            project in the target directory. If a deployment identifier is provided, it
                                            will be used instead.
  get <deploymentIdentifier>                Gets details for a specific deployment.
  list|ls [options] [identifier]            Lists deployments.
  debug [options]                           Prints config for a local project.
  help [command]                            display help for command
```

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)

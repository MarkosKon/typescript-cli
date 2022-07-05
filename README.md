# TypeScript CLI

Boilerplate to spin up a TypeScript CLI.

## Test `npm link` inside Docker container

- Install global dependencies in user directory: `docker compose -f docker-compose.yml exec node npm config set prefix '~/.local/'`.
- NPM link: `docker compose -f docker-compose.yml exec node npm link`.
- Run the CLI: `docker compose -f docker-compose.yml exec -e PATH="/home/node/.local/bin:${PATH}" node typescript-cli --help`.
- Uninstall: `docker compose -f docker-compose.yml exec node npm r -g typescript-cli`.

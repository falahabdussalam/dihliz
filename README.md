# Dihliz Next.js

## Docker deployment

The multi-stage `Dockerfile` uses Node.js 24 on Alpine, builds the Next.js
standalone server, and runs it as the unprivileged `node` user. `entrypoint.sh`
runs `prisma migrate deploy` with the PostgreSQL migrations configured in
`prisma.config.ts` before starting the server. A migration failure stops startup.
Credentials are supplied at runtime; local environment files are excluded from
the image.

### Publish to GitHub Container Registry

Push these files to the `release` branch. The workflow in
`.github/workflows/publish-image.yml` builds for Linux amd64 and arm64 and
publishes:

- `ghcr.io/fathah/dihliz-web-next:latest`
- `ghcr.io/fathah/dihliz-web-next:sha-<full-commit-sha>`

The workflow uses GitHub's automatic `GITHUB_TOKEN` with `packages: write`;
no separate publishing token is needed. Ensure GitHub Actions is enabled for
the repository. The image name follows the repository if it is renamed or forked.

### Start on the server

Install Docker Engine with Docker Compose v2 or newer. After the first successful
image publish, copy `compose.yaml` and `.env.docker.example` to a directory on
the server. The following downloads them from the `release` branch:

```sh
mkdir -p ~/dihliz
cd ~/dihliz
curl -fsSL https://raw.githubusercontent.com/fathah/dihliz-web-next/release/compose.yaml -o compose.yaml
curl -fsSL https://raw.githubusercontent.com/fathah/dihliz-web-next/release/.env.docker.example -o .env
chmod 600 .env
openssl rand -hex 32
```

Edit `.env` and replace `POSTGRES_PASSWORD` with the generated hex password.
Hex avoids URL escaping when Compose constructs the database connection URLs.
For a private repository, transfer the two files from your checkout instead of
using the download commands.

If the GHCR package is private, log in with your GitHub username and a personal
access token (classic) with `read:packages` access:

```sh
docker login ghcr.io -u fathah
```

Paste the token at the password prompt. Alternatively, make the GHCR package
public for anonymous image pulls.

```sh
docker compose config --quiet
docker compose up -d --wait
docker compose logs -f web
```

Compose pulls the web image, starts PostgreSQL, waits for PostgreSQL to become
healthy, and then starts the web container. The app listens on server port 3000
(change `WEB_PORT` in `.env`). PostgreSQL is reachable within the Compose
network and persists data in the `postgres_data` volume.

Serve the app through an HTTPS reverse proxy for production sign-in, since the
app sets secure session cookies in production. For an empty installation,
initialize the administrator and reference data with the existing
`npm run db:seed` script from a source checkout connected to this database.

### Update after a release push

After GitHub Actions publishes the new image, run these commands in the server's
Compose directory:

```sh
docker compose pull web
docker compose up -d --wait
```

Each web container startup applies pending migrations. Publishing a new image
requires these server commands to deploy it. Set `WEB_IMAGE` to a `sha-...` tag
in `.env` to select a particular image version. Image rollback does not undo
database migrations. Keep the PostgreSQL volume when updating; `docker compose
down -v` deletes its data. PostgreSQL credentials in `.env` must match the
credentials used to initialize an existing volume.

### Build locally

```sh
docker build -t dihliz-web-next:local .
WEB_IMAGE=dihliz-web-next:local docker compose --env-file .env.docker up -d --pull never --wait
```

For the local commands, copy `.env.docker.example` to `.env.docker` and set its
password first. The `--pull never` override uses the locally built image.

## Original starter

This example shows how to use [Tailwind CSS](https://tailwindcss.com/) [(v3.2)](https://tailwindcss.com/blog/tailwindcss-v3-2) with Next.js. It follows the steps outlined in the official [Tailwind docs](https://tailwindcss.com/docs/guides/nextjs).

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) or preview live with [StackBlitz](https://stackblitz.com/github/vercel/next.js/tree/canary/examples/with-tailwindcss)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss&project-name=with-tailwindcss&repository-name=with-tailwindcss)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example with-tailwindcss with-tailwindcss-app
```

```bash
yarn create next-app --example with-tailwindcss with-tailwindcss-app
```

```bash
pnpm create next-app --example with-tailwindcss with-tailwindcss-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

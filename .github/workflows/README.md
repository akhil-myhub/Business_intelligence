# CI / CD

`ci-cd.yml` runs three jobs:

| Job | When | What |
| --- | --- | --- |
| `verify` | every push + PR to `main`/`master` | `npm ci` → lint → unit tests → production build |
| `docker-build` | after `verify` | builds the Docker image (no push) to catch image-level breakage |
| `deploy` | pushes to `main` only | SSH to the server, pull `main`, rebuild + recreate the container, wait for `/api/health` |

## Required repository secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Example | Notes |
| --- | --- | --- |
| `DEPLOY_HOST` | `164.52.194.4` | server IP or hostname |
| `DEPLOY_USER` | `root` | SSH user |
| `DEPLOY_SSH_KEY` | *(private key)* | PEM private key; its public half goes in the server's `~/.ssh/authorized_keys` |
| `DEPLOY_PATH` | `~/bi-aavtor` | repo root on the server (the folder that contains `frontend/`) |
| `DEPLOY_SSH_PORT` | `22` | optional, defaults to 22 |

## One-time SSH key setup

On a machine with access, generate a deploy key and install the public half on the server:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
ssh-copy-id -i deploy_key.pub root@164.52.194.4      # or append deploy_key.pub to the server's authorized_keys
```

Paste the **private** key (`deploy_key`, the whole file including the BEGIN/END lines) into the `DEPLOY_SSH_KEY` secret. Keep the private key off the repo.

## Secrets and `.env`

The app's runtime secrets (`SESSION_SECRET`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`) live **only** in `frontend/.env` on the server and are never committed. The deploy job does not touch `.env`, so your server credentials survive every deploy. To change them, edit `.env` on the server and run `docker compose up -d --force-recreate`.

## First deploy via Actions

1. Add the secrets above.
2. Create a `production` environment (Settings → Environments) if you want approval gates — optional.
3. Push to `main`. The `deploy` job SSHes in, pulls, rebuilds, and verifies the health check.

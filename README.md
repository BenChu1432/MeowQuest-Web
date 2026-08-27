# MeowQuest Web

The page at the end of a verification email. Someone registers on the phone, gets
an email, taps the link, and lands here; this app calls the MeowQuest API, marks
the address verified, and offers a button back into the app.

Small on purpose. It is also the first thing a new user ever sees, and it is seen
exactly once — so it has to work on the first try, on a stranger's phone, in
whatever browser their mail client decides to use.

## How it fits together

```
phone (register) ──> API ──> Gmail ──> inbox
                                        │  tap link
                                        ▼
                            this app  /verify?token=…
                                        │  server-side
                                        ▼
                                       API  /v1/auth/verify-email
```

The browser never talks to the API. It calls this app's own `/api/verify` and
`/api/resend`, which forward the request from the server. Two reasons: the API's
origin stays private, and there is no CORS to get wrong on the one page that has
no second chance.

That indirection is also the main deployment constraint — **this app's server must
be able to reach the API**. A localhost `API_URL` deploys a site that renders
perfectly and fails every verification with a 503.

## Local development

```bash
npm install

npm run dev        # DEV  → http://localhost:3000 (your machine's backend)
npm run dev:uat    # UAT  → https://sihm6r0gsc.execute-api.ap-southeast-1.amazonaws.com
npm run dev:prod   # PROD → https://api.meowquest.app
```

`npm run dev*` copies `env/<env>.env` → `.env.local` and starts Next.js on
`http://localhost:3001`, so `API_URL` is always the one for the environment you
asked for.

| Variable                 | Read by                    | Notes                                                          |
| ------------------------ | -------------------------- | -------------------------------------------------------------- |
| `API_URL`                | server, at request time    | Base URL of the MeowQuest API. Chosen per environment — below. |
| `NEXT_PUBLIC_APP_SCHEME` | browser, baked in at build | Deep link back into the app. Must match `frontend/app.json`.   |

### Environments (DEV / UAT / PROD)

| Environment | Backend (`API_URL`)                                           | How it runs           |
| ----------- | ------------------------------------------------------------- | --------------------- |
| DEV         | `http://localhost:3000`                                       | `npm run dev` (local) |
| UAT         | `https://sihm6r0gsc.execute-api.ap-southeast-1.amazonaws.com` | Amplify `uat` branch  |
| PROD        | `https://api.meowquest.app`                                   | Amplify `main` branch |

## Deploying

Infrastructure is Terraform in [`infra/`](infra), hosting is AWS Amplify. One
`apply` creates the app, connects this repo, and turns on a branch per deployed
environment (`uat` and `main`).

```bash
brew install terraform          # not installed by default

cd infra
cp terraform.tfvars.example terraform.tfvars   # override api_url if needed
export TF_VAR_github_access_token=ghp_…        # classic PAT: repo + admin:repo_hook

terraform init
terraform plan
terraform apply
```

`terraform output next_steps` prints the two things that are easy to forget.

### What gets created

| Resource                         | Why                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `aws_amplify_app`                | `platform = "WEB_COMPUTE"` — this is SSR, not a static export. Deploying it as `WEB` builds fine and then 404s every route. |
| `aws_iam_role` + policy          | Amplify requires a service role for SSR compute. Scoped to this app's log groups only.                                      |
| `aws_amplify_branch`             | One per environment (`uat`, `main`), each with its own `API_URL`. Auto-build on push.                                     |
| `aws_amplify_domain_association` | Only if `custom_domain` is set.                                                                                             |

The build itself is [`amplify.yml`](amplify.yml), not Terraform: Amplify prefers
an in-repo build spec, so a broken build is fixed with a commit rather than an
`apply`.

### The two settings that will bite you

**1. The backend must know this site's URL.** The verification link is composed by
the _backend_, from its own `WEB_URL`. Deploying this app does not change what the
emails say. After the first apply, set each environment's `WEB_URL` in
`backend/env.json` to the matching URL from `terraform output branch_urls`:

```bash
# backend/env.json — uat and production blocks
"WEB_URL": "https://uat.d1234abcd.amplifyapp.com"
```

**2. The API must be publicly reachable.** Amplify's compute runs in AWS and
cannot see your laptop. Until each backend is deployed somewhere with a public
address, verification links will open the page and fail at the last step. The UAT
backend already deploys to Lambda; for local DEV, a tunnel (`ngrok http 3000`) is
enough to prove the flow end to end before committing to backend hosting.

### Environment variables at runtime

Amplify hands environment variables to the _build_. A Next.js SSR app reads
`API_URL` at _request_ time, in a different process, so `amplify.yml` copies them
into `.env.production` during the build. Without that line the site builds green
and throws `API_URL is not set` on the first real link — a failure that only
appears in production, which is the worst place to discover it.

`API_URL` (and its companion `APP_ENV`) are set per branch, so `uat` and `main`
each forward their own backend into the runtime.

### Custom domain

Set `custom_domain` (and optionally `subdomain_prefix`) in `terraform.tfvars`,
apply, then publish the records from `terraform output domain_dns_records`. The
association sits in `PENDING_VERIFICATION` until those records resolve — a
successful `apply` is not the same as a working domain.

### Rollback

Amplify keeps previous builds. Redeploy an earlier one from the console, or
`git revert` and push; both are faster than a `terraform apply`, because the
infrastructure is not what broke.

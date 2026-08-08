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
cp .env.example .env      # then edit API_URL if the backend isn't on :3000
npm install
npm run dev               # http://localhost:3001
```

| Variable                 | Read by                    | Notes                                                        |
| ------------------------ | -------------------------- | ------------------------------------------------------------ |
| `API_URL`                | server, at request time    | Base URL of the MeowQuest API. No trailing slash needed.     |
| `NEXT_PUBLIC_APP_SCHEME` | browser, baked in at build | Deep link back into the app. Must match `frontend/app.json`. |

## Deploying

Infrastructure is Terraform in [`infra/`](infra), hosting is AWS Amplify. One
`apply` creates the app, connects this repo, and turns on builds from `main`.

```bash
brew install terraform          # not installed by default

cd infra
cp terraform.tfvars.example terraform.tfvars   # set api_url
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
| `aws_amplify_branch`             | Tracks `main`, `framework = "Next.js - SSR"`, auto-build on push.                                                           |
| `aws_amplify_domain_association` | Only if `custom_domain` is set.                                                                                             |

The build itself is [`amplify.yml`](amplify.yml), not Terraform: Amplify prefers
an in-repo build spec, so a broken build is fixed with a commit rather than an
`apply`.

### The two settings that will bite you

**1. The backend must know this site's URL.** The verification link is composed by
the _backend_, from its own `WEB_APP_URL`. Deploying this app does not change what
the emails say. After the first apply:

```bash
# backend/.env
WEB_APP_URL=https://main.d1234abcd.amplifyapp.com
```

**2. The API must be publicly reachable.** Amplify's compute runs in AWS and
cannot see your laptop. Until the backend is deployed somewhere with a public
address, verification links will open the page and fail at the last step. A tunnel
(`ngrok http 3000`) is enough to prove the flow end to end before committing to
backend hosting.

### Environment variables at runtime

Amplify hands environment variables to the _build_. A Next.js SSR app reads
`API_URL` at _request_ time, in a different process, so `amplify.yml` copies them
into `.env.production` during the build. Without that line the site builds green
and throws `API_URL is not set` on the first real link — a failure that only
appears in production, which is the worst place to discover it.

### Custom domain

Set `custom_domain` (and optionally `subdomain_prefix`) in `terraform.tfvars`,
apply, then publish the records from `terraform output domain_dns_records`. The
association sits in `PENDING_VERIFICATION` until those records resolve — a
successful `apply` is not the same as a working domain.

### Rollback

Amplify keeps previous builds. Redeploy an earlier one from the console, or
`git revert` and push; both are faster than a `terraform apply`, because the
infrastructure is not what broke.

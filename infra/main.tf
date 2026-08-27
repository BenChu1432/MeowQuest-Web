#
# MeowQuest web — AWS Amplify Hosting.
#
# One Next.js SSR app serving the email-verification page. It is small, but it is
# the first thing a new user ever sees, so it is deployed rather than improvised:
# push to main, Amplify builds, the link in the email works.
#

# ---------------------------------------------------------------------------
# Compute role
# ---------------------------------------------------------------------------

# WEB_COMPUTE apps run server code, and server code that cannot write logs is
# server code you cannot debug. Amplify refuses to create an SSR app without a
# service role, so this is required rather than optional hygiene.
data "aws_iam_policy_document" "amplify_assume_role" {
    statement {
        actions = ["sts:AssumeRole"]

        principals {
            type        = "Service"
            identifiers = ["amplify.amazonaws.com"]
        }
    }
}

resource "aws_iam_role" "amplify" {
    name               = "${var.app_name}-amplify-service-role"
    assume_role_policy = data.aws_iam_policy_document.amplify_assume_role.json
}

# Scoped to this app's own log groups. The AWS-managed Amplify policies grant far
# more than a hosting app needs; a page that proxies two endpoints has no business
# holding deploy-wide permissions.
data "aws_iam_policy_document" "amplify_logs" {
    statement {
        actions = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "logs:DescribeLogGroups",
        ]
        resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/amplify/*"]
    }
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "amplify_logs" {
    name   = "${var.app_name}-logs"
    role   = aws_iam_role.amplify.id
    policy = data.aws_iam_policy_document.amplify_logs.json
}

# ---------------------------------------------------------------------------
# The app
# ---------------------------------------------------------------------------

resource "aws_amplify_app" "web" {
    name       = var.app_name
    repository = var.repository_url

    # The token is used once to clone and to install the push webhook. Amplify
    # keeps its own copy, which is why `repository` and this argument both show
    # up as permanent diffs if the token is rotated — see the lifecycle block.
    access_token = var.github_access_token

    # WEB_COMPUTE, not WEB. The App Router pages here are server-rendered and
    # /api/verify runs on the server; deploying this as a static site would
    # produce a build that succeeds and a site that 404s on every route.
    platform             = "WEB_COMPUTE"
    iam_service_role_arn = aws_iam_role.amplify.arn

    # Available to the build, and forwarded into .env.production by amplify.yml
    # so the SSR runtime can read them too. Only what is shared across
    # environments lives here — API_URL and APP_ENV differ per environment and
    # are set on each branch (aws_amplify_branch.env).
    environment_variables = {
        NEXT_PUBLIC_APP_SCHEME = var.app_scheme

        # Amplify's Next.js image loader is off by default on WEB_COMPUTE and
        # this app ships no <Image>; stated explicitly so nobody wonders.
        _CUSTOM_IMAGE = "amplify:al2023"
    }

    # A verification link is opened once, from an email client, on a phone. Every
    # one of these headers is cheap insurance on a page that handles a token.
    custom_headers = <<-EOT
        customHeaders:
          - pattern: '**'
            headers:
              - key: 'Strict-Transport-Security'
                value: 'max-age=31536000; includeSubDomains'
              - key: 'X-Content-Type-Options'
                value: 'nosniff'
              - key: 'X-Frame-Options'
                value: 'DENY'
              - key: 'Referrer-Policy'
                value: 'strict-origin-when-cross-origin'
    EOT

    lifecycle {
        # Amplify rewrites the stored token, so Terraform would otherwise offer
        # to "fix" it on every plan. Rotating the token is a console action.
        ignore_changes = [access_token]
    }
}

# ---------------------------------------------------------------------------
# Branches (DEV / UAT / PROD)
# ---------------------------------------------------------------------------

# One branch per environment. The API_URL that selects the backend is set here,
# not on the app, so `uat` talks to the UAT backend and `main` talks to
# production. Branch-level environment variables override the app-level ones
# with the same name.
resource "aws_amplify_branch" "env" {
    for_each = var.environments

    app_id      = aws_amplify_app.web.id
    branch_name = each.value.branch_name

    framework = "Next.js - SSR"
    stage     = each.value.stage

    # Push to the branch, get a deploy. That is the whole point of the exercise.
    enable_auto_build = each.value.auto_build

    environment_variables = {
        API_URL = each.value.api_url
        APP_ENV = each.key
    }
}

# ---------------------------------------------------------------------------
# Custom domain (optional)
# ---------------------------------------------------------------------------

# Created only when a domain is supplied. It will sit in PENDING_VERIFICATION
# until the CNAME records from the `domain_dns_records` output exist in DNS —
# Terraform cannot finish this handshake for you unless the zone is also managed
# here, so `apply` returning is not the same as the domain working.
resource "aws_amplify_domain_association" "web" {
    count = var.custom_domain == "" ? 0 : 1

    app_id      = aws_amplify_app.web.id
    domain_name = var.custom_domain

    # Amplify manages the certificate itself; there is no ACM resource to wire up.
    wait_for_verification = false

    sub_domain {
        branch_name = aws_amplify_branch.env["production"].branch_name
        prefix      = var.subdomain_prefix
    }
}

variable "aws_region" {
    description = "Region for the Amplify app. ap-east-1 (Hong Kong) keeps latency low for the primary audience; Amplify Hosting serves through CloudFront regardless, so this mostly decides where the SSR compute and its logs live."
    type        = string
    default     = "ap-east-1"
}

variable "app_name" {
    description = "Name of the Amplify app as it appears in the console."
    type        = string
    default     = "meowquest-web"
}

variable "repository_url" {
    description = "HTTPS URL of the GitHub repository Amplify builds from."
    type        = string
    default     = "https://github.com/BenChu1432/MeowQuest-Web"
}

variable "environments" {
    description = <<-EOT
        Deployment environments, keyed by name (development / uat / production).
        Each maps an Amplify branch to the backend it should talk to.

        Only uat and production deploy on Amplify; development runs locally via
        `npm run dev` (web/.env), so its entry here documents the mapping rather
        than being applied. The production entry's branch is the one the custom
        domain and outputs point at.
    EOT
    type = map(object({
        branch_name = string
        stage       = string
        api_url     = string
        auto_build  = optional(bool, true)
    }))
    default = {
        development = {
            branch_name = "develop"
            stage       = "DEVELOPMENT"
            api_url     = "http://localhost:3000"
            auto_build  = false
        }
        uat = {
            branch_name = "uat"
            stage       = "BETA"
            api_url     = "https://sihm6r0gsc.execute-api.ap-southeast-1.amazonaws.com"
            auto_build  = true
        }
        production = {
            branch_name = "main"
            stage       = "PRODUCTION"
            api_url     = "https://api.meowquest.app"
            auto_build  = true
        }
    }

    validation {
        condition = alltrue([
            for env, cfg in var.environments :
            contains(["PRODUCTION", "BETA", "DEVELOPMENT", "EXPERIMENTAL", "PULL_REQUEST"], cfg.stage)
        ])
        error_message = "Each environment's stage must be one of PRODUCTION, BETA, DEVELOPMENT, EXPERIMENTAL, PULL_REQUEST."
    }
}

variable "github_access_token" {
    description = <<-EOT
        GitHub personal access token Amplify uses to clone the repo and install a
        webhook. Classic token with `repo` and `admin:repo_hook` scopes.

        Never put this in a .tf file. Export it instead:
            export TF_VAR_github_access_token=ghp_...

        Terraform stores it in state, so treat the state file as a secret — one
        more reason to move it to an encrypted S3 backend before this grows up.
    EOT
    type        = string
    sensitive   = true
}

variable "app_scheme" {
    description = "Deep-link scheme back into the mobile app, baked into the page at build time. Must match the scheme in frontend/app.json."
    type        = string
    default     = "meowquest://"
}

variable "custom_domain" {
    description = "Optional custom domain, e.g. meowquest.app. Leave empty to use the amplifyapp.com URL. Setting this creates a domain association that stays PENDING_VERIFICATION until the DNS records in the output are published."
    type        = string
    default     = ""
}

variable "subdomain_prefix" {
    description = "Subdomain to serve from when custom_domain is set. Empty string means the apex domain."
    type        = string
    default     = "verify"
}

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

variable "branch_name" {
    description = "Branch Amplify tracks for the production deployment."
    type        = string
    default     = "main"
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

variable "api_url" {
    description = "Public base URL of the MeowQuest API, e.g. https://api.meowquest.app. Read server-side by the /api/* proxy routes. A localhost value here deploys a site that renders and then fails every verification, because Amplify's compute cannot reach your laptop."
    type        = string
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

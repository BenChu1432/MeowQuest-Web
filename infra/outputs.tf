output "app_id" {
    description = "Amplify app ID, for the console and the CLI."
    value       = aws_amplify_app.web.id
}

output "branch_urls" {
    description = "The URL Amplify serves each environment's branch from, keyed by environment name. These are the values the backend's WEB_URL must be set to per environment, or the links in that environment's emails point at the wrong origin."
    value = {
        for env, branch in aws_amplify_branch.env :
        env => "https://${branch.branch_name}.${aws_amplify_app.web.default_domain}"
    }
}

output "production_url" {
    description = "The URL Amplify serves the production (main) branch from. This is the value the backend's production WEB_URL must be set to."
    value       = "https://${aws_amplify_branch.env["production"].branch_name}.${aws_amplify_app.web.default_domain}"
}

output "custom_domain_url" {
    description = "The custom domain URL, if one was configured."
    value       = var.custom_domain == "" ? null : "https://${var.subdomain_prefix == "" ? "" : "${var.subdomain_prefix}."}${var.custom_domain}"
}

output "domain_dns_records" {
    description = "DNS records to publish before the custom domain will verify. Empty when no custom domain is set."
    value       = var.custom_domain == "" ? [] : aws_amplify_domain_association.web[0].sub_domain
}

output "next_steps" {
    description = "The two settings that are easy to forget and produce a site that looks fine and verifies nothing."
    value       = <<-EOT

        1. Point each backend environment at its site:
             uat        WEB_URL=https://${aws_amplify_branch.env["uat"].branch_name}.${aws_amplify_app.web.default_domain}
             production WEB_URL=https://${aws_amplify_branch.env["production"].branch_name}.${aws_amplify_app.web.default_domain}
           The verification link is built by the backend, so until these change,
           each environment's emails still point at the wrong origin.

        2. Confirm each API_URL is reachable from AWS:
             uat        ${var.environments["uat"].api_url}
             production ${var.environments["production"].api_url}
           Amplify's compute runs in the cloud; a localhost or private address
           here renders the page fine and fails every verification with 503.
    EOT
}

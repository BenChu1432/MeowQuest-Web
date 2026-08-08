output "app_id" {
    description = "Amplify app ID, for the console and the CLI."
    value       = aws_amplify_app.web.id
}

output "default_url" {
    description = "The URL Amplify serves the branch from. This is the value the backend's WEB_APP_URL must be set to, or the links in the emails will still point at localhost."
    value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.web.default_domain}"
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

        1. Point the backend at this site:
             WEB_APP_URL=${"https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.web.default_domain}"}
           The verification link is built by the backend, so until this changes,
           every email still says http://localhost:3001.

        2. Confirm API_URL (currently "${var.api_url}") is reachable from AWS.
           Amplify's compute runs in the cloud; a localhost or private address
           here renders the page fine and fails every verification with 503.
    EOT
}

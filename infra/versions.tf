terraform {
    required_version = ">= 1.6"

    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
    }

    # State lives on this laptop for now, which is fine for one operator and a
    # disaster for two: whoever applies second would be working from a state
    # file that has never heard of the first person's resources. Before anyone
    # else touches this, move it to S3 with locking.
    #
    # backend "s3" {
    #   bucket       = "meowquest-tfstate"
    #   key          = "web/terraform.tfstate"
    #   region       = "ap-east-1"
    #   encrypt      = true
    #   use_lockfile = true
    # }
}

provider "aws" {
    region = var.aws_region

    default_tags {
        tags = {
            Project   = "MeowQuest"
            Component = "web"
            ManagedBy = "terraform"
        }
    }
}

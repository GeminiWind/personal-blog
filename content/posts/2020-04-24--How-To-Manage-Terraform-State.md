---
title: "Terraform: How To Manage Terraform State"
date: "2020-04-24T22:40:32.169Z"
template: "post"
draft: false
slug: "/how-to-manage-terraform-state"
category: "AWS"
tags:
  - "Terraform"
  - "Devops"
  - "Infrastructure as code (IaC)"
description: "Learn to store your Terraform state in the right way to secure and ease to collaborate with others"
---

Learn to store your Terraform state in the right way to secure and ease to collaborate with other

## What is Terraform State

If you 've worked with Terraform, you know that Terraform only update the resource if it have a change. However, do you know the mechanism Terraform used to apply the update action. There 's no more complicated mechanism in here. Let dive with me to get it.

When you follow the flow: `terraform plan` and `terraform apply` to deploy  your change in the Terraform folder, there is a file `terraform.tfstate`, which will be created or updated if it exists at root folder with Terraform. This file is formatted as JSON, and contains managed infrastructure and configuration. For example, take simple EC2 in Terraform

```h
// File: deploy/main.tf
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

After running `terraform apply`, the `terraform.tfstate` file will look something like this

```json
{
  "version": 4,
  "terraform_version": "0.12.0",
  "serial": 1,
  "lineage": "1f2087f9-4b3c-1b66-65db-8b78faafc6fb",
  "outputs": {},
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "example",
      "provider": "provider.aws",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "ami": "ami-0c55b159cbfafe1f0",
            "availability_zone": "us-east-2c",
            "id": "i-00d689a0acc43af0f",
            "instance_state": "running",
            "instance_type": "t2.micro",
            "(...)": "(truncated)"
          }
        }
      ]
    }
  ]
}
```

By manipulating `terraform.tfstate` file, Terraform know the information about your EC2 resource `example` like
- id: _i-00d689a0acc43af0f_
- ami: _i-00d689a0acc43af0f_

Everytime you run your Terraform, Terraform will query the information of your EC2 Instance form AWS and compare it to your Terraform configuration to determine what changes need to be applied. That 's the way you can see the information of destroyed or created resources when you run Terraform.

By default, your `terraform.tfstate` is stored in your local machine. It's fine with personal project but if you are in team working on with business product, the story is so far different with the following problems
- Shared `terraform.tfstate` file: there must be shared storage to store `terraform.tfstate`  in which other members is grant privillege to access `terraform.tfstate` for Terraform can use it to update the infrastructure.
- Lock `terraform.tfstate`: image the case in that two members in your team running Terraform at the same time, it lead to "race condition", leading to conflict and corrupted state file.
- Isolate `terraform.tfstate`: how to manage Terraform state file for each different environment.

In this article, I will analyse each problem, then provide the best solution for them

## Shared storage for state files & Locking

There are 2 common ways to combat these problems:
- use version control (Git)
- use remote backend

|                 | Version Control  | Remote Backend |
|------------------|-----------------| ---------------|
| Manual error | forget to pull/push the latest Terraform state file | automatically load the latest Terraform state file from configured backend |
Locking | No locking mechanism is supported | most of remote backend natively support locking. For e.g : locking with dynamodb table in aws
Security | No encryption was applied. Terraform state file is store in plain text format => vulnerable, easy to leak sensitive information | Most of the backends natively support encryption both in-transit and at-rest. For e.g: AWS S3 provides encryption with client-side encryption, S3 server-side encryption ..

From above comparing, it 's obvious that the best way to manage shared storage for state files is to use Terraform’s built-in support for remote backends. Remote backends allow you to store the state file in a remote, shared store. A number of remote backends are supported, including Amazon S3, Azure Storage, Google Cloud Storage, and HashiCorp’s Terraform Pro and Terraform Enterprise.

In the following, we will configured S3 remote backend.

First, create S3 bucket. This bucket is used to to store your `terraform.tfstate`

```h
resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-up-and-running-state"
  # Enable versioning so we can see the full revision history of our
  # state files
  versioning {
    enabled = true
  }
  # Enable server-side encryption by default
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

Next, you need to create a DynamoDB table to use for locking. Your DynamoDB table must has a primary key called `LockID` (with this exact spelling and capitalization!)

```h
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-up-and-running-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

Then, run `terraform plan` and `terraform apply` to create your S3 bucket and DynamoDB table. It still creates `terraform.tfstate` locally, but don't worry we are good to go next

Our important thing is here. We 'll configure for your Terraform use above remote backend

The general syntax for remote backend is
```
terraform {
  backend "<BACKEND_NAME>" {
    [CONFIG...]
  }
}
```
Where **BACKEND_NAME** is the name of the backend you want to use (e.g., "s3") and **CONFIG** consists consists of one or more arguments that are specific to that backend (e.g., the name of the S3 bucket to use)

Here’s what the backend configuration looks like for an S3 backend:

```h
// File: backend.tf
terraform {
  backend "s3" {
    # Replace this with your bucket name!
    bucket         = "terraform-up-and-running-state"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-2"
    # Replace this with your DynamoDB table name!
    dynamodb_table = "terraform-up-and-running-locks"
    encrypt        = true
  }
}
```

Let’s go through these settings one at a time:
1. bucket: The name of the S3 bucket to use. Make sure to replace this with the name of the S3 bucket you created earlier.
2. key: The file path within the S3 bucket where the Terraform state file should be written. You’ll see a little later on why the example code above sets this to global/s3/terraform.tfstate.
3. region: The AWS region where the S3 bucket lives. Make sure to replace this with the region of the S3 bucket you created earlier.
4. dynamodb_table: The DynamoDB table to use for locking. Make sure to replace this with the name of the DynamoDB table you created earlier.
5. encrypt: Setting this to true ensures your Terraform state will be encrypted on disk when stored in S3. We already enabled default encryption in the S3 bucket itself, so this is here as a second layer to ensure that the data is always encrypted.

After configuring S3 remote backend, you need to run `terraform init` again to tell Terraform configure remote backend. Tt will prompt you to sync `terraform.tfstate` to s3 because you already has it on your local machine

From now, every you update your resource by running `terraform apply`, it will automatically pull the latest `terraform.tfstate` from S3 bucket then do compare and show you the change will be deployed. 


## Isolating state file

Isolating state file, means that trying to ensure that make change in one environment from state file don 't break any infrastructure in other environment.

There are 2 ways you could isolate state files:
1. **Isolation via workspaces**: useful for quick, isolated tests on the same configuration.
2. **Isolation via file layout**: useful for production use-cases where you need strong separation between environments.

Let’s dive into each of these

### Isolation via workspaces

[Terraform workspaces](https://www.terraform.io/docs/state/workspaces.html) allow you to store your Terraform state in multiple, separate, named workspaces. Terraform starts with a single workspace called “default” and if you never explicitly specify a workspace, then the default workspace is the one you’ll use the entire time.

To create a new workspace or switch between workspaces, you use the terraform workspace commands.

- Create new workspace: terraform workspace new <workspace_name>
- List workspaces: terraform workspace list
- Switch to specified workspace: terraform workspace select <desied_workspace>

If you used isolation via workspace, in your Terraform configuration file, you can use the conditional statement to create each seperated configuration for each environemt, like this

```h
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = (
    terraform.workspace == "default" 
    ? "t2.medium" 
    : "t2.micro"
  )
}
```

When deploy with S3 remote backend, you can see the state for each workspace is store with key is `env:/<workspace>/terraform.tfsate`

![S3 Backend with Terraform Workspace](/media/terraform/s3-workspace.png)

**Drawbacks**
- The state files for all of your workspaces are stored in the same backend (e.g., the same S3 bucket). That means you use the same authentication and access controls for all the workspaces, which is one major reason workspaces are an unsuitable mechanism for isolating environments (e.g., isolating staging from production).
- Workspaces are not visible in the code or on the terminal unless you run terraform workspace commands. When browsing the code, a module that has been deployed in one workspace looks exactly the same as a module deployed in ten workspaces. This makes maintenance harder, as you don’t have a good picture of your infrastructur
- Putting the two previous items together, the result is that workspaces can be fairly error prone. The lack of visibility makes it easy to forget what workspace you’re in and accidentally make changes in the wrong one (e.g., accidentally running terraform destroy in a “production” workspace rather than a “staging” workspace), and since you have to use the same authentication mechanism for all workspaces, you have no other layers of defense to protect against such errors


### Isolation via file layout

The concept of isolation via file layout is represented through 2 points
- Put the Terraform configuration files for each environment into a separate folder. For example, all the configurations for the staging environment can be in a folder called `stage` and all the configurations for the production environment can be in a folder called `prod`
- Configure a different backend for each environment, using different authentication mechanisms and access controls (e.g., each environment could live in a separate AWS account with a separate S3 bucket as a backend).

For example:

```
stage
  └ vpc
  └ services
      └ frontend-app
      └ backend-app
          └ main.tf
          └ outputs.tf
          └ variables.tf
  └ data-storage
      └ mysql
      └ redis
prod
  └ vpc
  └ services
      └ frontend-app
      └ backend-app
  └ data-storage
      └ mysql
      └ redis
```

At the top level, there are separate folders for each environment. The exact environments differ for every project, but the typical ones are:
- stage: An environment for pre-production workloads (i.e., testing).
- prod: An environment for production workloads (i.e., user-facing apps).

Within each environment, there are separate folders for each component. The components differ for every project, but the typical ones are:
- vpc: The network topology for this environment.
- services: The apps or microservices to run in this environment, such as a Ruby on Rails frontend or a Java backend. Each app could even live in its own folder to isolate it from all the other apps.
- data-storage: The data stores to run in this environment, such as MySQL or Redis. Each data store could even live in its own folder to isolate it from all other data stores.

Within each component, there are the actual Terraform configuration files, which are organized according to the following naming conventions:
- variables.tf: Input variables.
- outputs.tf: Output variables.
- main.tf: The actual resources.

To used this partern with highly reusable component, you can use [_module_](https://www.terraform.io/docs/configuration/modules.html) featue in Terraform. Putting the module in shared storage (Git, local) and in each environment, configure the module to meet the requirement. With this pattern, now each component is simply like that
For example
```
stage
  └ vpc
  └ services
      └ frontend-app
      └ backend-app
          └ variables.tf
          └ main.tf
          └ outputs.tf
  └ data-storage
      └ mysql
      └ redis
prod
  └ vpc
  └ services
      └ frontend-app
      └ backend-app
  └ data-storage
      └ mysql
      └ redis
components
  └ backend-app
    └ main.tf
    └ outputs.tf
    └ variables.tf
```

```h
// File: stage/services/backend-app/main.tf
module {
  source = "../../../components/backend-app"

  desired_instance = {var.desired_instance}
}
```

```h
// File: stage/services/backend-app/main.tf
module {
  source = "../../../components/backend-app"

  desired_instance = {var.desired_instance}
}
```

**Drawback**
- Prevents you from creating your entire infrastructure in one command
- Harder to use resource dependencies (solution: the [`terraform_remote_state`](https://www.terraform.io/docs/providers/terraform/d/remote_state.html))

## References

- https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa

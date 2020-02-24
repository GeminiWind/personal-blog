---
title: "Automated Testing For Terraform"
date: "2020-02-24T22:40:32.169Z"
template: "post"
draft: false
slug: "/automated-testing-for-terraform"
category: "testing"
tags:
  - "Automated testing"
  - "Terraform"
  - "Infrastructure As Code"
description: "Testing your Infrastructure-As-Code Terraform with Terratest"
---

## Terraform

Terraform is a tool for building, changing, and versioning infrastructure safely and efficiently. Terraform can help with multi-cloud by having one workflow for all clouds. The infrastructure Terraform manages can be hosted on public clouds like Amazon Web Services, Microsoft Azure, and Google Cloud Platform, or on-prem in private clouds such as VMWare vSphere, OpenStack, or CloudStack.

Terraform treats infrastructure as code (IaC) so you never have to worry about you infrastructure drifting away from its desired configuration.

![Terraform](/media/terraform/terraform.png)

## Why do we need test Infrastructure-As-Code

As you know the Devops world, there is no doubt that there is a change in your infrastructure. The change, maybe is adding a load balance to ensure the high availability of application, adding more RAM to virtual instance ... Whenever this change happens, how do we combat the fear ?

> The Devops worlds is full of fear

- Fear of outage
- Fear of security braches
- Fear of data loss

Then finally
- Fear of change

The answer, just simple, is testing it. Testing make you be confidence that your infrastructure 'll works as expected when the change is deployed.

However, the technique to test infrastructure is so far different with application testing. In this article, we 'll deep dive how to test your infrastructure with supported library - [Terratest](https://github.com/gruntwork-io/terratest) 

### Terratest

[Terratest](https://github.com/gruntwork-io/terratest) , is a Go library to make it easier to write automated test for your infrastructure.

It provides helper functions and patterns for common infrastructure testing tasks such as:
- Testing Terraform code
- Testing Packer templates
- Testing Docker images
- Executing commands on servers over SSH
- Working with AWS APIs
- Making HTTP requests
- Running shell commands
- and the list goes on.

**Basic usage pattern for writing automated tests with Terratest**
- Write tests using Go’s built-in package testing: you create a file ending in _test.go and run tests with the go test command. E.g., go test my_test.go.
- Use Terratest to execute your real IaC tools (e.g., Terraform, Packer, etc.) to deploy real infrastructure (e.g., servers) in a real environment (e.g., AWS).
- Use the tools built into Terratest to validate that the infrastructure works correctly in that environment by making HTTP requests, API calls, SSH connections, etc.
- Undeploy everything at the end of the test.

## Unit test with Terratest

What is unit test ? Unit test is a way of testing a unit.

In application programming scope, a unit maybe a function, a procedure, a class or a method. A unit to test must be small and isolated.

In infrastructure, the term "unit" is quite different. Everything in the infrastructure can be treated as module. Each module 'll expose output. The output 'll be used to "talking outside the world". For e.g:
- An EC2 instance has `public_ip`, allowing access from the Internet. User browse the `public_ip` then see "Hello, World!" in their browser.
- A RDS (Amazon Relational Database service), after create your database, you 'll retrieve the URL as long as credentials to consume your database.

Therefore, unit test in infrastructure means testing a module in your infrastructure.

We 'll cover unit test with Terratest in the following example. This example 'll create a EC2 instance. The security group, which is attached to the instance, open port 80 (http) to allow it can be reached from anywhere. The EC2 instance runs web server (apache) then host a simple HTML file

__Folder structure__

```bash
. GoPath/src/ec2-unit-test
├── examples
│   └── hello-world
│       └── main.tf
├── test
│   └── ec2_unit_test.go
├── main.tf
├── outputs.tf
└── variables.tf
```

This EC2 module accepts three variables. These variables declare in `./variables.tf`

```h
variable "aws_region" {
  description = "AWS region to launch servers."
}

variable "image_id" {
  description = "The EC2 image ID to launch."
  type        = string
  default     = "ami-02a599eb01e3b3c5b"
}

variable "instance_type" {
  description = "EC2 instance type to be launched. For e.g: t2.micro."
  default     = "t2.micro"
}
```

The main logic of EC2 module provisions 2 resources
- EC2 instance: A virtual machine to run web server, hosting simple HTML file
- Security group: A security group containing ingress and egress rule for above EC2 instance

They are implemented in `./main.tf`

```h
provider "aws" {
  region = var.aws_region
}

resource "aws_instance" "example" {
  ami                    = var.image_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.instance.id]

  user_data = <<EOF
#!/bin/bash
echo "Hello, World!" > index.html
nohup busybox httpd -f -p 80 &
EOF
}

resource "aws_security_group" "instance" {
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

And, the output of EC2 module is `public_ip`. This output is declared in `./output.tf` 

```h
output "public_ip" {
  value = aws_instance.example.public_ip
}
```

Finally, we have `hello-world` example in `examples/hello-world`. This example indicate the usage of EC2 module and will be used to test later

```h 
module "ec2" {
  source        = "../../"
  aws_region    = "ap-southeast-2"
  image_id      = "ami-02a599eb01e3b3c5b"
  instance_type = "t2.micro"
  
}

output "homepage" {
  value = module.ec2.public_ip
}
```

Follow the pattern to write automated testing for Terraform

1. Write Go test file

To write the Go test file, we must name your file having suffix `_test` . In this case, we have `ec2_unit_test.go`

2. Write the logic code to deploy infrastructure
    - Define dependencies

    ```go
    package test

    import (
      "fmt"
      "testing"
      "time"

      http_helper "github.com/gruntwork-io/terratest/modules/http-helper"
      
      "github.com/gruntwork-io/terratest/modules/terraform"
    ) 
    ```

    - Write text execution: deploy infrastructure -> validate by calling HTTP -> destroy

    ```go
      + func TestTerraformAwsHelloWorldExample(t *testing.T) {
      +  terraformOptions := &terraform.Options{
      +    // website::tag::1:: The path to where our Terraform code is located
      +    TerraformDir: "../examples/hello-world",
      +  }

      +  // website::tag::5:: At the end of the test, run `terraform destroy` to clean up any resources that were created.
      +  defer terraform.Destroy(t, terraformOptions)

        // website::tag::2:: Run `terraform init` and `terraform apply`. Fail the test if there are any errors.
      + terraform.InitAndApply(t, terraformOptions)
      + }
    ```


3. Use HTTP call to validate it. Expected HTTP code is 200 and the body is "Hello, World!"
    
    Terraform, behind the scene, use AWS API to create resources, so it' s eventually consistency. It means that after you create your resource, it takes time to boot your resource up. Therefore, in this test logic, we need to retry to call HTTP after resources are provision successfully 
    ```go
      func TestTerraformAwsHelloWorldExample(t *testing.T) {
        terraformOptions := &terraform.Options{
          // website::tag::1:: The path to where our Terraform code is located
          TerraformDir: "../examples/hello-world",
        }

        // website::tag::5:: At the end of the test, run `terraform destroy` to clean up any resources that were created.
        defer terraform.Destroy(t, terraformOptions)

        // website::tag::2:: Run `terraform init` and `terraform apply`. Fail the test if there are any errors.
        terraform.InitAndApply(t, terraformOptions)

        + publicIP := terraform.Output(t, terraformOptions, "public_ip")

        // website::tag::4:: Make an HTTP request to the instance and make sure we get back a 200 OK with the body "Hello, World!"
        + url := fmt.Sprintf("http://%s", publicIP)
        + http_helper.HttpGetWithRetry(t, url, nil, 200, "Hello, World!", 30, 30*time.Second)
      }
    ```

4. Destroy infrastructure

    Finally, the `ec2_unit_test.go` will be like the following 

    ```go
    package test

    import (
      "fmt"
      "testing"
      "time"

      http_helper "github.com/gruntwork-io/terratest/modules/http-helper"

      "github.com/gruntwork-io/terratest/modules/terraform"
    )

    func TestTerraformAwsHelloWorldExample(t *testing.T) {
      terraformOptions := &terraform.Options{
        // website::tag::1:: The path to where our Terraform code is located
        TerraformDir: "../examples/hello-world",
      }

      // website::tag::5:: At the end of the test, run `terraform destroy` to clean up any resources that were created.
      defer terraform.Destroy(t, terraformOptions)

      // website::tag::2:: Run `terraform init` and `terraform apply`. Fail the test if there are any errors.
      terraform.InitAndApply(t, terraformOptions)

      // website::tag::3:: Run `terraform output` to get the IP of the instance
      publicIP := terraform.Output(t, terraformOptions, "public_ip")

      // website::tag::4:: Make an HTTP request to the instance and make sure we get back a 200 OK with the body "Hello, World!"
      url := fmt.Sprintf("http://%s", publicIP)
      http_helper.HttpGetWithRetry(t, url, nil, 200, "Hello, World!", 30, 30*time.Second)
    }

    ```

To run the test Go, execute the following command

```bash
cd test
go test -v ec2_unit_test.go
```

Parameter `-v` to indicate show verbose in running test. Test passes after 300s. The log show Terratest run the test with flow
- Run `terraform init` to initialize providers
- Run `terraform apply` to provision resources
- Test
- Run `terraform destroy` to destroy resources



```bash
=== RUN   TestTerraformAwsHelloWorldExample
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 retry.go:72: terraform [init -upgrade=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:87: Running command terraform with args [init -upgrade=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: Initializing modules...
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: - ec2 in ../..
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: Initializing the backend...
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: Initializing provider plugins...
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:08+07:00 command.go:158: - Checking for available provider plugins...
TestTerraformAwsHelloWorldExample 2020-02-24T14:10:09+07:00 command.go:158: - Downloading plugin for provider "aws" (hashicorp/aws) 2.50.0...
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: The following providers do not have any version constraints in configuration,
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: so the latest version was installed.
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: To prevent automatic upgrades to new major versions that may contain breaking
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: changes, it is recommended to add version = "..." constraints to the
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: corresponding provider blocks in configuration, with the constraint strings
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: suggested below.
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: * provider.aws: version = "~> 2.50"
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: Terraform has been successfully initialized!
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: You may now begin working with Terraform. Try running "terraform plan" to see
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: any changes that are required for your infrastructure. All Terraform commands
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: should now work.
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: If you ever set or change modules or backend configuration for Terraform,
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: rerun this command to reinitialize your working directory. If you forget, other
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: commands will detect it and remind you to do so if necessary.
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 retry.go:72: terraform [get -update]
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:87: Running command terraform with args [get -update]
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:158: - ec2 in ../..
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 retry.go:72: terraform [apply -input=false -auto-approve -lock=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:41+07:00 command.go:87: Running command terraform with args [apply -input=false -auto-approve -lock=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:52+07:00 command.go:158: module.ec2.aws_security_group.instance: Creating...
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:57+07:00 command.go:158: module.ec2.aws_security_group.instance: Creation complete after 5s [id=sg-0e3a89a9ec3e6cc7d]
TestTerraformAwsHelloWorldExample 2020-02-24T14:11:57+07:00 command.go:158: module.ec2.aws_instance.example: Creating...
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:07+07:00 command.go:158: module.ec2.aws_instance.example: Still creating... [10s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:17+07:00 command.go:158: module.ec2.aws_instance.example: Still creating... [20s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:27+07:00 command.go:158: module.ec2.aws_instance.example: Still creating... [30s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: module.ec2.aws_instance.example: Creation complete after 39s [id=i-04cc004a0aa0736fa]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: Outputs:
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: public_ip = 13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 retry.go:72: terraform [output -no-color public_ip]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:87: Running command terraform with args [output -no-color public_ip]
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 command.go:158: 13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:36+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:12:44+07:00 retry.go:84: HTTP GET to URL http://13.236.153.154 returned an error: Get http://13.236.153.154: dial tcp 13.236.153.154:80: connect: connection refused. Sleeping for 30s and will try again.
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:14+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:14+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:14+07:00 retry.go:84: HTTP GET to URL http://13.236.153.154 returned an error: Get http://13.236.153.154: dial tcp 13.236.153.154:80: connect: connection refused. Sleeping for 30s and will try again.
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:44+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:44+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:13:44+07:00 retry.go:84: HTTP GET to URL http://13.236.153.154 returned an error: Get http://13.236.153.154: dial tcp 13.236.153.154:80: connect: connection refused. Sleeping for 30s and will try again.
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:14+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:14+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:14+07:00 retry.go:84: HTTP GET to URL http://13.236.153.154 returned an error: Get http://13.236.153.154: dial tcp 13.236.153.154:80: connect: connection refused. Sleeping for 30s and will try again.
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:44+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:44+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:14:44+07:00 retry.go:84: HTTP GET to URL http://13.236.153.154 returned an error: Get http://13.236.153.154: dial tcp 13.236.153.154:80: connect: connection refused. Sleeping for 30s and will try again.
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:14+07:00 retry.go:72: HTTP GET to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:14+07:00 http_helper.go:32: Making an HTTP GET call to URL http://13.236.153.154
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:15+07:00 retry.go:72: terraform [destroy -auto-approve -input=false -lock=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:15+07:00 command.go:87: Running command terraform with args [destroy -auto-approve -input=false -lock=false]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:21+07:00 command.go:158: module.ec2.aws_security_group.instance: Refreshing state... [id=sg-0e3a89a9ec3e6cc7d]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:22+07:00 command.go:158: module.ec2.aws_instance.example: Refreshing state... [id=i-04cc004a0aa0736fa]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:33+07:00 command.go:158: module.ec2.aws_instance.example: Destroying... [id=i-04cc004a0aa0736fa]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:43+07:00 command.go:158: module.ec2.aws_instance.example: Still destroying... [id=i-04cc004a0aa0736fa, 10s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:15:53+07:00 command.go:158: module.ec2.aws_instance.example: Still destroying... [id=i-04cc004a0aa0736fa, 20s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:03+07:00 command.go:158: module.ec2.aws_instance.example: Still destroying... [id=i-04cc004a0aa0736fa, 30s elapsed]
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:06+07:00 command.go:158: module.ec2.aws_instance.example: Destruction complete after 32s
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:06+07:00 command.go:158: module.ec2.aws_security_group.instance: Destroying... [id=sg-0e3a89a9ec3e6cc7d]
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:07+07:00 command.go:158: module.ec2.aws_security_group.instance: Destruction complete after 2s
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:07+07:00 command.go:158: 
TestTerraformAwsHelloWorldExample 2020-02-24T14:16:07+07:00 command.go:158: Destroy complete! Resources: 2 destroyed.
--- PASS: TestTerraformAwsHelloWorldExample (359.68s)
PASS
ok      command-line-arguments  359.688s
```

### Key takeaways

- Some provider requires that resource name must be unique. To test this resource, you must implement mechanism to generate random unique name for resource. After resource name is generated, you pass it as Terraform variable. Terratest also supports this action as out-of-box feature
- Module should be splited small enough and logic to ease testing 
- Unit test should have small execution time

## Integration test with Terratest

Integration test, contracting to unit test, is a type of testing where software modules are integrated and tested it group.

Apply this theory into infrastructure, integration test is testing integration between modules. For e.x:
- Testing integration between S3 and Cloudfront. S3 play a role as bucket to serve static website, while Cloudfront is CDN to help caching and distributing this website
- Testing integration between SQS and Lambda. Whenever a new message is pushed into SQS, a specified Lambda must be triggered
- The list goes on

I 'll take the first example to implement the test integration because the concept is too easy

```bash
. GoPath/src/s3-cdn-integration-test
├── cloudfront
│   ├── main.tf
│   ├── outputs.tf
│   └── variables.tf
├── s3
│   ├── main.tf
│   ├── outputs.tf
│   └── variables.tf
├── examples
│   └── hello-world
│       └── main.tf
└── test
    ├── fixture
    │   └── build
    │       └── index.html
    └── s3_cloudfront_integration_test.go
```
1. Set up modules
  
  1.1 S3 static website
      - `variables.tf`

      ```h
      variable "aws_region" {
        description = "AWS region to hosting your resources."
        default     = "ap-southeast-2"
        type        = string
      }

      variable "app" {
        description = "Name of your app."
        type        = string
      }

      variable "stage" {
        description = "Stage where app should be deployed like dev, staging or prod."
        default     = "dev"
        type        = string
      }
      ```

      - `main.tf`

      ```h
      provider "aws" {
        region = var.aws_region
      }

      resource "aws_s3_bucket" "site_bucket"  {
        bucket = "${var.app}-site-bucket--stage-${var.stage}"

        acl    = "public-read"

        policy = <<EOF
      {
        "Version": "2008-10-17",
        "Statement": [
          {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": {
              "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${var.app}-site-bucket--stage-${var.stage}/*"
          }
        ]
      }
      EOF

        tags = {
          APP = "${var.app}"
          STAGE = "${var.stage}"
        }

        versioning {
          enabled = var.enable_versioning
        }

        website {
          index_document = "${var.index_page}"
          error_document = "${var.error_page}"
        }
      }

      # Sync artifact to s3 bucket
      resource "null_resource" "upload_web_resouce" {
        provisioner  "local-exec" {
          command = "aws s3 sync ${var.artifact_dir} s3://${var.app}-site-bucket--stage-${var.stage}"
        }

        depends_on = ["aws_s3_bucket.site_bucket"]
      }
      ```

      - `outputs.tf`

      ```h
      output "bucket_regional_domain_name" {
        value = aws_s3_bucket.site_bucket.bucket_regional_domain_name
        description = "S3 bucket regional domain name"
      }
      ```
  1.2 Set up CDN by Cloudfront
      - `variables.tf`. The variable `bucket_regional_domain_name` 'll be taked from output of S3 module

      ```h
      variable "aws_region" {
        description = "AWS region to hosting your resources."
        default     = "ap-southeast-2"
        type        = string
      }

      variable "app" {
        description = "Name of your app."
        type        = string
      }

      variable "stage" {
        description = "Stage where app should be deployed like dev, staging or prod."
        default     = "dev"
        type        = string
      }

      variable "bucket_regional_domain_name" {
        description = "S3 Bucker Regional Domain Name"
        type        = string
      }
      ```

      - `main.tf`

      ```h
      provider "aws" {
        region = var.aws_region
      }
      resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
        comment = ""
      }

      resource "aws_cloudfront_distribution" "s3_distribution" {
        origin {
          domain_name = var.bucket_regional_domain_name
          origin_id   = "s3-${var.app}--stage-${var.stage}"

          s3_origin_config {
            origin_access_identity = "${aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path}"
          }
        }

        enabled             = true
        is_ipv6_enabled     = true
        comment             = ""
        default_root_object = "index.html"

        default_cache_behavior {
          allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
          cached_methods   = ["GET", "HEAD"]
          target_origin_id = "s3-${var.app}--stage-${var.stage}"

          forwarded_values {
            query_string = false

            cookies {
              forward = "none"
            }
          }

          viewer_protocol_policy = "allow-all"
          min_ttl                = 0
          default_ttl            = 3600
          max_ttl                = 86400
        }
        
        restrictions {
          geo_restriction {
            restriction_type = "none"
          }
        } 

        viewer_certificate {
          cloudfront_default_certificate = true
        }
      }
      ```

      - `outputs.tf`

      ```h
      output "domain_name" {
        value = aws_cloudfront_distribution.s3_distribution.domain_name
        description = "CDN domain name"
      }
      ```
2. Write example to test.

    ```h
    module "s3_static_site" {
      source        = "../../s3"
      app           = "hello-world"
      stage         = "dev"
      index_page    = "index.html"
      error_page    = "index.html"
      artifact_dir  =  "/home/haidv/go/src/automated-testing-for-terraform/s3-cdn-integration-test/test/fixture/build"
    }

    module "cdn" {
      source                      = "../../cloudfront"
      app                         = "hello-world"
      stage                       = "dev"
      bucket_regional_domain_name = module.s3_static_site.bucket_regional_domain_name
    }

    output "url" {
      value = module.cdn.domain_name
    }
    ```

3. Write test file.
    
    I'll skip the detail to write test. If you miss the way to write test, please refer to unit test

    ```go
    package test

    import (
      "testing"
      "time"

      http_helper "github.com/gruntwork-io/terratest/modules/http-helper"

      "github.com/gruntwork-io/terratest/modules/terraform"
    )

    func TestTerraformAwsHelloWorldExample(t *testing.T) {
      terraformOptions := &terraform.Options{
        TerraformDir: "../examples/hello-world",
      }
      defer terraform.Destroy(t, terraformOptions)
      terraform.InitAndApply(t, terraformOptions)

      url := terraform.Output(t, terraformOptions, "url")
      http_helper.HttpGetWithRetry(t, url, nil, 200, "Hello, World!", 30, 15*time.Second)
    }
    ```

4. Execute test

To run test, the following command must be executed

```bash
cd test
go test -v s3_cloudfront_integration_test.go -timeout 9999ms
```

## End-to-end test

End-to-end testing is a testing methodology to test an application flow from start to end. The purpose of this testing is to simulate the real user scenario and validate the system under test and its components for integration and data integrity.

Migrate to infrastructure, end to end test is test all communication between module in entire infrastructure. Therefore, the effort to run e2e test is so large.

The most possible strategy to do e2e test is:
- Deploy all system in your infrastructure
- Whenever there is a change in a module, we only deploy the module
- Run your test.
- After your test, don't destroy anything

Totally. it 's quite the same way we treat to dev environment we always hear

## References

- [Automated testing for Terraform, Docker, Packer, Kubernetes and more](https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/)
- [Test Terraform module using Terratest](https://docs.microsoft.com/en-us/azure/terraform/terratest-in-terraform-modules)
- [Terratest AWS Example](https://github.com/GeminiWind/automated-testing-for-terraform)
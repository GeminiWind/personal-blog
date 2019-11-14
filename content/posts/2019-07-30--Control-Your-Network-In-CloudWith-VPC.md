---
title: "AWS:VPC - Manage your network in Cloud with VPC"
date: "2019-07-30T22:40:32.169Z"
template: "post"
draft: false
slug: "/amazon-web-services/manage-your-network-in-cloud-with-vpc"
category: "AWS"
tags:
  - "AWS 101"
  - "VPC"
  - "Networking"
description: "Amazon Virtual Private Cloud (Amazon VPC) enables you to launch AWS resources into a virtual network that you've defined."
socialImage: "/media/vpc/vpc.png"
---

The overview says:

> Amazon Virtual Private Cloud (Amazon VPC) lets you provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define.

Think of VPC as a virtual network created by AWS for your account. It is completely isolated from VPCs of other users, which allows only you or any AWS account authorized by you to use or modify it. This is your personal network in the cloud.

So, why you need VPC? It is required to provision EC2 instances, DB instances or any compute instances where applications need any sort of network communications.

VPC is associated with a Region. By default, AWS already provides you with a default VPC in each region after you create an account. The default VPC will suit most of your needs, but you still need to understand how it works.

>   *[AWS 101](http://blog.haidv.me/tag/aws-101/) is an original series for developer to get started with AWS, actually it's my note and summary I've made in working with AWS in our project*

  - Part 1: [Getting Started With Simple Storage Object (S3)](https://blog.haidv.me/amazon-web-services/getting-started-with-aws-s3)
  - Part 2: [Working with NoSQL in AWS: DynamoDB](https://blog.haidv.me/amazon-web-services/working-with-aws-dynamodb)
  - Part 3: [EC2: The Backbone of AWS](https://blog.haidv.me/amazon-web-services/ec2-the-backbone-of-aws)
  - Part 4: [SQS: Do you know queue in AWS](https://blog.haidv.me/amazon-web-services/do-you-know-queue-in-aws)
  - Part 5: [Configure SNS to send your notification](https://blog.haidv.me/amazon-web-services/configure-sns-to-send-your-notification)
  - Part 6: [Manage your network in Cloud with VPC](https://blog.haidv.me/amazon-web-services/manage-your-network-in-cloud-with-vpc)

## VPC Terminology

- __CIDR__: CIDR, which stands for Classless Inter-Domain Routing, is an IP addressing scheme that improves the allocation of IP addresses. For example: `10.0.0.0/16`. More detailed about CIDR in [here](https://www.keycdn.com/support/what-is-cidr)

- __Subnet__: A subnet is a logical group of a networks which differ depending on the requirements. Subnetting let us break a network into smaller parts. Think of it as a network in a huge building with 100 different companies and 100 divisions each, each with network groups.

    - __Public Subnet__: A public subnet is a subnet that's associated with a route table that has a route to an Internet gateway. The instance  in the public subnet can send outbound traffic directly to the Internet
    - __Private Subnet__: subnet doesn't have a route to the Internet Gateway. The instance  in the private subnet can not send outbound traffic directly to the Internet

- __Route Table__: A route table contains a set of rules, called routes, that are used to determine where network traffic from your subnet is directed.
- __Internet Gateway__: An internet gateway is a horizontally scaled, redundant, and highly available VPC component that allows communication between instances in your VPC and the internet
- __NAT Gateway__: You can use a network address translation (NAT) gateway to enable instances in a private subnet to connect to the internet or other AWS services, but prevent the internet from initiating a connection with those instances

In this article, I'll do the following thing

- Create VPC `my-vpc` with IPv4 CIDR is `10.0.0.0/16`
- Create two subnets in `my-vpc`
    - Public subnet `public-2a` with CIDR is `10.0.0.0/23` & Availability Zone is `ap-southeast-2a`
    - Private subnet `private-2b` with CIDR is `10.0.0.2/23` & Availability Zone is `ap-southeast-2b`
- Create Internet Gateway `my-igw` and attach it to `my-vpc`
- Create route table `rt1` and add route to connect Internet
- Link `rt1` with `public-2a` to allow instance in `public-2a` communicate Internet

### Create your first VPC


__1. Create VPC__

Login to AWS Console, typing VPC in Service Menu, then Click `Your VPCs` in the sidebar

![Your-VPCs](/media/vpc/your-vpcs.png)


Click Create VPC button to create your own VPC

![Create-VPC](/media/vpc/create-vpc.png)

- Name: Name to identify your VPC
- IPv4 CIDR block
  - It is an abbreviation for Classless Inter-Domain Routing.
  - To specify a range of IPs
  - The notation is `<ip notation>/<number>`

In the above example, my IPv4 CIDR is `10.0.0.0/16`, it means that I 'll have 65536 IPs in my network

__2. Create subnets in VPC__

If you do not remember the way to subnet your network, we've a tool in [vlsm-calc](http://www.vlsm-calc.net/). Easy subneting your network in 1 minute !
   
In this tutorial, two subnet will be created: one is public (`public-2a`) and the other is private (`private-2b`).

![Create-Subnet](/media/vpc/create-subnet.png)

- Name Tag: Name to identify subnet
- VPC: The VPC which the subnet associated with
- Availability Zone: The availability zone to put your subnet
- IPv4 CIDR block: the CIDR to identify IP range in your subnet (`10.0.0.0/23` means that there are 510 IP in this subnet)

Do the same things to create your private subnet `private-2b`

__3. Create Internet Gateway__

As the name implies, in order for your VPC to have access to the Internet, you have to attach an Internet gateway to it. Let’s create an Internet gateway and name it `my-igw` :

![Create-Internet-Gateway](/media/vpc/create-internet-gateway.png)

After Internet gateway is created, attach it to your VPC

__4. Create Route Table__

This works like routing does in an app. For example, if the IP destination is 10.0.0.14, then route it to service-a, it’s that simple.

By default, when you create a new subnet in your VPC, there is a main route table which automatically linked to your subnet. In our example, the main will be like

![Main Route Table](/media/vpc/main-rt.png)

What is the route table means ? It mean that all device with IP in `10.0.0/16` can communicate with your subnet and no Internet access in this IP range. Easy, right.

To allow Internet access in the subnet, in the route table, it need a Internet Gateway to access Internet.

To prevent unexpected changing in the main route table, I 'll create a new route table `rt1`, then attach Internet Gateway `my-igw` into `rt1`. 

![Public Route Table](/media/vpc/create-rt1.png)


After route table `rt1` was created successfully, just associate it with `public-2a` subnet. Now your `public-2a` subnet is really public subnet

![Edit Route Table Association](/media/vpc/edit-rt-association.png)


For `private-2b`, I will keep linking the main route table, because I want `private-2b` is private

__5. Testing by launching EC2 instance__

Finally, let’s test that our network is working properly.
Launch an EC2 instance — use the “t2.micro” instance type as it is free tier eligible.
Go to step #3 to configure the instance. This is where we configure the network this instance is going to use
  ```
  VPC: `my-vpc`
  Subnet: `public-2a`
  Auto-assign Public IP: `Enabled`
  ```

![Creating EC2 Instance](/media/vpc/test-instance.png)

Select the VPC and one of the public subnets we just created


Time to pingggggggg

```bash
ping google.com
```

![Public Ping](/media/vpc/public-ping.png)

Your instance can access the Internet now. Also, you can try to ping another IP which is in VPC CIDR Block



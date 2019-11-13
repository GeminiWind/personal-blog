---
title: "AWS: EC2 - The Backbone of AWS"
date: "2019-07-20T20:40:32.169Z"
template: "post"
draft: false
slug: "/amazon-web-services/ec2-the-backbone-of-aws"
category: "AWS"
tags:
  - "AWS 101"
  - "EC2"
description: "EC2 is an Infrastructure as a Service Cloud Computing Platform provided by Amazon Web Services, that allows users to instantiate various types of virtual machines."
socialImage: "/media/ec/ec2.jpg"
---

Amazon Elastic Compute Cloud (Amazon EC2) provides scalable computing capacity in the Amazon Web Services (AWS) cloud. Using Amazon EC2 eliminates your need to invest in hardware up front, so you can develop and deploy applications faster. You can use Amazon EC2 to launch as many or as few virtual servers as you need, configure security and networking, and manage storage. Amazon EC2 enables you to scale up or down to handle changes in requirements or spikes in popularity, reducing your need to forecast traffic.


Amazon EC2 provides the following features:
- Virtual computing environments, known as instances
- Preconfigured templates for your instances, known as Amazon Machine Images (AMIs), that package the bits you need for your server (including the operating system and additional software)
- Various configurations of CPU, memory, storage, and networking capacity for your instances, known as instance types
- Secure login information for your instances using key pairs (AWS stores the public key, and you store the private key in a secure place)
- Storage volumes for temporary data that's deleted when you stop or terminate your instance, known as instance store volumes
- Persistent storage volumes for your data using Amazon Elastic Block Store (Amazon EBS), known as Amazon EBS volumes
- Multiple physical locations for your resources, such as instances and Amazon EBS volumes, known as Regions and Availability Zones
- A firewall that enables you to specify the protocols, ports, and source IP ranges that can reach your instances using security groups
- Static IPv4 addresses for dynamic cloud computing, known as Elastic IP addresses
- Metadata, known as tags, that you can create and assign to your Amazon EC2 resources
- Virtual networks you can create that are logically isolated from the rest of the AWS cloud, and that you can optionally connect to your own network, known as virtual private clouds (VPCs)

    *[AWS 101](http://blog.haidv.me/tag/aws-101/) is an original series for developer to get started with AWS, actually it's my note and summary I've made in working with AWS in our project*

    - Part 1: [Getting Started With Simple Storage Object (S3)](https://blog.haidv.me/amazon-web-services/getting-started-with-aws-s3)
    - Part 2: [Working with NoSQL in AWS: DynamoDB](https://blog.haidv.me/amazon-web-services/working-with-aws-dynamodb)
    - Part 3: [EC2: The Backbone of AWS](https://blog.haidv.me/amazon-web-services/ec2-the-backbone-of-aws)
    - Part 4: [SQS: Do you know queue in AWS](https://blog.haidv.me/amazon-web-services/do-you-know-queue-in-aws)
    - Part 5: [Configure SNS to send your notification](https://blog.haidv.me/amazon-web-services/configure-sns-to-send-your-notification)

## Amazon EC2 Terminology

### Instance

1. __Instance__ - An EC2 instance is a virtual server in Amazon’s Elastic Compute Cloud (EC2) for running applications on the Amazon Web Services (AWS) infrastructure.  
2. __Instance Type__ - Type of instance, which is defined for desired purpose
3. __Launch Templates__ — A template which specifies the instance configuration, permissions, best practices and use it to automatically launch instances using autoscaling and EC2 fleet.

### Images

1. __AMIs__ — An Amazon Machine Image (AMI) is a master image for the creation of virtual servers (known as EC2 instances) in the Amazon Web Services (AWS) environment. The machine images are like templates that are configured with an operating system and other software, which determine the user’s operating environment. AMI types are categorized according to region, operating system, system architecture (32- or 64-bit), launch permissions and whether they are backed by Amazon EBS or backed by the instance store.

### Storage

#### Instance store

It 's __ephemeral__ physical storage attached to the host computer

Data in instance store will be lost if your instance is terminated.

#### Elastic Block Store

It 's __persistent__ block level storage volume

1. __Volumes__ — EBS volumes are just like hard-disks in the cloud. They can be attached to your EC2 instances. You can install Operating systems and softwares on them or use them to serve your dynamic website like WordPress.
2. __Snapshots__ — You can create backup of your EBS volumes as Snapshots. These snapshots can be used to create multiple EBS volumes which contain the same data

### Network & Security

1. __Network Interfaces__ — You can create network interfaces and attach them to your EC2 instances. You can attach multiple network interfaces to a single instance.
2. __Security Groups__ — They are like a virtual firewall for your EC2 instances. All the traffic to an instance passes always passes through its security group. You can specify which ports to open and who can send and receive data through that port.
3. __Key Pairs__ — To connect to your EC2 instances through SSH protocol you have to use key pairs.

> __**"Talk is cheap, show me the code"**__

## Create your first EC2 instance

### 1. Log into the AWS console. 

Log into the AWS Console , Select EC2 in the Service Menu:


![EC2 Dashboard](/media/ec2/ec2_dashboard.png)

You are in EC2 Dashboard. Click __Launch Instance__ to launch new instance


### 2. Chose your Amazon Machine Image (AMI)

There are many free available AMI on the market, or you can buy them or create your own AMI by snapshot your EBS then publishing it to the market.

![Choose AMI](/media/ec2/ami.png)


### 3. Choose your instance type

There are ten types of EC2 instances:
- Dense Storage (D2)
- Memory Optimized (R4)
- General Purpose (M4)
- Compute Optimized (C4)
- Graphics Intensive (G2)
- High Speed Storage (I2)
- Field Programmable Gateway (F1)
- Lowest Cost General Purpose (T2)
- Graphics General Purpose (P2) and Memory Optimized (X1).

Each type of instance has their purpose. For more information, please look the following picture


![Instance Type](/media/ec2/set_instance_type.png)

`t2.micro` is free-tier instance type offered by AWS


### 4. Configure the virtual machine and select a pricing plan

![Configure instance](/media/ec2/configure_instance.png)

As you can see the above picture, there's a long list option in here. Don't worry, I 'll slow down to explain one by one option

- __Number of instance__: Your desired number of instance
- __Purchasing options__: There are four different pricing models for EC2 instances:

  - _On Demand_: The on-demand pricing model is great for those who want to test out AWS’s EC2 service or are supporting dynamic workloads/applications that have unpredictable and inconsistent resource requirements. With on-demand pricing you pay for the instances you use by the hour and only when you use them
  - _Spot_: This pricing method allows organizations to bid the for unused EC2 capacity at a highly discounted rate. While this pricing model is highly attractive from a cost perspective, the pricing and availability of these instances are forever changing based upon usage. Spot instances are best for those workloads that are not time dependent and can afford to be interrupted.
  - _Reserved_: Reserved instances are the second most common pricing model in AWS and give organizations the ability to greatly reduce the cost of their AWS environment by making an upfront commitment/payment for those services they know or assume they will need for a given time period.
  - _Dedicated Hosts_: With dedicated instances, you receive your own VPC comprised of dedicated, single-tenant hardware. Your instances will be physically isolated at the host level from instances that belong to other AWS accounts. This type is suitable for specific case like your software license is associated with IP computer.

- __VPC__: specified VPC(Virtual Private Cloud) where instance should be located
-  __Subnet__: subnet in your defined VPC. The subnet can be public or private and is tied to specific Availability Zone.
-  __IAM role__: Role for providing additional policies to grant your instance access other AWS resources.
-  __Shutdown behavior__: specify what should do when your instance shut down (stop/terminate)
- __Advanced detail__:
    - User script: boostrap script for your instance like install binary, package


### 5. Select storage option


Root means it is where we are going to boot our Operating System from (such as Windows or in our case Linux). With EBS we can create filesystems, run databases and other cool stuff and EBS Volume is persistent.


![Add](/media/ec2/add_storage.png)


There are three different storage types for root EBS volumes:
  - General Purpose SSD (GP2)
  - Provisioned IOPS SSD (IO1)
  - Magnetic HDD.

Data in EBS Volume can be encrypted by using KMS.

Delete on Termination means the EBS will be deleted if we delete the EC2 instance by default. However, you can change it to protect your data in EBS after your instance has been terminated.

You can create a snapshot from EBS then leverage it to create your own AMI. You must stop your instance which is associated with EBS volume you want to create snapshot before creating snapshot.

You can attach more EBS Volumes even the instance has started.

### 6. Add Tags

Tag is used as label your resource. When you need to manipulate a specified group of EC2 instances, tag is your friend.

![Add Tag](/media/ec2/add_tag.png)


### 7. Configure Security Group

A security group is a set of firewall rules that control the traffic for your instance.

Specifying inbound rule and outbound rule will prevent your instance from attacking.

![Configure Security Group](/media/ec2/configure_security_group.png)

### 8. Review and choose the key

Finally, review your instance and choose the key to connect your instance(if you have already a key), or you can create a new one, then download and keep it be private

## Connect to your instance

To connect your instance, you can get the instruction by choosing your instance, then click `Connect`, then follow the instruction

![Connect Your Instance](/media/ec2/connect.png)

## Conclusion

![Wohoooo](/media/woohoo.jpg)

Congratulation, you have your first instance in EC2.

Keep watching how we can handle scaling problem in EC2
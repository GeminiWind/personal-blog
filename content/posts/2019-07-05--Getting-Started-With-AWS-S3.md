---
title: "AWS - Getting Started With Simple Storage Object (S3)"
date: "2019-07-05T22:40:32.169Z"
template: "post"
draft: false
slug: "/amazon-web-services/getting-started-with-aws-s3"
category: "AWS"
tags:
  - "AWS 101"
  - "S3"
  - "key-value storage"
description: "Amazon Simple Storage Service is storage for the Internet. It is designed to make web-scale computing easier for developers."
socialImage: "/media/s3/s3.png"
---

Amazon S3 or __Amazon Simple Storage Service__ is a service offered by Amazon Web Services (AWS) that provides object storage which is built for storing and recovering any amount of information or data from anywhere over the Internet.

Common use cases for S3:
- Backup and archive for on-premises or cloud data
- Content, media, and software storage and distribution
- Big data analytics
- Static website hosting
- Cloud-native mobile and Internet application hosting
- Disaster recovery
    
    *[AWS 101](http://blog.haidv.me/tag/aws-101/) is an original series for developer to get started with AWS, actually it's my note and summary I've made in working with AWS in our project*

    - Part 1: [Getting Started With Simple Storage Object (S3)](https://blog.haidv.me/amazon-web-services/getting-started-with-aws-s3)
    - Part 2: [Working with NoSQL in AWS: DynamoDB](https://blog.haidv.me/amazon-web-services/working-with-aws-dynamodb)
    - Part 3: [EC2: The Backbone of AWS (TBD)](https://blog.haidv.me)
    - Part 4: [SQS: Do you know queue in AWS](https://blog.haidv.me/amazon-web-services/do-you-know-queue-in-aws)


## S3 Concept

### Bucket

Before we store any data into S3, we first have to create a Bucket. A bucket is similar to how we create a folder on the local system.

- The bucket name must be unique across all of the AWS accounts. It must be at least 3 and no more than 63 characters long.
- Bucket was allocated on the region you specify
- No limit on how much of data that we can store inside a bucket.
- By default, you can create up to 100 buckets in each of your AWS accounts. If you need additional buckets, you can increase your bucket limit by submitting a service limit increase.

### Object

Amazon S3 is a simple __key-value__ store designed to store as many objects as you want. You store these objects in one or more buckets. An object consists of the following characteristics:
- __Key__ — The name that you assign to an object. You use the object key to retrieve the object.
- __Version ID__ — Within a bucket, a key and version ID uniquely identify an object. Version ID will only available if you turn versioning on.
- __Value__ — The content that we are storing
- __Metadata__ — A set of name-value pairs with which you can store information regarding the object.
- __Subresources__ — Amazon S3 uses the subresource mechanism to store object-specific additional information.
- __Access Control Information__ — We can control access to the objects in Amazon S3.

## S3 Features

### Server logging

- Offer feature to track request access to your S3 bucket.
- Log file will be format as __.TXT__ in another S3 target bucket. Target bucket must be allocated with the same region of origin bucket.
- Sample log.

![Server Logging](/media/s3/s3_log.png)

- Easily to integrate with other AWS services to analyse these metrics.

### Versioning

- Versioning automatically keeps up with different versions of the same object. For example, say that you have an object (object1) currently stored in a bucket. With default settings, if you upload a new version of object1 to that bucket, object1 will be replaced by the new version. Then, if you realize that you messed up and want the previous version back, you are out of luck unless you have a backup on your local computer. With versioning enabled, the old version is still stored in your bucket, and it has a unique Version ID so that you can still see it, download it, or use it in your applications.


- Turn on versioning will make uploading new object in bucket will return version Id. This version Id will be used to retrieve object. For the object existing previous turn versioning on, version Id will be null.


- Deleting the versioning object only mark deleting the latest version, the old versions still stored.


- Versioning can not be completely disabled, we can only turn enable status to suspend. It mean when you suspend versioning, all old versioning object still keep, when you update new object, new object will given versionIds of null.


- Charge will be calculated by how space all versions of object taking.

### Host static website

- Hosting your own static website is one of the richest feature in S3. After uploading your artifact, all thing need to host your static site is enable static website hosting and pointing out the index and error page.

![Hosting static website](/media/s3/s3_static_web.png)
- Your site will be serve in the same region with S3.
- Bucket must be set public-read ACL to serve static website
- To improve the performance, you can leverage AWS Cloudfront as CDN.

### Events

- Designed to integrate with other AWS services (AWS Lambda) to execute asynchronous actions
- Allow you fire you trigger when you added, updated or removed object in your S3.

![Events](/media/s3/s3_event.png)
- Current supported triggers:
    - __SNS__
    - __SQS__
    - __Lambda__

### Life cycle


A life-cycle configuration is a set of rules that define actions that Amazon S3 applies to a group of objects or to bucket itself to move objects from one storage system to another and finally expiring it. We can define amazon s3 to move data between various storage class on defined schedule.

There are two types of actions:
- __*Transition actions*__: Define when objects transition to another storage class. For example, you might choose to transition objects to the *STANDARD_IA* storage class 30 days after you created them, or archive objects to the *GLACIER* storage class one year after creating them


- __*Expiration actions*__: Define when objects expire. Amazon S3 deletes expired objects on your behalf.

### Transfer acceleration


It enables fast, easy and secure transfer of a file over the long distance between client and S3 bucket.

The edge location around the world provided by Amazon cloud front are taken advantage of transfer acceleration.

It works via carrying data over an optimized network bridge that keep running between CloudFront and S3 location.

We can enable Transfer Acceleration by going into properties of the bucket, then turning this feature on.

![Transfer Acceleration](/media/s3/s3_transfer_accleration.png)

After enabling this feature, please use acceleration endpoint to consume your S3 bucket

### CORS

If you use your S3 to serve your assets (Javascript file, CSS File ...), then you need to access them from your origin (not S3 origin), you can configure CORS in S3 to enable your origin can access your file in S3

![CORS](/media/s3/cors.png)

The following example cors configuration has three rules, which are specified as CORS Rule elements:

- The first rule allows cross-origin PUT, POST, and DELETE requests from the http://www.example1.com origin. The rule also allows all headers in a preflight OPTIONS request through the Access-Control-Request-Headers header. In response to preflight OPTIONS requests, Amazon S3 returns requested headers.
- The second rule allows the same cross-origin requests as the first rule, but the rule applies to another origin, http://www.example2.com.
- The third rule allows cross-origin GET requests from all origins. The * wildcard character refers to all origins.

```xml
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>http://www.example1.com</AllowedOrigin>

   <AllowedMethod>PUT</AllowedMethod>
   <AllowedMethod>POST</AllowedMethod>
   <AllowedMethod>DELETE</AllowedMethod>

   <AllowedHeader>*</AllowedHeader>
 </CORSRule>
 <CORSRule>
   <AllowedOrigin>http://www.example2.com</AllowedOrigin>

   <AllowedMethod>PUT</AllowedMethod>
   <AllowedMethod>POST</AllowedMethod>
   <AllowedMethod>DELETE</AllowedMethod>

   <AllowedHeader>*</AllowedHeader>
 </CORSRule>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>
   <AllowedMethod>GET</AllowedMethod>
 </CORSRule>
</CORSConfiguration>
```

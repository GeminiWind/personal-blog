---
title: 'AWS Series: S3'
date: '2019-07-05'
---
![photo](s3.jpg)
<br>
Amazon S3 or Amazon Simple Storage Service is a service offered by Amazon Web Services (AWS) that provides object storage which is built for storing and recovering any amount of information or dât from anywhere over the Internet.
<br>
<br>
Common use cases for S3:
- Backup and archive for on-premises or cloud data
-Content, media, and software storage and distribution
- Big data analytics
- Static website hosting
- Cloud-native mobile and Internet application hosting
- Disaster recovery

## Storage Classes
<br>
<br>

Amazon S3 offers the following storage classes for the objects that we store.
  - __STANDARD__: for general-purpose storage of frequently accessed data.
  STANDARD is the default storage class. Availability: 99.99%, durability: 99.999999999%  multi Availability Zone
  - __INTELLIGENT_TIRING__: for data with unknown or changing access patterns. Availability: 99.9%, durability: 99.999999999% multi Availability Zone
  - __STANDARD_IA__: optimized for long-lived, but less frequently accessed data, for example, backups and older data where the frequency of access has diminished, but the use case still demands high performance.
  Availability: 99.9%, durability: 99.999999999% multi Availability Zone
  - __ONE ZONED-IA__: for long-lived,less frequently accessed data, but requires rapid access when needed. Availability: 99.5% in single Availability Zone, durability: 99.999999999% single Availability Zone
  - __GLACIER__: is suitable for archiving data where data access is infrequent. It may take some minutes to hours to retrieve data in Glacier. Durability: 99.999999999% multi Availability Zone.
  - __GLACIER DEEP ARCHIVE__: long-term retention and digital preservation for data that may be accessed once or twice in a year. durability: 99.999999999% multi Availability Zone, take within 12 hours to retrieve data

## Object
<br>
<br>

Amazon S3 is a simple key, value store designed to store as many objects as you want. You store these objects in one or more buckets. An object consists of the following:
- Key — The name that you assign to an object. You use the object key to retrieve the object.
- Version ID — Within a bucket, a key and version ID uniquely identify an object
- Value — The content that we are storing
- Metadata — A set of name-value pairs with which you can store information regarding the object.
- Subresources — Amazon S3 uses the subresource mechanism to store object-specific additional information.
- Access Control Information — We can control access to the objects in Amazon S3.

## Bucket
<br>
<br>
Before we store any data into S3, we first have to create a Bucket. A bucket is similar to how we create a folder on the local system.
<br>
<br>
The bucket name must be unique across all of the AWS accounts. It must be at least 3 and no more than 63 characters long.
<br>
<br>
Bucket was allocated on the region you specify
<br>
<br>
No limit on how much of data that we can store inside a bucket.

> By default, you can create up to 100 buckets in each of your AWS accounts. If you need additional buckets, you can increase your bucket limit by submitting a service limit increase.

### Server logging

- Track request access to S3 bucket.
- Below is the metric of the log.
<br>
![photo](s3_log.png)

- Log file will be store in __.TXT__
- Target log bucket must be different with the current bucket but they must be the same region.
- Log metrics can be consumed later by Athena or ELK stack.

### Versioning

- Versioning automatically keeps up with different versions of the same object. For example, say that you have an object (object1) currently stored in a bucket. With default settings, if you upload a new version of object1 to that bucket, object1 will be replaced by the new version. Then, if you realize that you messed up and want the previous version back, you are out of luck unless you have a backup on your local computer. With versioning enabled, the old version is still stored in your bucket, and it has a unique Version ID so that you can still see it, download it, or use it in your applications.


- Turn on versioning will make uploading new object in bucket will return version Id. This version Id will be used to retrieve object. For the object existing previous turn versioning on, version Id will be null.


- Deleting the versioning object only mark deleting the latest version, the old versions still stored.


- Versioning can not be completely disabled, we can only turn enable status to suspend. It mean when you suspend versioning, all old versioning object still keep, when you update new object, new object will given versionIds of null.


- Charge will be calculated by how space all versions of object taking.

### Host static website

- S3 can host static website with domain provided by S3 or you can use your own custom domain.
<br>
![photo](s3_static_web.png)
- Your site will be serve in the same region with S3. You can combine AWS S3 host static vs AWS CloudFront as CDN to distribute your files
- Bucket must provide public-read ACL to serve static website

### Events
<br>
<br>

- Desgined to integrate with other AWS services
- S3 has Events, allow you fire you trigger when you added, updated or removed in your S3.
<br>
![photo](s3_event.png)
- Current supported triggers:
    - SNS
    - SQS
    - Lambda

### Life cycle
<br>
<br>
A lifecycle configuration is a set of rules that define actions that Amazon S3 applies to a group of objects or to bucket itself to move objects from one storage system to another and finally expiring it. We can define amazon s3 to tom move data between various storage class on defined schedule

There are two types of actions:
- Transition actions: Define when objects transition to another storage class. For example, you might choose to transition objects to the STANDARD_IA storage class 30 days after you created them, or archive objects to the GLACIER storage class one year after creating them


- Expiration actions: Define when objects expire. Amazon S3 deletes expired objects on your behalf.

## Transfer acceleration
<br>
<br>
It enables fast, easy and secure transfer of a file over the long distance between client and S3 bucket.
<br>
<br>
The edge location around the world provided by Amazon cloud front are taken advantage of transfer acceleration.
<br>
<br>
It works via carrying data over an optimized network bridge that keep running between CloudFront and S3 location.
<br>
<br>

We can enable Transfer Acceleration by going into properties of the bucket.
<br>
![photo](s3_transfer_accleration.png)

 

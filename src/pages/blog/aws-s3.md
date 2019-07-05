---
title: 'AWS Series: S3'
date: '2019-07-05'
---

## TL&DR
- S3 is cloud storage service in AWS. It will store your file in key-value.
- Most useful features: server logging, versioning, host static website, transfer acceleration, events, life cycle
- S3 is quite cheap

## Terms
- Bucket: name of S3 bucket will store your files
- Key: the key for your file in S3 bucket. Key will be used to manipulate file in S3

### Server logging

- Track request access to S3 bucket.
- Below is the metric of the log.

![photo](s3_log.png)

- Log file will be store in __.TXT__
- Target log bucket must be different with the current bucket but they must be the same region.
- Log metrics can be consumed later by Athena or ELK stack.

### Versioning

- Versioning automatically keeps up with different versions of the same object. For example, say that you have an object (object1) currently stored in a bucket. With default settings, if you upload a new version of object1 to that bucket, object1 will be replaced by the new version. Then, if you realize that you messed up and want the previous version back, you are out of luck unless you have a backup on your local computer. With versioning enabled, the old version is still stored in your bucket, and it has a unique Version ID so that you can still see it, download it, or use it in your applications.


- Turn on versioning will make uploading new object in bucket will return version Id. This version Id will be used to retrieve object. For the object existing previous turn versioning on, version Id will be null.

- Deleting the versioning object only mark deleting the latest version, the old versions still stored.

- Versioning can not be completely disabled, we can only turn enable status to suspend. It mean when you suspend versioning, all old versioning object still keep, when you update new object, new object will given versionIds of null

- Charge will be calculated by how space all versions of object taking.

### Host static website

- S3 can host static website with domain provided by S3 or you can use your own custom domain.
- Specify the index page and error page. That's all :)

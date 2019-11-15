---
title: "AWS - Working with NoSQL in AWS: DynamoDB"
date: "2019-07-19T22:40:32.169Z"
template: "post"
draft: false
slug: "/amazon-web-services/working-with-aws-dynamodb"
category: "AWS"
tags:
  - "AWS 101"
  - "DynamoDB"
  - "NoSQL"
description: "Amazon DynamoDB is a fully managed proprietary NoSQL database service that supports key-value and document data structures and is offered by Amazon.com as part of the Amazon Web Services portfolio."
socialImage: "/media/dynamodb/dynamodb.png"
---


DynamoDB is a managed NoSQL database provided by AWS, and it is a highly scalable and reliable database.


Common use cases for DynamoDB:

- Storage flexible structured data
- Handle large volume of data
- Streaming data

  >  *[AWS 101](http://blog.haidv.me/tag/aws-101/) is an original series for developer to get started with AWS, actually it's my note and summary I've made in working with AWS in our project*

    - Part 1: [Getting Started With Simple Storage Object (S3)](https://blog.haidv.me/amazon-web-services/getting-started-with-aws-s3)
    - Part 2: [Working with NoSQL in AWS: DynamoDB](https://blog.haidv.me/amazon-web-services/working-with-aws-dynamodb)
    - Part 3: [EC2: The Backbone of AWS](https://blog.haidv.me/amazon-web-services/ec2-the-backbone-of-aws)
    - Part 4: [SQS: Do you know queue in AWS](https://blog.haidv.me/amazon-web-services/do-you-know-queue-in-aws)
    - Part 5: [Configure SNS to send your notification](https://blog.haidv.me/amazon-web-services/configure-sns-to-send-your-notification)
    - Part 6: [Manage your network in Cloud with VPC](https://blog.haidv.me/amazon-web-services/manage-your-network-in-cloud-with-vpc)


## Table

DynamoDB organizes data as tables and each table contains several items (rows) and each item has __Keys__ and __Attributes__ (columns).


The tables in the DynamoDB are non relational and non schema based.


When we create the table, beside specifying table name, we need specify primary key, we can’t change these later but rest of the attributes (columns) of item (row) can change. DynamoDB supported two type of primary key as the followings:

  - __Hash Primary Key__: need only one attribute to create primary key. DynamoDB build hash index __without order__ for primary key.
  - __Hash & Range Primary Key__: need two attributes to create primary key, one is __hash attribute__ and the other is __range attribute__. DynamoDB build hash index __without order__ for hash attributes and range index __with order__ for range attribute. This is allowed the case two item has the same hash attribute but different range attribute exists in the same table

You can also determine your throughput for your table through 2 metrics

  - __Read capacity unit__: determine the volume of data will read in strong consistency mode. Each unit will be 4Kb. For example, you need to read 16kb average per second, your read capacity unit should be 4.
  - __Write capacity unit__: determine the number of write for table. Each write will be has 1kb.


## Item

A DynamoDB item is nothing but a row in the table.

We can change any attribute of an item except its keys, these keys are an identification for an item; if we have to change these keys, then the only option is to delete an item and create it again.


## Data Types

DynamoDB supports different data types for attributes of an item, they can be mainly categorised into the following:
- __Scalar Types__ : Number, String, Binary, Boolean and Null.
- __Document Types__ : List and Map
- __Set Types__ : Number Set, String Set, and Binary Set.

## Reading mode

DynamoDB supports two read modes:

 - __Strongly consistent__: it gurantees that  your data is always latest.
 - __Eventually consistent__: it gurantees that your data will be replicate in all partion but the data is not the latest at the particular time.


## Secondary Index

Amazon DynamoDB provides fast access to items in a table by specifying primary key values. But if you want to fetch the data of attributes other than the primary key, indexing comes into the picture.


DynamoDb provides two types of indexing:

- __Global secondary index__: This index includes a partition key and sort key, which may differ from the source table. It uses the label “global” due to the capability of queries/scans on the index to span all table data, and over all partitions. Hence, it has differ throughput with the table.


- __Local secondary index__: This index shares a partition key with the table, but uses a different sort key. Its “local” nature results from all of its partitions scoping to a table partition with identical partition key value.


## Query


To query table we must pass primary key so selecting proper primary key for the table is important. Query operation will return all items that are matched with primary key of the table.



__Note__: condition could not be used with primary key


Range key is optional and can combine with supported conditional

```bash
a = b — true if the attribute a is equal to the value b
a < b — true if a is less than b
a <= b — true if a is less than or equal to b
a > b — true if a is greater than b
a >= b — true if a is greater than or equal to b
a BETWEEN b AND c — true if a is greater than or equal to b, and less than or equal to c
```
Maximum response will be 1 MB


Query supported both strongly consistent and eventually consistent


All return item will be caculated as one query operation. For e.g: 100 1KB item => 100 x 1KB / 4KB = 25 reads


## Scan


Scan operation doesn’t require primary key to fetch results from the table. As the name suggests, it scans an entire table to filter results based on attribute values passed as filters.


Scan can be used in both table and secondary index


Maximum response will be 1 MB



__Note__:

- Do not scan the big table
- Bigger and bigger your table is, the greater and grater response time is


## Pagination

DynamoDB Query/Scan results return maximum of 1MB response size so if our request matches an items of size more than 1MB, it gets automatically divided into pages. 


In such cases DynamoDB returns a special response parameter “LastEvaluatedKey” and this can be used to fetch next page results. Please note we need to pass the value of “LastEvaluatedKey” as “ExclusiveStartKey” in the next request to DynamoDB.


In some cases we might want to fix page size to number such as 10 or 20 results per page. In those cases we can use the “Limit” parameter. Please note if the results matching to the “Limit” is more than 1MB then DynamoDB only returns subset of the results which fits to 1MB limit.



## Sorting


When we use Query/Scan operation on a DynamoDB table, then by default the results are sorted based on Sort Key value of the table. Incase we want that results in reverse order then we need to pass “ScanIndexForward” as “false” in query/scan request parameters. 


If the data type of Sort key is a number, then the results will be in a numeric order, otherwise, results will be in UTF-8 bytes. By default sort order is ascending. To get results in a descending order, pass “ScanIndexForward” as “false”.


## Pricing

- _On-Demand Capacity_: is the simplest pricing model around - you pay for storage and requests, and that’s all. No capacity planning or prediction. You pay $1.25 per million writes, and $0.25 per million reads
- _Provisioned Capacity_: is most common pricing method for DynamoDB, you  pay-per-capacity.You pay to provision a certain throughput for your DynamoDB table, say 100 Read Capacity Units (RCUs) which gives 100 strongly-consistent 4KB reads per second. Single RCU-hour at $0.00013.
- _Reserved Provisioned Capacity_: Much like Reserved Instances in EC2, reserved capacity in DynamoDB lets you get a discounted price for committing to a certain amount of usage up front. The cost is the same units as Provisioned Capacity, but you buy one or three-year reservations in units of 100 RCUs or WCUs.

## References

- _DynamoDB Guide_: https://www.dynamodbguide.com
- _Core concepts of Amazon DynamoDB_: https://medium.com/tensult/core-concepts-of-amazon-dynamodb-a265a3fc70a
- _Data Modeling in AWS DynamoDB_: https://medium.com/swlh/data-modeling-in-aws-dynamodb-dcec6798e955
- _Advanced Design Patterns for Amazon DynamoDB_: https://medium.com/@nabtechblog/advanced-design-patterns-for-amazon-dynamodb-354f97c96c2 
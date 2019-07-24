---
title: 'AWS Series: SNS'
date: '2019-07-24'
---
![photo](../../../images/blog/aws/sns/sns.png)
<br>
Amazon Simple Notification Service (Amazon SNS) is a web service that coordinates and manages the delivery or sending of messages to subscribing endpoints or clients. 
<br>
<br>
In Amazon SNS, there are two types of clients—publishers and subscribers—also referred to as producers and consumers. Publishers communicate asynchronously with subscribers by producing and sending a message to a topic, which is a logical access point and communication channel. Subscribers (i.e., web servers, email addresses, Amazon SQS queues, AWS Lambda functions) consume or receive the message or notification over one of the supported protocols (i.e., Amazon SQS, HTTP/S, email, SMS, Lambda) when they are subscribed to the topic. 
<br>
<br>
![photo](../../../images/blog/aws/sns/arch.png)
<br>
<br>
Common use case you can take advantage of SNS:

- Fanout: The "fanout" scenario is when an Amazon SNS message is sent to a topic and then replicated and pushed to multiple Amazon SQS queues, HTTP endpoints, or email addresses. This allows for parallel asynchronous processing. For example, you could develop an application that sends an Amazon SNS message to a topic whenever an order is placed for a product. Then, the Amazon SQS queues that are subscribed to that topic would receive identical notifications for the new order. The Amazon EC2 server instance attached to one of the queues could handle the processing or fulfillment of the order while the other server instance could be attached to a data warehouse for analysis of all orders received.
<br>
![photo](../../../images/blog/aws/sns/sns-fanout.png)
<br>
- Application and System Alerts: Application and system alert, when they are trigger by exceeding predefined threshold, could be seen as notification through SNS
- Push Email and Text Messaging: Push email and text messaging are two ways to transmit messages to individuals or groups via email and/or SMS. For example, you could use Amazon SNS to push targeted news headlines to subscribers by email or SMS.
- Mobile Push Notifications: Mobile push notifications enable you to send messages directly to mobile apps. For example, you could use Amazon SNS for sending notifications to an app

## Topic
<br>
<br>

Topics are the fundamental concept for message routing in a pub-sub architecture: Many subscribers listen to a topic and are notified whenever something publishes a message on that topic. Basically, it’s like JavaScript events, but you have to create a topic before you can subscribe
<br>
<br>
![photo](../../../images/blog/aws/sns/create_topic.png)
<br>
<br>

## Publishing A Message to Topic
<br>
<br>

To publish message in a topic, it's very simple, you must specify your message body and choose topic (they are mandatory) and subject(optional).
<br>
<br>
![photo](../../../images/blog/aws/sns/publish_message.png)
<br>
<br>

## Subscribing to a topic
<br>
<br>

To retrieve a published message from topic, you need to create subscription.

AWS SNS support a bunch of protocol for subscription for your desired design
- HTTP
- HTTPS
- Email
- Email-JSON
- Amazon SQS
- Amazon Lambda
- Platform application endpoint
- SMS
<br>
<br>
![photo](../../../images/blog/aws/sns/create_subscription.png)
<br>
<br>

__Note__: Your handler should be capable of handling two type of SNS message: Notification and ConfirmSubscription. To confirm subscription to a topic, you must visit `SubscriberURL` in the payload (throught GET method).
<br>
<br>

## Pricing

- Publishes
  - Includes publish, topic owner operations, and subscriber operations, but not deliveries
  - First 1 million Amazon SNS requests per month are free
  - $0.50 per 1 million Amazon SNS requests thereafter
  - Amazon SNS currently allows a maximum limit of 256 KB for published messages. Each 64KB chunk of published data is billed as 1 request. For example, a single API call with a 256KB payload will be billed as four requests.


- Notification deliveries
  - Platform application endpoint: 0.5$ per 1M transmission
  - SMS: differ in each region
  - email/email-JSON: $2 per 100 000
  - HTTP/s: $0.6 per 1M

__Note__: Each 64KB chunk of delivered data is billed as 1 request. For example, a single notification with a 256KB payload will be billed as four deliveries.
<br>
<br>

## References 

- Amazon Simple Notification Service Sample: _https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples.html_
- Publishing AWS SNS messages to browsers: _https://deepstreamhub.com/blog/publishing-aws-sns-messages-to-browsers-tutorial/_
- What is Amazon Simple Notification Service?: _https://docs.aws.amazon.com/sns/latest/dg/welcome.html_
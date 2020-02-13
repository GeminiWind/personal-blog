---
title: "Encryption: RSA Algorithm with example"
date: "2020-02-13T22:40:32.169Z"
template: "post"
draft: false
slug: "/explain-rsa-algorithm-with-example"
category: "AWS"
tags:
  - "RSA"
  - "Encryption"
description: "Explain RSA Algorithm in the shortest and easiest way along with example"
---

In the university, I bet that all of us has studied how RSA works. However, in that time, we don't truly understand the important of cryptography as well as RSA algorithm. Therefore, in this article, we 'll look back to RSA. What is RSA ? How it work ? Where is it apply ?

## Brief introduction

- RSA (Rivest–Shamir–Adleman) is one of the first public-key cryptosystems and is widely used for secure data transmission.
- The acronym RSA is made of the initial letters of the surnames of Ron Rivest, Adi Shamir, and Leonard Adleman, who first publicly described the algorithm in 1977.
- RSA is one of the cipher suites used in Transport Layer Security, which is used by HTTPS.

## Operation

1. Choose two different large random prime numbers *__p__* and *__q__*
2. Calculate *__n = p * q__*
    - *__n__* is the modulus for the public key and the private keys
3. Calculate the totient: *__Φ(n)=(p-1)(q-1)__*
4. Choose an integer *__e__* such that 1 < e <  Φ(n) and e is co-prime to n
    - e is released as the public key exponent
5. Compute d as the following formular:  *__d = e^(-1) mod Φ(n)__*
    - d is kept as the private key exponent

## Encrypting message

Alice gives her public key (n & e) to Bob and keeps her private key secret. Bob wants to send message M to Alice.

The cipher text c will be computed as the following way

  _**c = m^e mod n**_

## Decrypting message 

Alice can recover m from c by using her private key d in the following procedure:
  
  _**m = c^d mod n**_

## Example

1. Choose random large prime number p = 61 and q = 53
2. n = q * q = 61 * 53 = 3233
3. Φ(n) = (p-1)(q-1) = 60*52 = 3120
4. Find e: e> 1 and e is co-prime to 3120 => e = 17
5. Find d = 2753

- Encryption: (m = 88): c= m^17 mod 3233 = 88 ^ 17 mod 3233 = 1525
- Decryption: m = 1525^2753 mod 3233 = 88



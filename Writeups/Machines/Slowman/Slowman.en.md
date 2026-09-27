

![1](</Writeups/Machines/Slowman/img/logo.png>)

By Rug4lo

## Reconnaissance 

We can start with the usual nmap scan 
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn 192.168.56.102
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-12-04 19:32 CET
Initiating ARP Ping Scan at 19:32
Scanning 192.168.56.102 [1 port]
Completed ARP Ping Scan at 19:32, 0.05s elapsed (1 total hosts)
Initiating SYN Stealth Scan at 19:32
Scanning 192.168.56.102 [65535 ports]
Discovered open port 22/tcp on 192.168.56.102
Discovered open port 80/tcp on 192.168.56.102
Discovered open port 3306/tcp on 192.168.56.102
Discovered open port 21/tcp on 192.168.56.102
Completed SYN Stealth Scan at 19:32, 26.37s elapsed (65535 total ports)
Nmap scan report for 192.168.56.102
Host is up, received arp-response (0.00051s latency).
Scanned at 2023-12-04 19:32:11 CET for 26s
Not shown: 65530 filtered tcp ports (no-response), 1 closed tcp port (reset)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE REASON
21/tcp   open  ftp     syn-ack ttl 64
22/tcp   open  ssh     syn-ack ttl 64
80/tcp   open  http    syn-ack ttl 64
3306/tcp open  mysql   syn-ack ttl 64
MAC Address: 08:00:27:8B:EE:D6 (Oracle VirtualBox virtual NIC)

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.58 seconds
           Raw packets sent: 131086 (5.768MB) | Rcvd: 26 (1.124KB)
```
This machine has a website, but while enumerating it I didn't find anything interesting  

![1](</Writeups/Machines/Slowman/img/1.png>)

We can also see that port 21 is open (in this case we won't run nmap's default scripts because they won't report anything interesting), so we can try connecting to see if it exposes any shared resource

![1](</Writeups/Machines/Slowman/img/2.png>)

If we download this file and open it we'll see a user of the mySQL database (which is running on port 3306)

![1](</Writeups/Machines/Slowman/img/3.png>)

With a username in hand we can try brute forcing with hydra, in this case I'll use rockyou.txt

![1](</Writeups/Machines/Slowman/img/4.png>)

Perfect, we have the password, now we can connect to the database to see if there are more credentials 

![1](</Writeups/Machines/Slowman/img/5.png>)

In the trainers_db database we can see there's a table called users, and if we look at its contents we'll see a username and a password, along with a path to log in

![1](</Writeups/Machines/Slowman/img/6.png>)

If we browse to that path and enter the username and password we just got, we'll see that it lets us in

![1](</Writeups/Machines/Slowman/img/7.png>)

Once inside we see a folder containing a file called credentials.zip

![1](</Writeups/Machines/Slowman/img/8.png>)

We can download it and unzip it, but we'll see that it's password protected 

![1](</Writeups/Machines/Slowman/img/9.png>)

We can try john to brute force this zip 

To do that we first use zip2john

![1](</Writeups/Machines/Slowman/img/10.png>)

Now let's start the brute force with john (in my case, since I had already cracked it, it shows up in --show)

![1](</Writeups/Machines/Slowman/img/11.png>)

With the password we unzip the file, which contains a file called credentials.txt

![1](</Writeups/Machines/Slowman/img/12.png>)

Seeing that the password is hashed we can crack it with john

![1](</Writeups/Machines/Slowman/img/13.png>)

With the username and password we can connect over ssh and grab the user flag

![1](</Writeups/Machines/Slowman/img/14.png>)

Now we can start privilege escalation, and for that we'll check the usual things (SUID, kernel, capabilities, sudo -l)

We can see that python has the cap_setuid=ep capability, which will let us escalate privileges

![1](</Writeups/Machines/Slowman/img/15.png>)

To get a shell as root we'll have to do this:

GTFOBINS --> https://gtfobins.github.io/gtfobins/python/

![1](</Writeups/Machines/Slowman/img/16.png>)

With this we're already root, and we have the flag in /root/root.txt

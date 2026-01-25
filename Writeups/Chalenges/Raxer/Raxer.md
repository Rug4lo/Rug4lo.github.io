

# Descripción general

Este desafío tiene las siguientes especificaciones:

- **Técnicas**: Ingeniería inversa estática → Análisis de algoritmos → Generador automático de claves
- **Desafío**: https://crackmes.one/crackme/5ed5b3c833c5d449d91ae6d0
- **Plataforma**: Windows - x64 (64 bits)
- **Lenguaje**: C/C++

# Solución

En esta ocasión vamos a resolver un sencillo desafío para Windows de la plataforma crackmes.one.

Empezamos descargando el binario y ejecutándolo. Vemos que nos pide una contraseña, como es habitual en crackmes.

![1](</Writeups/Chalenges/Raxer/img/1.png>)

Abrimos IDA y echamos un vistazo al código de este programa.

Este programa no tiene una función Main, pero sí tiene una función start. Podemos ver que aquí es donde se encuentra la parte principal del programa.

![1](</Writeups/Chalenges/Raxer/img/2.png>)

Podemos resolver este desafío con el pseudocódigo proporcionado por IDA, pero como es un desafío sencillo, practiquemos con Assembly.

He marcado la parte mas importante del código, pero vamos a diseccionarlo por partes

![1](</Writeups/Chalenges/Raxer/img/3.png>)

Primero mete la dirección de memoria de `loc_400418` en el `rax`

![1](</Writeups/Chalenges/Raxer/img/4.png>)

Y mueve esto al `rsi` por lo que en el `rsi` pasa a tener la dirección de memoria `loc_400410` 

![1](</Writeups/Chalenges/Raxer/img/5.png>)

El programa va mostrando en pantalla los varios mensajes que no nos interesan
Hasta que almacena en la variable `r8` la dirección de memoria que contiene esta string `BGOTHXIY`

![1](</Writeups/Chalenges/Raxer/img/6.png>)

Si saltamos un poco podremos ver que estamos ante un bucle, aumenta el rax en 1 cada vez hasta que llegue a `0D` que en decimal seria `13` ( en caso de que el `rax` no sea `13` salta a `loc_400452` que es el principio del bucle )

![1](</Writeups/Chalenges/Raxer/img/7.png>)

Por lo que rax es un Index y el bucle se ejecuta 13 veces, así que como en cada bucle comprueba un carácter de nuestra contraseña podemos suponer que necesitamos una contraseña de 13 caracteres

Vamos a analizar el bucle, lo primero que hace es coger el primer carácter de la contraseña que le pasemos y lo almacena en la variable `dl`

![1](</Writeups/Chalenges/Raxer/img/8.png>)

Después suma `rax` + `rsi` (que apunta a `loc_400418`) y lo almacena en el `rcx`, esto hace que en la primera vuelta tenga el valor que hay en `loc_400418`, en la segunda vuelta en `loc_400419` y así

![1](</Writeups/Chalenges/Raxer/img/9.png>)

Ahora hace un `and` al valor que hemos almacenado en el `rcx` y lo compara con un `7`

![1](</Writeups/Chalenges/Raxer/img/10.png>)

Internamente lo que esta haciendo es coger el valor que hay en `ecx` (por ejemplo `0x48`) lo convierte a binario y lo compara con el numero `7` en binario, bit a bit aplica el and, y se queda con los últimos 3 bits del resultado:

```
01001000 ← ecx (0x48)
00000111 ← 7 
------------ 
00000000 ← resultado (coge los 3 ultimos bits)
```

Esta operación `and` va a dar un numero del 0 al 7, que es el tamaño exacto de la cadena de caracteres `BGOTHXIY` almacenada en `r8`

Por lo que lo siguiente que hace es usar este valor del 0 al 7 para coger un valor de esa string `BGOTHXIY` (Ej. si el and nos diera `3` cogerá la `T`)
Este carácter lo compara con el de nuestra contraseña, así las 13 veces 

![1](</Writeups/Chalenges/Raxer/img/11.png>)

Comprendiendo esto podemos hacer un script que haga este proceso en nuestro ordenador, pero para ello necesitaremos los valores de la dirección `loc_400418`, podemos verlos en la vista hexadecimal de IDA, si empezamos desde el `400418` y le vamos sumando 13 acabamos con estos valores

```
48, 8D, 05, F9, FF, FF, FF, 48, 89, C6, 48, 8D, 0D
```

![1](</Writeups/Chalenges/Raxer/img/12.png>)

Con esto tenemos todo lo necesario para a hacer el script que  nos genere la contraseña
En mi caso lo he echo en Python ya que es a lo que estoy mas acostumbrado

```python
eax = [0x48, 0x8D, 0x05, 0xF9, 0xFF, 0xFF, 0xFF, 0x48, 0x89, 0xC6, 0x48, 0x8D, 0x0D]

string = "BGOTHXIY"

def create_pass():
    i = 0
    password = ""
    while i != 13:
        idx = eax[i] & 7
        char = string[idx]
        password = char + password
        i += 1

    password = "".join(reversed(password)) # Invertimos la contraseña
    print("Final password:", password)
    print(f"Longitud: {len(password)} caracteres") 

if __name__ == '__main__':
    create_pass()
```

Probamos a ejecutar el script y nos dará la contraseña `BXXGYYYBGIBXX`

![1](</Writeups/Chalenges/Raxer/img/13.png>)

Finalmente comprobamos si esta es la contraseña correcta

![1](</Writeups/Chalenges/Raxer/img/14.png>)

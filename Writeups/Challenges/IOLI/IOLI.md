

## Overview

Los **Retos de IOLI** se crearon hace varios años con el objetivo de ayudar a los usuarios a aprender **ingeniería inversa**, centrándose inicialmente en el uso de **Radare2**.  
Sin embargo, los binarios se pueden analizar con cualquier desensamblador o depurador. En mi caso, utilizo **IDA**.

Todos los retos comparten las siguientes características:

- Binarios Windows **x86 (32 bits)**
- Dificultad progresiva a lo largo de los niveles
- Centrados en el **análisis estático y reversing**, no en la explotación

Empiezan siendo muy sencillos y se van complicando gradualmente a medida que aumentan los niveles. 

Dado que estos retos están diseñados para reversing, para mí el principal reto no es conseguir una flag, sino aprender lo máximo posible sobre este binario utilizando IDA (en mi caso).

Por lo tanto, hay varios retos que son muy similares entre sí y solo cambian la composición interna de las funciones o variables.

## IOLI Level 0x00

Primer reto de todos, simplemente usamos el comando strings para ver las cadenas de texto del binario y encontraremos claramente la contraseña

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/1.png>)

Probamos con la contraseña 250382 y podemos ver como nos da el visto bueno

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/2.png>)

Podemos hacer esto también con IDA, ya sea viendo el flujo del programa

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/3.png>)

O usando strings en IDA desde el menú **View → Open subviews → Strings**

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/4.png>)

## IOLI Level 0x01

En este segundo reto podemos ver que no somos capaces de visualizar la contraseña con strings

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/1.png>)

Por lo que podemos mirar con ida o Ghidra

En mi caso lo voy a enseñar en IDA, si miramos el seudocódigo en c de la función Main de este programa podemos ver claramente te que hace un if buscando que la contraseña sea 5274

*Para ver este seudocodigo vamos a la función y pulsamos F5*

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/2.png>)

Comprobamos y correctamente esta es la contraseña

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/3.png>)

También podemos hacerlo sin el seudocódigo, buscamos en IDA una instrucción CMP en Assembly, que es para comparar valores, y vemos esto

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/4.png>)

si miramos el valor que esta comparando que es 149A y lo pasamos a decimal veremos que nos da 5274 que es la contraseña

*la h al final del valor es solo para identificar que esta en hexadecimal*

## IOLI Level 0x02

En este podemos hacer lo mismo que el anterior y ver el seudocódigo, lo que nos dará la contraseña, realmente este reto hace una serie de cálculos por para llegar a este numero, pero IDA por detrás lo hace automático

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/1.png>)

Si queremos ver bien de que va el reto podemos irnos a la instrucción en Assembly y desgranarla poco a poco, estas son las instrucciones que genera la contraseña

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/2.png>)

Vamos a resolverlo poco a poco
Empieza dándole valores 5A (en decimal seria 90) a var_8 y 1EC (en decimal seria 492) a var_C

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/3.png>)

Después mueve el valor del var_C a el edx 

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/4.png>)

Ahora mete la dirección de memoria de var_8 en el eax

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/5.png>)

Por lo que esencialmente en el edx tenemos 90 y en el eax tenemos var_8

Ahora lo que hace es sumar el edx al eax (se queda la suma en el eax que como este guarda la dirección de memoria de var_8 se queda en esa dirección de memoria) que dará 582
Así que ahora `var_8 = 582`

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/6.png>)

Ahora que el var_8 tiene el valor 582 mueve ese valor al eax por lo que `eax = 582`

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/7.png>)

Con imul lo que hacemos es multiplicar, en este caso multiplicamos `eax = 582 * var_8 = 582` lo que nos da `eax = 338724` que es la contraseña de este reto

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/8.png>)

El resto de instrucciones es mover la contraseña a var_C para compararlo con la información que le dará el usuario, esta se guardara en var_4

Ahora podemos comprobar si la contraseña es correcta

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/9.png>)

## IOLI Level 0x03

Metemos como siempre el archivo en IDA y vemos que como antes nos da el resultado ya el seudocódigo

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/1.png>)

Vamos igualmente a ver cual fue el proceso por detrás

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/2.png>)

Este es muy similar al anterior, solo cambia la parte final que en la comparación suma 18 a el valor de la contraseña final, también suma 18 a nuestro input por lo que la contraseña será la misma 

También podemos ver que la comparación esta en otra función

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/3.png>)

y que el texto para decir si la contraseña es correcta o incorrecta no es el mismo, se esta aplicando una función llamada shift, si vamos a esta podemos ver como lo que hace es rotar todos los caracteres -3 posiciones

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/4.png>)

Si lo comprobamos con Cybercheff podemos ver como sale el mensaje correcto, todo esto no es necesario hacerlo ya que tenemos la contraseña pero es curioso

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/5.png>)

Vamos a comprobar que efectivamente esa es la contraseña correcta y pasamos al siguiente reto

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/6.png>)

## IOLI Level 0x04

Empezamos inspeccionando el fichero con IDA, nos metemos en el Main y esta vez vemos algo curioso

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/1.png>)

No hay comparaciones en ningún lado, si nos ponemos a mirar el seudocódigo tampoco veremos la contraseña como antes, pero si nos fijamos hay dos funciones que se están llamando `_scanf` y `_chek` 

La función `_scanf` no tiene nada, pero `_chek` tiene alguna cosa interesante

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/2.png>)

Para no ir mirando instrucción a instrucción del Assembly podemos mirar el seudocódigo que nos genera IDA y veremos esto 

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/3.png>)

Esto parece ya mas prometedor, vemos cómo esta iterando por cada carácter de nuestro input, y lo suma a la variable v4, al final del bucle esa variable tendrá la suma de todos los dígitos de nuestra contraseña y se compara con 15

*En IDA podemos renombrar variables, para que se vea mas simple*

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/4.png>)

Por lo que vamos a comprobar si es correcto este razonamiento

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/5.png>)

Y como suponíamos funciona

## IOLI Level 0x05

Hacemos lo de siempre e inspeccionamos el fichero con IDA, nos encontraremos un reto muy similar al anterior, esta vez vemos que en vez de compararlo con 15 lo hace con 16

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/1.png>)

Así que podemos probar a poner 79 por ejemplo

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/2.png>)

No funciona, si nos ponemos a ver otra vez de vuelta el código y darnos cuenta que pasa a la función parell después del if, si vamos a esta función veremos que este hace otra comprobación adicional

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/3.png>)

Esta mirando si la contraseña que le hemos aportado es par, en caso que si lo sea nos dara el OK

Por lo que podemos probar en vez de 79 algo como 88

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/4.png>)

Y correctamente entramos sin problema

## IOLI Level 0x06

Pasamos a el séptimo reto, hacemos lo mismo que los anteriores e iremos directamente a IDA para analizar el binario

Ahora a el check le esta pasando la contraseña que estamos poniendo y una variable de entorno

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/1.png>)

En check hay una función parell, que a primera vista parece igual que en el anterior reto, pero si miramos bien podemos ver que esta vez le esta pasando 2 atributos a la funcion parell, nustra contraseña y la variable de entorno

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/2.png>)

Vamos a comprobar que ha cambiado en la función parell, y podemos ver un par de cosas nuevas, pero lo mas interesante es que crea una variable llamada result donde almacena el resultado que le va a dar el mandar a una nueva función dummy nuestra contraseña y la variable de entorno, vamos a ver que tiene esta nueva función.

*No se exactamente porque da 10 vueltas el bucle si dummy es correcto pero no influye en nada*

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/3.png>)

Esta función dummy parece estar haciendo un bucle, y comparando los tres primeros caracteres de la variable de entorno con LOLO

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/4.png>)

Por lo que siguiendo esa lógica si creamos una variable de entorno, que su nombre empiece por LOL deberíamos de pasar esta comprobación

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/5.png>)

Y efectivamente funciona

## IOLI Level 0x07

En este reto no tenemos un `_main` por lo que IDA nos pone directamente en la función de start, esta función no tiene la gran cosa asi que vamos a buscar el codigo principal del programa

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/1.png>)

Vamos a `sub_401140` y veremos que tampoco tiene nada interesante, pero al final de esta llama a la primera función del código principal del programa, por lo que la he renombrado como `_main`

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/2.png>)

Si vemos el seudocódigo de esta veremos que todo esta igual que en los anteriores retos, voy a ir renombrando las funciones para que me resulte mas sencillo seguir el flujo del programa, por lo que vamos a mirar si algo ha cambiado en la función que comprueba nuestra contraseña, la he llamado check

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/3.png>)

En esta tenemos un pequeño cambio, donde antes estaba el mensaje de "Contraseña incorrecta" ahora hay una función

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/4.png>)

Si nos metemos en esta función veremos que solo tiene el mensaje por lo que no nos sirve de nada

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/5.png>)

Por lo que vamos a entrar en la segunda función de comprobación a ver si hay algo distinto

Todo es muy similar pero podemos ver que hay una comprobación extra, donde comprueba que dword_406030 tenga el valor 1 para darnos el OK

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/6.png>)

Podemos mirar que valor tiene esta variable, y veremos que saca su valor directamente de la función que he renombrado como `check_envp`, que es la que comprueba que la variable de entorno empiece con LOL

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/7.png>)

Por lo que vamos a ver esta función y efectivamente esta poniendo esta variable en 1 cuando es correcta la comprobación

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/8.png>)

Así que esto se va a pasar si hacemos correctamente el paso de el reto anterior, parece una segunda comprobación pero a nosotros no nos afecta en nada

Comprobamos haciendo lo mismo que en el anterior reto y vemos como nos deja sin problemas

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/9.png>)

## IOLI Level 0x08

Vamos con el penúltimo reto de estos crackme, en este caso tenemos un `_main` otra vez, este parece muy similar a todos los anteriores, por lo que vamos a mirar la función `check`

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/1.png>)

Todo igual por ahora, la función `che`  es la que te dice que la contraseña es incorrecta, por lo que poco cambio ahí también

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/2.png>)

El parel parece totalmente igual a antes, pero con los nombres ya puestos, por lo que se ve claramente que la variable LOL es para la comprobación de la variable de entorno

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/3.png>)

La función `dummy` esta igual también, por lo que parece que es todo lo mismo que en el reto 0x07

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/4.png>)

Por lo que podemos probar a hacer lo mismo y correctamente nos dará el OK

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/5.png>)

No se muy bien para que era este reto, entiendo que es la versión ordenada de la 0x07, pero no hay gran cosa a parte de esto

## IOLI Level 0x09

Vale, volvemos a no tener un `_main`, por lo que empezamos en la función `start`

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/1.png>)

haremos todo como en el reto 0x07 hasta encontrar el código principal

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/2.png>)

Vamos ahora a ir función por función a ver si hay algo nuevo, el check parece estar igual, se realizan las mismas comprobaciones. 
Que la suma de los dígitos sea 0x10 (16 decimal) y, si se cumple esta primera condición, se llama a la función `check2`, que realiza el resto de comprobaciones.

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/3.png>)

Y el `check2` también parece estar igual, manda la variable de entorno a `check_envp` para que compruebe que esta empieza por LOL y después comprueba que la contraseña sea par, haciendo después la comprobación otra vez de que esta correcta la variable de entorno

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/4.png>)

Podemos comprobar y funciona igual que los anteriores

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/5.png>)

Si hay algo diferente a las demás que he notado, es que casi todo el código en este caso está en la variable `check`, desde IDA viendo el código Assembly podemos ver el bloque de instrucciones casi completo desde aquí

También hay mucho código innecesario que entiendo que esta puesto para molestarnos al hacer el reversing

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/6.png>)

Y esto es todo!
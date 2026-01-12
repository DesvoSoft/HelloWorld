---
layout: ../layouts/MarkdownLayout.astro
title: Fundamentos de Python
videoUrl: https://www.youtube.com/embed/5-sfG8BV8wU?autoplay=1&controls=0&loop=0&vq=hd1080
buttonText: JUST DO IT
---

# Python

## Fundamentos de la Programacion

### Operadores

#### Operadores Aritméticos

Se usan para realizar operaciones matemáticas básicas. Incluyen `+` (suma), `-` (resta), `*` (multiplicacion), `/` (division), `//` (division entera), `%` (modulo: devuelve el residuo de una division), y `**` (potenciacion).

#### Operadores de Comparacion

Comparan dos valores y devuelven un valor booleano (True o False). Incluyen `==` (igual a), `!=` (diferente de), `>` (mayor que), `<` (menor que), `>=` (mayor o igual que), y `<=` (menor o igual que).

#### Operadores Logicos

Se usan para combinar condiciones. Incluyen `and` (y), `or` (o), y `not` (no).

<br>
<hr>
<br>

### Variables y Tipos de Datos

Se utilizan para almacenar datos que pueden ser usados y manipulados en un programa.

<br>

##### Tipos de datos:

- Enteros | `int` | Numeros enteros sin decimales
- Flotantes | `float` | Numeros con parte decimal
- Cadenas de texto | `str` | Secuencias de caracteres
- Booleanos | `True` / `False` |

<br>
<hr>
<br>

### Estructuras de Datos

#### Listas

Son colecciones ordenadas de elementos que pueden ser de cualquier tipo. Se crean usando corchetes `[]` y se pueden modificar después de su creacion.

<br>

#### Métodos de listas en Python

Python tiene métodos utiles para manipular elementos en listas.
A continuacion una breve descripcion y ejemplos de algunos de los métodos más comunes:

<br>

##### append(x)

Agrega un elemento al final de la lista.

```python
lista = [1, 2, 3]
lista.append(4)
print(lista)  # Salida: [1, 2, 3, 4]
```

<br>

##### extend(iterable)

Extiende la lista añadiendo todos los elementos del iterable.

```python
lista = [1, 2, 3]
nueva_lista = [4, 5]
lista.extend(nueva_lista)
print(lista)  # Salida: [1, 2, 3, 4, 5]
```

<br>

##### insert(i, x)

Inserta un elemento en una posicion especifica.

```python
lista = [1, 2, 3]
lista.insert(1, 4)
print(lista)  # Salida: [1, 4, 2, 3]
```

<br>

##### remove(x)

Elimina la primera ocurrencia del elemento x.

```python
lista = [1, 2, 3, 2]
lista.remove(2)
print(lista)  # Salida: [1, 3, 2]
```

<br>

##### pop([i])

Elimina y devuelve el elemento en la posicion i. Si no se especifica i, elimina y devuelve el ultimo elemento.

```python
lista = [1, 2, 3]
elemento = lista.pop()
print(elemento)  # Salida: 3
print(lista)  # Salida: [1, 2]
```

<br>

##### clear()

Elimina todos los elementos de la lista.

```python
lista = [1, 2, 3]
lista.clear()
print(lista)  # Salida: []
```

<br>

##### index(x[, start[, end]])

Devuelve el indice de la primera ocurrencia de x.

```python
lista = [1, 2, 3, 2]
indice = lista.index(2)
print(indice)  # Salida: 1
```

<br>

##### count(x)

Devuelve el numero de veces que x aparece en la lista.

```python
lista = [1, 2, 3, 2, 2]
conteo = lista.count(2)
print(conteo)  # Salida: 3
```

<br>

##### sort(key=None, reverse=False)

Ordena la lista in-place. Ordena por defecto en orden ascendente. Se puede especificar una funcion de clave y un orden inverso.

```python
def ordenar_por_inverso(x):
    return -x

lista = [3, 1, 2]
lista.sort(key=ordenar_por_inverso, reverse=True)
print(lista)  # Salida: [3, 2, 1]
```

<br>

##### reverse()

Invierte el orden de los elementos de la lista in-place.

```python
lista = [1, 2, 3]
lista.reverse()
print(lista)  # Salida: [3, 2, 1]
```

<br>

#### Slicing (Corte) en Listas

El slicing en Python es una forma de obtener partes especificas de una lista. Imagina que tienes una lista como una fila de bloques de construccion y quieres tomar solo algunos bloques.

<br>

##### Ejemplo de Slicing

Supongamos que tienes esta lista de numeros:

```python
numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<br>

- **Obtener los primeros 3 numeros:**
  ```python
  primeros_tres = numeros[:3]  # [0, 1, 2]
  ```
  Aqui, `:3` significa “desde el principio hasta el indice 3 (sin incluirlo)”.

<br>

- **Obtener los ultimos 3 numeros:**
  ```python
  ultimos_tres = numeros[-3:]  # [7, 8, 9]
  ```
  Aqui, `-3:` significa “desde el indice -3 (tercer ultimo) hasta el final”.

<br>

- **Obtener numeros del indice 3 al 6:**
  ```python
  intermedio = numeros[3:7]  # [3, 4, 5, 6]
  ```
  Aqui, `3:7` significa “desde el indice 3 hasta el indice 7 (sin incluirlo)”.

<br>

#### Slicing con Pasos

Puedes usar slicing para saltar elementos usando un tercer valor llamado “paso”.

- **Obtener cada segundo numero:**
  ```python
  cada_segundo = numeros[::2]  # [0, 2, 4, 6, 8]
  ```
  Aqui, `::2` significa “toma cada segundo numero”.

<br>

- **Obtener la lista al revés:**
  ```python
  al_reves = numeros[::-1]  # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ```
  Aqui, `[::-1]` significa “toma todos los elementos, pero al revés”.

<br>
<hr>
<br>

### Control de Flujo

#### Condicionales

Estructura `if`, `elif`, `else`: Las declaraciones condicionales permiten ejecutar codigo basado en ciertas condiciones.

<br>

#### Condicionales Anidadas

Las condiciones pueden anidarse dentro de otras condiciones para evaluar multiples criterios.

<br>

#### Uso de Operadores Logicos en Condicionales

Los operadores and, or, y not se pueden usar para combinar multiples condiciones en una declaracion if.

<br>
<hr>
<br>

### Bucles

#### Ciclo while

Un bucle `while` repite un bloque de codigo mientras una condicion sea verdadera. Es util cuando no se sabe de antemano cuántas veces se debe repetir el bucle.

Ejemplo básico de ciclo `while`:

```python
contador = 1
while contador <= 5:
    print(contador)
    contador += 1
```

Este bucle imprimirá los numeros del 1 al 5. La variable `contador` se incrementa en 1 en cada iteracion.

<br>

#### Ciclo while con una condicion de salida

El bucle `while` también se puede utilizar con una condicion de salida para detenerse cuando se alcanza un cierto estado.

Ejemplo de ciclo `while` con una condicion de salida:

```python
respuesta = ""
while respuesta != "salir":
    respuesta = input("Escribe 'salir' para terminar: ")
    print("Escribiste:", respuesta)
```

Este bucle pedirá al usuario que ingrese un texto hasta que escriba "salir". En cada iteracion, se imprime lo que el usuario escribio.

<br>

#### Ciclo for

Un bucle `for` se utiliza para iterar sobre una secuencia (como una lista o un rango de numeros). A diferencia del ciclo `while`, el numero de iteraciones está determinado por la cantidad de elementos en la secuencia.

Ejemplo básico de ciclo `for`:

```python
for i in range(5):
    print(i)
```

Este bucle imprimirá los numeros del 0 al 4.

<br>
<hr>
<br>

### Funciones

Son bloques de codigo reutilizables que realizan una tarea especifica. Se definen usando la palabra clave `def` seguida del nombre de la funcion y paréntesis. Dentro de los paréntesis, se pueden incluir parámetros, que son variables que la funcion puede recibir como entrada.

Ejemplo de una funcion simple:

```python
def saludar(nombre):
    print(f"Hola, {nombre}!")

saludar("Steve")
```

Este codigo define una funcion llamada `saludar` que toma un parámetro `nombre` e imprime un mensaje de saludo. Luego, la funcion se llama con el argumento `"Steve"`, y se imprimirá `Hola, Steve!`.

<br>

#### Funciones con valor de retorno

Las funciones pueden devolver un valor usando la palabra clave `return`. Esto permite que la funcion envie datos de vuelta al lugar donde fue llamada. Utilizar funciones con valor de retorno es util cuando necesitas el resultado de un cálculo o una operacion para usarlo en otro lugar del programa.

Ejemplo de una funcion con valor de retorno:

```python
def suma(a, b):
    return a + b

resultado = suma(3, 5)
print(resultado)
```

Este codigo define una funcion `suma` que toma dos parámetros, `a` y `b`, y devuelve su suma. El resultado de la funcion se almacena en la variable `resultado`, que luego se imprime (mostrará `8`).

<br>

#### Funciones con multiples valores de retorno

Las funciones también pueden devolver multiples valores utilizando tuplas. Esto es util cuando necesitas devolver más de un valor desde una funcion.

Ejemplo de una funcion que devuelve multiples valores:

```python
def operaciones(a, b):
    suma = a + b
    resta = a - b
    return suma, resta

resultado_suma, resultado_resta = operaciones(10, 5)
print("Suma:", resultado_suma)
print("Resta:", resultado_resta)
```

Este codigo define una funcion `operaciones` que toma dos parámetros y devuelve la suma y la resta de esos parámetros. Los resultados se almacenan en dos variables separadas y luego se imprimen.

<br>
<hr>

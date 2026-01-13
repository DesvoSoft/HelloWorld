---
layout: ../layouts/MarkdownLayout.astro
title: Fundamentos de C++
videoUrl: https://www.youtube.com/embed/Rub-JsjMhWQ?autoplay=1&controls=0&loop=0&vq=hd1080
buttonText: COMENZAR
---

# C++

## Fundamentos de la Programación

### Operadores

#### Operadores Aritméticos

Se usan para realizar operaciones matemáticas básicas. Incluyen `+` (suma), `-` (resta), `*` (multiplicación), `/` (división), `%` (módulo: devuelve el residuo de una división).

#### Operadores de Comparación

Comparan dos valores y devuelven un valor booleano (true o false). Incluyen `==` (igual a), `!=` (diferente de), `>` (mayor que), `<` (menor que), `>=` (mayor o igual que), y `<=` (menor o igual que).

#### Operadores Lógicos

Se usan para combinar condiciones. Incluyen `&&` (y lógico), `||` (o lógico), y `!` (no lógico).

<br>
<hr>
<br>

### Variables y Tipos de Datos

Se utilizan para almacenar datos que pueden ser usados y manipulados en un programa.

<br>

##### Tipos de datos fundamentales:

- Enteros | `int` | Números enteros sin decimales
- Flotantes | `float`, `double` | Números con parte decimal
- Caracteres | `char` | Caracteres individuales
- Booleanos | `bool` | `true` o `false`

<br>

##### Declaración de variables:

```cpp
int edad = 25;
double precio = 99.99;
char inicial = 'J';
bool esActivo = true;
```

<br>
<hr>
<br>

### Estructuras de Datos

#### Arreglos (Arrays)

Son colecciones de elementos del mismo tipo. Se declaran usando corchetes `[]` y tienen un tamaño fijo.

<br>

##### Declaración y uso:

```cpp
int numeros[5] = {1, 2, 3, 4, 5};
double temperaturas[3] = {36.5, 37.0, 38.2};
```

<br>

#### Strings

Para manejar texto, C++ usa la biblioteca `<string>`.

```cpp
#include <string>
using namespace std;

string nombre = "Juan";
string saludo = "Hola, " + nombre;
```

<br>
<hr>
<br>

### Control de Flujo

#### Condicionales

Estructura `if`, `else if`, `else`: Permiten ejecutar código basado en ciertas condiciones.

<br>

##### Ejemplo básico:

```cpp
int calificacion = 85;

if (calificacion >= 90) {
    cout << "Excelente" << endl;
} else if (calificacion >= 70) {
    cout << "Aprobado" << endl;
} else {
    cout << "Reprobado" << endl;
}
```

<br>
<hr>
<br>

### Bucles

#### Ciclo while

Un bucle `while` repite un bloque de código mientras una condición sea verdadera.

```cpp
int contador = 1;
while (contador <= 5) {
    cout << contador << endl;
    contador++;
}
```

<br>

#### Ciclo for

Un bucle `for` se utiliza para iterar un número determinado de veces.

```cpp
for (int i = 0; i < 5; i++) {
    cout << "Iteración: " << i << endl;
}
```

<br>

#### Ciclo do-while

Similar a `while`, pero garantiza que el código se ejecute al menos una vez.

```cpp
int numero;
do {
    cout << "Ingrese un número positivo: ";
    cin >> numero;
} while (numero <= 0);
```

<br>
<hr>
<br>

### Funciones

Son bloques de código reutilizables que realizan una tarea específica. Se definen con un tipo de retorno, nombre y parámetros.

<br>

##### Función simple:

```cpp
void saludar(string nombre) {
    cout << "Hola, " << nombre << "!" << endl;
}

saludar("Ana");
```

<br>

##### Función con valor de retorno:

```cpp
int suma(int a, int b) {
    return a + b;
}

int resultado = suma(3, 5);
cout << "Resultado: " << resultado << endl;
```

<br>

##### Función con múltiples parámetros:

```cpp
double calcularPromedio(double a, double b, double c) {
    return (a + b + c) / 3.0;
}

double promedio = calcularPromedio(8.5, 9.0, 7.5);
```

<br>
<hr>
<br>

### Estructuras de Control Avanzadas

#### Switch-case

Útil para tomar decisiones basadas en el valor de una variable entera o caracter.

```cpp
int dia = 3;
switch (dia) {
    case 1:
        cout << "Lunes" << endl;
        break;
    case 2:
        cout << "Martes" << endl;
        break;
    case 3:
        cout << "Miércoles" << endl;
        break;
    default:
        cout << "Otro día" << endl;
}
```

<br>
<hr>
<br>

### Entrada y Salida

#### Biblioteca iostream

C++ usa `<iostream>` para manejar la entrada y salida estándar.

```cpp
#include <iostream>
using namespace std;

int main() {
    string nombre;
    int edad;
    
    cout << "Ingrese su nombre: ";
    cin >> nombre;
    
    cout << "Ingrese su edad: ";
    cin >> edad;
    
    cout << "Hola " << nombre << ", tienes " << edad << " años." << endl;
    
    return 0;
}
```

<br>
<hr>
<br>

### Punteros (Introducción)

Los punteros son variables que almacenan direcciones de memoria.

<br>

##### Declaración y uso básico:

```cpp
int numero = 42;
int* puntero = &numero;  // & obtiene la dirección

cout << "Valor: " << *puntero << endl;  // * accede al valor
cout << "Dirección: " << puntero << endl;
```

<br>
<hr>
<br>

### Compilación y Ejecución

#### Compilar con g++:

```bash
g++ programa.cpp -o programa
./programa
```

<br>
<hr>
<br>

## Próximos Pasos

- Explorar clases y programación orientada a objetos
- Aprender sobre plantillas (templates)
- Estudiar la biblioteca estándar de C++ (STL)
- Practicar con estructuras de datos complejas
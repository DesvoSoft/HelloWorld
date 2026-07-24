---
layout: ../layouts/MarkdownLayout.astro
title: Fundamentos de Java
videoUrl: https://www.youtube.com/embed/eIrMbAQSU34?autoplay=1&controls=0&loop=0&vq=hd1080
buttonText: EMPEZAR
---

# Java

## Fundamentos de la Programación

### Operadores

#### Operadores Aritméticos

Se usan para realizar operaciones matemáticas básicas. Incluyen `+` (suma), `-` (resta), `*` (multiplicación), `/` (división), `%` (módulo: devuelve el residuo de una división).

#### Operadores de Comparación

Comparan dos valores y devuelven un valor booleano (`true` o `false`). Incluyen `==` (igual a), `!=` (diferente de), `>` (mayor que), `<` (menor que), `>=` (mayor o igual que), y `<=` (menor o igual que).

#### Operadores Lógicos

Se usan para combinar condiciones. Incluyen `&&` (y lógico), `||` (o lógico), y `!` (no lógico).

<br>
<hr>
<br>

### Variables y Tipos de Datos

Java es un lenguaje **fuertemente tipado**: toda variable debe declarar su tipo antes de usarse.

<br>

##### Tipos primitivos:

- Enteros | `byte`, `short`, `int`, `long` | Números enteros sin decimales
- Flotantes | `float`, `double` | Números con parte decimal
- Caracteres | `char` | Un solo carácter Unicode
- Booleanos | `boolean` | `true` o `false`

<br>

##### Declaración de variables:

```java
int edad = 25;
double precio = 99.99;
char inicial = 'J';
boolean esActivo = true;
String nombre = "Java"; // tipo referencia, no primitivo
```

<br>
<hr>
<br>

### Estructuras de Datos

#### Arreglos (Arrays)

Colecciones de tamaño fijo que almacenan elementos del mismo tipo.

<br>

##### Declaración y uso:

```java
int[] numeros = {1, 2, 3, 4, 5};
double[] temperaturas = new double[3];
temperaturas[0] = 36.5;
```

<br>

#### ArrayList

Cuando el tamaño no se conoce de antemano, `ArrayList` ofrece una lista dinámica (parte de `java.util`).

```java
import java.util.ArrayList;

ArrayList<String> nombres = new ArrayList<>();
nombres.add("Ana");
nombres.add("Luis");
nombres.remove("Ana");
System.out.println(nombres.size()); // 1
```

<br>
<hr>
<br>

### Control de Flujo

#### Condicionales

Estructura `if`, `else if`, `else`: permiten ejecutar código basado en ciertas condiciones.

<br>

##### Ejemplo básico:

```java
int calificacion = 85;

if (calificacion >= 90) {
    System.out.println("Excelente");
} else if (calificacion >= 70) {
    System.out.println("Aprobado");
} else {
    System.out.println("Reprobado");
}
```

<br>
<hr>
<br>

### Bucles

#### Ciclo while

Repite un bloque de código mientras una condición sea verdadera.

```java
int contador = 1;
while (contador <= 5) {
    System.out.println(contador);
    contador++;
}
```

<br>

#### Ciclo for

Se utiliza para iterar un número determinado de veces.

```java
for (int i = 0; i < 5; i++) {
    System.out.println("Iteración: " + i);
}
```

<br>

#### For-each

Variante de `for` pensada para recorrer colecciones y arreglos.

```java
int[] numeros = {1, 2, 3};
for (int n : numeros) {
    System.out.println(n);
}
```

<br>
<hr>
<br>

### Clases y Objetos (POO)

Java es un lenguaje **orientado a objetos** desde su diseño: casi todo el código vive dentro de una clase.

<br>

##### Definir una clase:

```java
public class Persona {
    private String nombre;
    private int edad;

    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }

    public void saludar() {
        System.out.println("Hola, soy " + nombre + " y tengo " + edad + " años.");
    }
}
```

<br>

##### Crear e usar un objeto:

```java
Persona p = new Persona("Ana", 30);
p.saludar(); // Hola, soy Ana y tengo 30 años.
```

<br>

#### Los cuatro pilares de la POO

- **Encapsulamiento:** ocultar datos internos usando `private` y exponerlos con métodos (`getters`/`setters`).
- **Herencia:** una clase (`extends`) reutiliza atributos y métodos de otra.
- **Polimorfismo:** un mismo método se comporta distinto según la clase que lo implemente (`@Override`).
- **Abstracción:** modelar solo lo esencial con clases abstractas (`abstract`) o interfaces (`interface`).

```java
public abstract class Animal {
    public abstract void hacerSonido();
}

public class Perro extends Animal {
    @Override
    public void hacerSonido() {
        System.out.println("Guau!");
    }
}
```

<br>
<hr>
<br>

### Funciones (Métodos)

En Java, las funciones se llaman **métodos** y siempre pertenecen a una clase.

<br>

##### Método con valor de retorno:

```java
public static int suma(int a, int b) {
    return a + b;
}

int resultado = suma(3, 5);
System.out.println("Resultado: " + resultado);
```

<br>
<hr>
<br>

### Entrada y Salida

#### Clase Scanner

Java usa `Scanner` (de `java.util`) para leer entrada estándar.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Ingrese su nombre: ");
        String nombre = sc.nextLine();

        System.out.print("Ingrese su edad: ");
        int edad = sc.nextInt();

        System.out.println("Hola " + nombre + ", tienes " + edad + " años.");
    }
}
```

<br>
<hr>
<br>

### Compilación y Ejecución

#### Compilar y ejecutar con javac/java:

```bash
javac Main.java
java Main
```

<br>
<hr>
<br>

## Próximos Pasos

- Explorar colecciones (`List`, `Map`, `Set`) y genéricos
- Aprender sobre manejo de excepciones (`try`/`catch`)
- Estudiar interfaces funcionales y expresiones lambda
- Practicar con streams (`java.util.stream`)

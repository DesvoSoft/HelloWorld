---
layout: ../layouts/MarkdownLayout.astro
title: Fundamentos de Java
description: "Fundamentos de Java: sintaxis, tipos de datos y programación orientada a objetos. Guía práctica para empezar a programar en Java."
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

#### Tipos primitivos:

- Enteros | `byte`, `short`, `int`, `long` | Números enteros sin decimales
- Flotantes | `float`, `double` | Números con parte decimal
- Caracteres | `char` | Un solo carácter Unicode
- Booleanos | `boolean` | `true` o `false`

<br>

#### Declaración de variables:

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

Java es un lenguaje **orientado a objetos** desde su diseño: casi todo el código vive dentro de una clase. Un objeto es una instancia de una clase y contiene estado (atributos) y comportamiento (métodos).

<br>

#### Definición de una clase y creación de objetos

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

// Uso:
Persona p = new Persona("Ana", 30);
p.saludar();
```

<br>

#### Constructores en profundidad

El constructor es un método especial que se ejecuta al crear un objeto con `new`. No tiene tipo de retorno y su nombre coincide con el de la clase.

```java
public class Producto {
    private String nombre;
    private double precio;

    // Constructor por defecto (si no se define ninguno, Java lo crea implícitamente)
    public Producto() {
        this.nombre = "Sin nombre";
        this.precio = 0.0;
    }

    // Constructor parametrizado
    public Producto(String nombre, double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }

    // Sobrecarga de constructores (mismo nombre, distintos parámetros)
    public Producto(String nombre) {
        this(nombre, 0.0); // llama al constructor de arriba con this()
    }

    // Copy constructor
    public Producto(Producto otro) {
        this(otro.nombre, otro.precio);
    }
}

// Uso:
Producto p1 = new Producto();
Producto p2 = new Producto("Laptop", 999.99);
Producto p3 = new Producto("Mouse");
Producto p4 = new Producto(p2); // copia
```

- `this()` llama a otro constructor de la misma clase (debe ser la primera línea).
- `super()` llama al constructor de la clase padre.
- Si no se define ningún constructor, Java provee un **constructor por defecto** sin parámetros.
- En cuanto se define al menos un constructor, el por defecto **desaparece**.

<br>

#### Herencia con super()

```java
public class Empleado extends Persona {
    private String puesto;

    public Empleado(String nombre, int edad, String puesto) {
        super(nombre, edad); // llama al constructor de Persona
        this.puesto = puesto;
    }

    @Override
    public void saludar() {
        super.saludar(); // reutiliza el método de Persona
        System.out.println("Trabajo como " + puesto);
    }
}
```

<br>

#### Miembros estáticos (static)

Los miembros `static` pertenecen a la clase, no a las instancias. Se accede sin crear objetos.

```java
public class Configuracion {
    public static final String APP_NAME = "MiApp";
    private static int contador = 0;

    public static int getContador() {
        return contador;
    }

    public Configuracion() {
        contador++;
    }
}

// Uso:
System.out.println(Configuracion.APP_NAME);
new Configuracion();
new Configuracion();
System.out.println(Configuracion.getContador()); // 2
```

<br>

#### Enums

Los `enum` definen un conjunto fijo de constantes con tipo seguro.

```java
public enum Dia {
    LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
}

// Pueden tener atributos y métodos
public enum EstadoPedido {
    PENDIENTE(1), ENVIADO(2), ENTREGADO(3), CANCELADO(4);

    private int codigo;

    EstadoPedido(int codigo) {
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }
}

// Uso:
Dia hoy = Dia.MARTES;
EstadoPedido ep = EstadoPedido.ENTREGADO;
System.out.println(ep.getCodigo()); // 2
```

<br>

#### Records (Java 14+)

Los `record` son clases inmutables que generan automáticamente constructor, getters, `equals()`, `hashCode()` y `toString()`.

```java
public record Punto(int x, int y) {}

// Uso:
Punto p = new Punto(10, 20);
System.out.println(p.x());   // getter automático
System.out.println(p);       // Punto[x=10, y=20]

// Con validación:
public record PersonaRecord(String nombre, int edad) {
    public PersonaRecord {
        if (edad < 0) throw new IllegalArgumentException("Edad no válida");
    }
}
```

<br>

#### Modificadores de acceso y paquetes

| Modificador | Clase | Paquete | Subclase | Global |
|-------------|-------|---------|----------|--------|
| `private`   | Sí    | No      | No       | No     |
| `default`   | Sí    | Sí      | No       | No     |
| `protected` | Sí    | Sí      | Sí       | No     |
| `public`    | Sí    | Sí      | Sí       | Sí     |

```java
package com.miapp.modelo;

public class Usuario {
    private int id;           // solo esta clase
    String nombre;            // package-private (default)
    protected int edad;       // paquete + subclases
    public String email;      // todos
}
```

<br>

#### Los cuatro pilares de la POO

<br>

##### 1. Encapsulamiento

Ocultar los datos internos usando `private` y exponerlos mediante métodos públicos (getters/setters).

```java
public class CuentaBancaria {
    private double saldo;

    public double getSaldo() {
        return saldo;
    }

    public void depositar(double monto) {
        if (monto > 0) saldo += monto;
    }

    public boolean retirar(double monto) {
        if (monto > 0 && monto <= saldo) {
            saldo -= monto;
            return true;
        }
        return false;
    }
}
```

<br>

##### 2. Herencia

Una clase (`extends`) reutiliza y extiende atributos y métodos de otra. Java solo permite herencia simple (una sola clase padre).

```java
public class Animal {
    protected String nombre;

    public void comer() {
        System.out.println(nombre + " está comiendo");
    }
}

public class Perro extends Animal {
    public void ladrar() {
        System.out.println("Guau!");
    }
}
```

<br>

##### 3. Polimorfismo

Un mismo método se comporta distinto según la implementación concreta.

```java
public class Gato extends Animal {
    @Override
    public void comer() {
        System.out.println(nombre + " come pescado");
    }
}

// Polimorfismo dinámico:
Animal a = new Perro();
a.comer(); // "está comiendo" (depende del tipo real en runtime)
```

También existe **polimorfismo estático** (sobrecarga): mismo nombre, distintos parámetros.

```java
public class Calculadora {
    public int sumar(int a, int b) { return a + b; }
    public double sumar(double a, double b) { return a + b; }
    public int sumar(int a, int b, int c) { return a + b + c; }
}
```

<br>

##### 4. Abstracción

Modelar solo lo esencial, ocultando los detalles de implementación. Se logra con clases abstractas o interfaces.

```java
// Clase abstracta: puede tener métodos con y sin implementación
public abstract class Vehiculo {
    protected String marca;

    public abstract void mover(); // método abstracto (sin cuerpo)

    public void mostrarMarca() {  // método concreto
        System.out.println("Marca: " + marca);
    }
}

// Interfaz: solo define el qué, no el cómo
public interface Volable {
    void volar(); // implícitamente public abstract

    default void aterrizar() { // default method (Java 8+)
        System.out.println("Aterrizando...");
    }
}

public class Avion extends Vehiculo implements Volable {
    @Override
    public void mover() {
        System.out.println("El avión rueda por la pista");
    }

    @Override
    public void volar() {
        System.out.println("El avión está volando");
    }
}
```

**Diferencia clave:** `abstract class` puede tener estado (atributos) y constructores; `interface` solo define comportamiento (hasta Java 7). Desde Java 8, las interfaces pueden tener métodos `default` y `static`.

<br>
<hr>
<br>

### Manejo de Memoria: Stack, Heap y Recolección de Basura

Java no tiene **punteros explícitos** como C/C++. En su lugar, usa **referencias** a objetos. El JVM gestiona la memoria automáticamente.

<br>

#### Stack vs Heap

| Stack | Heap |
|-------|------|
| Variables locales y primitivos | Objetos y arrays |
| Memoria pequeña y rápida | Memoria grande y más lenta |
| Por hilo (cada hilo tiene su stack) | Compartido entre todos los hilos |
| Se libera al salir del bloque | Gestionado por el Garbage Collector |

```java
public class MemoriaEjemplo {
    public static void main(String[] args) {
        int x = 5;                          // x está en el stack
        String s = new String("Hola");      // referencia 's' en stack, String en heap
        Persona p = new Persona("Ana", 30); // referencia 'p' en stack, objeto Persona en heap
    } // x, s, p se eliminan del stack al salir de main
}     // los objetos en heap se reciclan cuando el GC determina que ya no hay referencias
```

<br>

#### Paso por valor (pass-by-value)

Java **siempre** pasa argumentos por valor. Para primitivos se pasa el valor; para objetos se pasa el valor de la referencia (no el objeto en sí).

```java
public static void modificar(int x, StringBuilder sb) {
    x = 100;                       // solo modifica la copia local
    sb.append(" mundo");           // modifica el objeto original
    sb = new StringBuilder("nuevo"); // la nueva referencia se pierde al salir
}

int a = 5;
StringBuilder b = new StringBuilder("Hola");
modificar(a, b);
System.out.println(a); // 5 (sin cambios)
System.out.println(b); // "Hola mundo" (el objeto fue modificado)
```

<br>

#### Garbage Collector (GC)

El GC de Java elimina automáticamente objetos que ya no tienen referencias alcanzables.

```java
Persona p = new Persona("Ana", 30);
p = null; // el objeto Persona("Ana",30) queda elegible para GC

// También se sugiere explícitamente (no obliga):
System.gc();
```

<br>

#### null, NullPointerException y Optional

```java
Persona p = null;
// p.saludar(); // NullPointerException en tiempo de ejecución

// Java 8+ - Optional para evitar nulos:
import java.util.Optional;

Optional<String> nombreOpt = Optional.ofNullable(obtenerNombre());
String nombre = nombreOpt.orElse("Invitado");
```

<br>

#### Referencias: comparación vs igualdad

```java
String a = new String("Hola");
String b = new String("Hola");

System.out.println(a == b);      // false (distintas direcciones de memoria)
System.out.println(a.equals(b)); // true  (mismo contenido)
```

- `==` compara **referencias** (direcciones de memoria).
- `.equals()` compara **contenido** (debe estar sobreescrito en la clase).

<br>
<hr>
<br>

### Funciones (Métodos)

En Java, las funciones se llaman **métodos** y siempre pertenecen a una clase.

<br>

#### Método con valor de retorno:

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

### Swing - Interfaces Gráficas

Swing es el toolkit de GUI (Interfaz Gráfica de Usuario) de Java. Permite crear ventanas, botones, formularios y manejar eventos del usuario.

<br>

#### Ventana básica (JFrame)

```java
import javax.swing.*;

public class VentanaBasica {
    public static void main(String[] args) {
        JFrame ventana = new JFrame("Mi Primera Ventana");
        ventana.setSize(400, 300);
        ventana.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        ventana.setVisible(true);
    }
}
```

<br>

#### Componentes comunes

```java
import javax.swing.*;
import java.awt.*;

public class ComponentesDemo {
    public static void main(String[] args) {
        JFrame ventana = new JFrame("Componentes Swing");
        ventana.setSize(500, 400);
        ventana.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Panel para organizar componentes
        JPanel panel = new JPanel();
        panel.setLayout(new FlowLayout());

        // Etiqueta
        JLabel etiqueta = new JLabel("Nombre:");
        panel.add(etiqueta);

        // Campo de texto
        JTextField campoTexto = new JTextField(20);
        panel.add(campoTexto);

        // Botón
        JButton boton = new JButton("Saludar");
        panel.add(boton);

        // Área de texto (para output)
        JTextArea areaTexto = new JTextArea(5, 30);
        areaTexto.setEditable(false);
        JScrollPane scroll = new JScrollPane(areaTexto);
        panel.add(scroll);

        ventana.add(panel);
        ventana.setVisible(true);
    }
}
```

<br>

#### Manejo de eventos (ActionListener)

```java
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class EventosDemo {
    public static void main(String[] args) {
        JFrame ventana = new JFrame("Eventos");
        ventana.setSize(400, 300);
        ventana.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        ventana.setLayout(new FlowLayout());

        JTextField campo = new JTextField(15);
        JButton boton = new JButton("Click");
        JLabel resultado = new JLabel(" ");

        // Forma tradicional (antes de Java 8)
        boton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                resultado.setText("Hola, " + campo.getText());
            }
        });

        // Forma moderna con lambda (Java 8+)
        boton.addActionListener(e ->
            resultado.setText("Hola, " + campo.getText())
        );

        ventana.add(campo);
        ventana.add(boton);
        ventana.add(resultado);
        ventana.setVisible(true);
    }
}
```

<br>

#### Layout Managers

Controlan cómo se distribuyen los componentes dentro de un contenedor.

| Layout | Comportamiento |
|--------|---------------|
| `FlowLayout` | Componentes en línea, uno tras otro |
| `BorderLayout` | 5 regiones: NORTH, SOUTH, EAST, WEST, CENTER |
| `GridLayout` | Cuadrícula de filas y columnas |
| `GridBagLayout` | Cuadrícula flexible (el más potente) |

```java
JPanel panel = new JPanel(new BorderLayout());
panel.add(new JButton("Norte"), BorderLayout.NORTH);
panel.add(new JButton("Centro"), BorderLayout.CENTER);
panel.add(new JButton("Sur"), BorderLayout.SOUTH);
```

<br>

#### Calculadora básica con Swing

```java
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

public class CalculadoraSwing {
    private JFrame ventana;
    private JTextField pantalla;
    private double num1 = 0, num2 = 0;
    private String operador = "";

    public CalculadoraSwing() {
        ventana = new JFrame("Calculadora");
        ventana.setSize(250, 350);
        ventana.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        pantalla = new JTextField();
        pantalla.setEditable(false);
        pantalla.setFont(new Font("Arial", Font.BOLD, 24));
        ventana.add(pantalla, BorderLayout.NORTH);

        JPanel botones = new JPanel(new GridLayout(4, 4, 5, 5));
        String[] labels = {
            "7", "8", "9", "/",
            "4", "5", "6", "*",
            "1", "2", "3", "-",
            "C", "0", "=", "+"
        };

        for (String label : labels) {
            JButton btn = new JButton(label);
            btn.addActionListener(this::botonClick);
            botones.add(btn);
        }

        ventana.add(botones, BorderLayout.CENTER);
        ventana.setVisible(true);
    }

    private void botonClick(ActionEvent e) {
        String cmd = ((JButton) e.getSource()).getText();
        if ("0123456789".contains(cmd)) {
            pantalla.setText(pantalla.getText() + cmd);
        } else if (cmd.equals("C")) {
            pantalla.setText("");
            num1 = num2 = 0;
            operador = "";
        } else if (cmd.equals("=")) {
            num2 = Double.parseDouble(pantalla.getText());
            double resultado = switch (operador) {
                case "+" -> num1 + num2;
                case "-" -> num1 - num2;
                case "*" -> num1 * num2;
                case "/" -> num2 != 0 ? num1 / num2 : 0;
                default -> 0;
            };
            pantalla.setText(String.valueOf(resultado));
        } else {
            num1 = Double.parseDouble(pantalla.getText());
            operador = cmd;
            pantalla.setText("");
        }
    }

    public static void main(String[] args) {
        new CalculadoraSwing();
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

## Temas Avanzados

### Genéricos (Generics)

Permiten escribir clases y métodos que trabajan con tipos parametrizados, aportando tipo seguro en tiempo de compilación.

```java
// Clase genérica
public class Caja<T> {
    private T contenido;

    public void guardar(T contenido) {
        this.contenido = contenido;
    }

    public T obtener() {
        return contenido;
    }
}

// Uso:
Caja<String> cajaString = new Caja<>();
cajaString.guardar("Hola");
String valor = cajaString.obtener(); // sin cast

// Método genérico
public static <T> T primerElemento(List<T> lista) {
    return lista.get(0);
}

// Wildcards (?)
public static void imprimirLista(List<?> lista) {
    for (Object o : lista) System.out.println(o);
}

// Bounded wildcards
public static double sumarNumeros(List<? extends Number> numeros) {
    double suma = 0;
    for (Number n : numeros) suma += n.doubleValue();
    return suma;
}
```

<br>

### Expresiones Lambda y API Stream

Las **lambdas** (Java 8+) permiten tratar funciones como argumentos. Los **Streams** permiten procesar colecciones de forma declarativa.

```java
import java.util.*;
import java.util.stream.*;

// Lambda: (parámetros) -> expresión
List<String> nombres = Arrays.asList("Ana", "Pedro", "Luis", "María");
nombres.forEach(n -> System.out.println(n));

// Ordenar con lambda
nombres.sort((a, b) -> a.compareTo(b));

// Stream: map, filter, reduce, collect
List<Integer> numeros = Arrays.asList(1, 2, 3, 4, 5, 6);

List<Integer> pares = numeros.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList()); // [2, 4, 6]

int suma = numeros.stream()
    .reduce(0, Integer::sum); // 21

List<String> mayusculas = nombres.stream()
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());

// Stream con objetos
record Estudiante(String nombre, double nota) {}

List<Estudiante> estudiantes = Arrays.asList(
    new Estudiante("Ana", 85), new Estudiante("Luis", 92), new Estudiante("Pedro", 78)
);

double promedio = estudiantes.stream()
    .mapToDouble(Estudiante::nota)
    .average()
    .orElse(0);
```

<br>

### Manejo de Excepciones

Java usa excepciones para manejar errores en tiempo de ejecución.

```java
// Try-catch básico
try {
    int division = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    System.out.println("Esto siempre se ejecuta");
}

// Múltiples catch
try {
    String s = null;
    s.length();
} catch (NullPointerException e) {
    System.out.println("Objeto nulo");
} catch (Exception e) {
    System.out.println("Error general");
}

// Try-with-resources (Java 7+) - cierra automáticamente
try (Scanner sc = new Scanner(new java.io.File("datos.txt"))) {
    while (sc.hasNextLine()) {
        System.out.println(sc.nextLine());
    }
} catch (java.io.FileNotFoundException e) {
    System.out.println("Archivo no encontrado");
}

// Excepciones personalizadas
public class SaldoInsuficienteException extends Exception {
    public SaldoInsuficienteException(String mensaje) {
        super(mensaje);
    }
}

public void retirar(double monto) throws SaldoInsuficienteException {
    if (monto > saldo) {
        throw new SaldoInsuficienteException("Saldo insuficiente: " + saldo);
    }
    saldo -= monto;
}
```

<br>

### Hilos y Concurrencia

Java soporta programación multihilo de forma nativa.

```java
// Forma 1: implementando Runnable
class Tarea implements Runnable {
    private String nombre;

    public Tarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - iteración " + i);
            try {
                Thread.sleep(100); // pausa de 100ms
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Uso:
Thread t1 = new Thread(new Tarea("Hilo-1"));
Thread t2 = new Thread(new Tarea("Hilo-2"));
t1.start();
t2.start();
t1.join(); // espera a que t1 termine

// Forma 2: extending Thread
class MiHilo extends Thread {
    @Override
    public void run() {
        System.out.println("Ejecutando hilo");
    }
}
new MiHilo().start();

// ExecutorService (recomendado para producción)
import java.util.concurrent.*;

ExecutorService executor = Executors.newFixedThreadPool(4);
executor.submit(() -> System.out.println("Tarea en pool"));
executor.shutdown();

// synchronized - evitar condiciones de carrera
class Contador {
    private int cuenta = 0;

    public synchronized void incrementar() {
        cuenta++;
    }

    public synchronized int getCuenta() {
        return cuenta;
    }
}
```

<br>

### Colecciones Avanzadas (Java Collections Framework)

```java
import java.util.*;

// Listas
List<String> lista = new ArrayList<>();  // inserciones rápidas, acceso indexado
List<String> linked = new LinkedList<>(); // inserciones/eliminaciones rápidas en medio

// Sets (sin duplicados)
Set<String> hashSet = new HashSet<>();    // sin orden
Set<String> treeSet = new TreeSet<>();    // ordenado (TreeSet implements SortedSet)
Set<String> linkedHashSet = new LinkedHashSet<>(); // orden de inserción

// Mapas (clave -> valor)
Map<String, Integer> hashMap = new HashMap<>();
hashMap.put("Ana", 25);
hashMap.get("Ana");                 // 25
hashMap.getOrDefault("Luis", 0);    // 0 (evita null)

Map<String, Integer> treeMap = new TreeMap<>(); // ordenado por clave

// Queue y Deque
Queue<String> cola = new LinkedList<>();
cola.offer("primero");
cola.poll(); // obtiene y elimina el primero

Deque<String> pila = new ArrayDeque<>();
pila.push("elemento");
pila.pop(); // LIFO (último en entrar, primero en salir)

// Collections utility methods
List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5));
Collections.sort(nums);
Collections.reverse(nums);
Collections.max(nums);
Collections.min(nums);
```

<br>

### Anotaciones (Annotations)

Las anotaciones proveen metadatos sobre el código y pueden procesarse en tiempo de compilación o ejecución.

```java
// Anotaciones estándar
@Override          // indica sobreescritura de método
@Deprecated        // marca elemento como obsoleto
@SuppressWarnings  // suprime advertencias del compilador

// Crear una anotación personalizada
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Prueba {
    String descripcion();
    int prioridad() default 1;
}

// Uso:
public class Servicio {
    @Prueba(descripcion = "Prueba de login", prioridad = 5)
    public void probarLogin() {
        System.out.println("Probando login...");
    }
}
```

<br>
<hr>
<br>

## Próximos Pasos

- **JDBC:** Conexión a bases de datos relacionales (MySQL, PostgreSQL)
- **JavaFX:** Sucesor moderno de Swing para interfaces gráficas
- **Spring Boot:** Framework empresarial para aplicaciones web y microservicios
- **JPA / Hibernate:** Mapeo objeto-relacional (ORM)
- **Maven / Gradle:** Gestión de dependencias y construcción de proyectos
- **JUnit:** Pruebas unitarias con aserciones
- **Patrones de diseño:** Singleton, Factory, Observer, Builder, etc.
- **Arquitectura limpia:** Separación en capas, inyección de dependencias

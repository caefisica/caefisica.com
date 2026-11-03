---
title: "Diferencial"
description: "CBO204 — 4 créditos"
lead: "CBO204 — 4 créditos"
date: 2022-02-01T02:00:00
draft: true
weight: 10
contributors: ["richard-avalos"]
types: ["matemática"]
---

{{< alert icon="📌" text="Los temas que se tocan en el curso Cálculo II está relacionado con el cálculo integral, donde se aprenderá distintas técnicas de integración." />}}

{{< alert icon="👉" text="REQUISITOS: Para un mejor entendimiento del Curso de Cálculo II se necesitan comprender los conceptos vistos en el curso de Cálculo I, mas que nada los conceptos de derivadas." />}}

## ¿Qué temas se ven en Cálculo II?

El curso de Cálculo II se puede dividir en los siguientes temas de forma
general:

- Integrales Indefinidas
- Integrales Definidas
- Aplicaciones de las Integrales definidas
- Integración Numérica
- Integrales impropias

Explayándonos un poco más en los temas mencionados anteriormente:

1. **Integrales Indefinidas**: En este apartado se ven los primeros conceptos
   del Cálculo integral, como vendrían a ser el _concepto en si mismo de
   integral_, a su vez se ven tanto las _integrales inmediatas_ como los
   _métodos de integración_.

   - _Concepto de Integral_:

     - El concepto matemático que se le suele atribuir a la definición de
       integral es el siguiente: Una integral se trata de una _generalización de
       la suma de infinitos sumandos extremadamente pequeños_.
     - Y si lo vemos desde un punto de vista geométrico se suele mencionar a la
       integral como el área bajo la curva de una función $f(x)$ que esta
       acotada en el intervalo $[a,b]$.

     $$
     \int_a^b f(x)dx=\text{Área bajo la curva}
     $$

   - _Integrales Inmediatas_: Las integrales inmediatas o directas están
     referidas a aquellas integrales las cuales no se necesitan emplear ningún
     método de integración para poder obtener su resultado.
   - _Métodos de Integración_: Se entiende por métodos de integración a aquellas
     técnicas para obtener la antiderivada o integral indefinida de una función,
     de la cual ya mencionamos la integración directa y también se encuentran
     los métodos de _cambio de variable_, _integración por partes_, desarrollo
     en _fracciones parciales_ e integración por _sustitución trigonométrica_.

     - Ejemplo de integración por _cambio de variable_:

       1. Teniendo la integral

          $$
          \int \dfrac{e^x}{\sqrt{1-e^{2x}}}dx
          $$

       2. Haciendo el cambio de variable:

          $$
          u=e^x \quad \rightarrow \quad du=e^x dx
          $$

       3. Reemplazando en la integral:

          $$
          \int \dfrac{e^x}{\sqrt{1-e^{2x}}}dx=\int \dfrac{du}{\sqrt{1-u^2}}
          $$

       4. Nos queda una integral directa:

          $$
          \int \dfrac{du}{\sqrt{1-u^2}}=\arcsin{u}+C
          $$

       5. Volviendo a reemplazar $u=e^x$, nos queda:

          $$
          \int \dfrac{e^x}{\sqrt{1-e^{2x}}}dx=\arcsin{e^x}+C
          $$

     - Ejemplo de integración por partes:

       1. Teniendo la integral

          $$
          \int x^2 \ln^2x dx
          $$

          Recordando el método de integración por partes:

          $$
          \int udv =uv-\int vdu
          $$

       2. Haciendo que:

          $$u=ln^2 x \quad \rightarrow \quad du=2\dfrac{\ln x}{x}dx$$ $$dv=x^2 dx \quad \rightarrow \quad v=\dfrac{x^3}{3} $$

       3. Reemplazando utilizando el método de integración por partes:

          $$
          \int x^2 \ln{x} dx=\ln^2{x} \left( \dfrac{x^3}{3}\right)-\int \dfrac{x^3}{3} 2 \dfrac{\ln{x}}{x}dx
          $$

          $$
          \int x^2\ln{x} dx=\dfrac{x^3}{3} \ln^2{x}-\dfrac{2}{3}\int x^2 \ln{x} dx
          $$

       4. Volviendo a aplicar integración por partes a la otra integral:

          $$u=\ln{x} \quad \rightarrow \quad du=\dfrac{1}{x}dx $$ $$dv=x^2dx \quad \rightarrow \quad v=\dfrac{x^3}{3} $$

       5. Por lo que la integral nos queda:

          $$
          \begin{aligned}
          \int x^2 \ln{x}dx&=\dfrac{x^3}{3} \ln{x}-\int \dfrac{x^3}{3}\dfrac{1}{x}dx \newline \newline
          \int x^2 \ln{x}dx&=\dfrac{x^3}{3} \ln{x}-\dfrac{x^3}{9}+K
          \end{aligned}
          $$

       6. Reemplazando en la primer integral nos queda:

          $$
          \int x^2 \ln{x}dx=\dfrac{x^3}{3} \ln^2 x-\dfrac{2}{3}\left[\dfrac{x^3 \ln{x}}{3}-\dfrac{x^3}{9} \right]+C
          $$

     - Ejemplo de Integración por _fracciones parciales_:

       1. Teniendo la integral:
          $$
          \int \dfrac{x+4}{x^4-9x^2}dx
          $$
       2. Si factorizamos el denominador de nuestra integral:

          $$
          x^4-9x^2=x^2(x-3)(x+3)
          $$

       3. Por el método de fracciones parciales nos queda:

          $$
          \int \dfrac{x+4}{x^4-9x^2}dx=\int \left ( \dfrac{A}{x-3}+\dfrac{B}{x+3}+\dfrac{C_1}{x}+\dfrac{C_2}{x^2} \right)dx
          $$

       4. Por el método de Heaviside:

          $$
          \begin{aligned}
          A&=\lim_{x\rightarrow 3} \dfrac{x+4}{x^2(x+3)}=\dfrac{7}{54} \newline \newline
          B&=\lim_{x\rightarrow -3}\dfrac{x+4}{x^2(x-3)}=-\dfrac{1}{54} \newline \newline
          C_1&=\lim_{x\rightarrow0} \dfrac{1}{(2-1)!} \dfrac{d}{dx} \left [x^2 \dfrac{(x+4)}{x^2(x-3)(x+3)} \right]=-\dfrac{1}{9} \newline \newline
          C_2&=\lim_{x\rightarrow0} \dfrac{1}{(2-2)!} \dfrac{d}{dx} \left [ \dfrac{(x+4)}{(x+3)(x-3)} \right]=-\dfrac{4}{9}
          \end{aligned}
          $$

       5. Reemplazando en la integral:

          $$
          \begin{aligned}
              \int \dfrac{x+4}{x^4-9x^2}dx&=\int \left ( \dfrac{7}{54(x-3)}-\dfrac{1}{54(x+3)}-\dfrac{1}{9x}-\dfrac{4}{9x^2} \right)dx \newline \newline
              \int \dfrac{x+4}{x^4-9x^2}dx&=\dfrac{7}{54}\ln {|x+3|}-\dfrac{1}{9} \ln{|x|}-\dfrac{4}{9}\left(-\dfrac{1}{x} \right)+C
          \end{aligned}
          $$

     - Ejemplo de integración por _sustitución Trigonométrica_:

       1. Teniendo la integral:

          $$
          \int \dfrac{\sqrt{x^2-8}}{x^4}dx
          $$

       2. Realizando los cambios:

          $$
          x= \sqrt{8} \sec{\theta} \quad \rightarrow \quad dx=\sqrt{8} \tan{\theta}\sec{\theta} d\theta
          $$

       3. Reemplazando en la integral nos queda:

          $$
          \begin{aligned}
          \int \dfrac{\sqrt{x^2-8}}{x^4}dx&=\int \dfrac{\sqrt{8\sec^2{\theta}-8}}{64\sec^4{\theta}}\sqrt{8}\tan{\theta}\sec{\theta}d\theta \newline \newline
          \int \dfrac{\sqrt{x^2-8}}{x^4}dx&=\dfrac{1}{8} \int \dfrac{\tan^2{\theta}}{\sec^3{\theta}}d\theta \newline \newline
          \int \dfrac{\sqrt{x^2-8}}{x^4}dx&=\dfrac{1}{8} \int \cos{\theta}\sin^2{\theta}d\theta
          \end{aligned}
          $$

       4. Haciendo el cambio:

          $$
          u=\sin{\theta} \quad \rightarrow \quad du=\cos{\theta}d\theta
          $$

       5. Reemplazando en la integral:

          $$
          \begin{aligned}
          \dfrac{1}{8} \int \cos{\theta}\sin^2{\theta}d\theta&=\dfrac{1}{8} \int u^2du  \newline \newline
          \dfrac{1}{8} \int \cos{\theta}\sin^2{\theta}d\theta&=\dfrac{u^3}{24}+C \newline \newline
          \dfrac{1}{8} \int \cos{\theta}\sin^2{\theta}d\theta&=\dfrac{\sin^3{\theta}}{24}+C
          \end{aligned}
          $$

       6. Recordando nuestro cambio inicial:

          $$
          x=\sqrt{8}\sec{\theta} \quad \rightarrow \quad \sec{\theta}=\dfrac{x}{\sqrt{8}}
          $$

       7. Por lo que $\rightarrow \sin{\theta}=\dfrac{\sqrt{x^2-8}}{x}$
       8. Entonces nuestra respuesta nos queda:

          $$
          \int \dfrac{\sqrt{x^2-8}}{x^4}dx=\dfrac{1}{24} \left(\dfrac{\sqrt{x^2-8}}{x} \right)^3+C
          $$

2. **Integrales Definidas:** En el apartado anterior habíamos mencionado la
   definición de integral, la cual esta relacionada con el área que se encuentra
   debajo de una curva de una función $f(x)$, y si esta función esta acotada en
   un intervalo $[a,b]$ entonces esta área esta denotada por una integral
   definida y la cual puede ser representada por una sumatoria denominada **Suma
   de Riemman**:

   $$
   \int_a^b f(x)=\lim_{n\rightarrow \infty}\sum_{i=1}^n \Delta x \cdot f(x_i)
   $$

   donde: $\Delta x=\dfrac{b-a}{n}$ y $x_i=a+\Delta x \cdot i$

   Para la resolución de las integrales definidas existen ciertos teoremas los
   cuales son muy importantes a la hora de tratar con las integrales.

   - Primer Teorema Fundamental del Cálculo: Este primer teorema nos expresa que
     tanto la derivación como la integración son operaciones inversas, es decir
     que si una función acotada es integrable esto también significa que la
     derivada de su integral será la misma función:

   $$
   F(x)=\int_a^x f(t) dt
   $$

   donde $\dfrac{dF(x)}{dx}=f(x)$, para todo $x \in [a,b]$.

   - _Segundo Teorema Fundamental del Cálculo_: Este teorema nos indica una
     propiedad que tienen las funciones continuas con la cual se pueden calcular
     las integrales definidas a partir de las antiderivadas de nuestra función,
     esto se expresa de la forma:

     Sea $f(x)$ una función integrable en el intervalo $[a,b]$ y sea
     $\dfrac{dF(x)}{dx}=f(x)$ entonces:

   $$
   \int_a^b f(x)dx=F(b)-F(a)
   $$

   ```plaintext
   Los métodos de integración vistos en la integral indefinida
   tambien se aplican para las integrales definidas.
   ```

3. **Aplicaciones de las Integrales definidas:** Las integrales tienen diversas
   aplicaciones tanto en el ámbito de las ciencias como en la ingeniería, siendo
   unos cuantos ejemplos:

   - Cálculo de Áreas y Volúmenes
   - Cálculo de la longitud del arco de una curva
   - Cálculo del centro de gravedad de una región plana

<p>

4. **Integración Numérica**: La integración numérica esta conformada por
   algoritmos para calcular el valor aproximado de una integral definida y estos
   son utilizados cuando no se puede hallar la antiderivada de la función que
   esta dentro de la integral, hay distintos métodos para calcular estas
   integrales siendo los mas conocidos:

   - Método del Trapecio
   - Método de Simpson
   - Método de Romberg

<p>

5. **Integrales impropias**: Las integrales impropias son aquellas integrales
   definidas donde los limites de la integral cubren un área que no esta
   acotada. La integral impropia se puede denotar dependiendo de los limites de
   la integral:

   - _Primer caso_: La integral impropia de $f$ de $a$ hasta $+\infty$ se denota
     y define como:

     $$\int_a^{+\infty} f(x)dx=\lim_{t\rightarrow +\infty} \int_a^t f(x)dx$$

   - _Segundo caso_: La integral impropia de $f$ de $-\infty$ hasta $b$ se
     denota y define como:

     $$\int_{-\infty} ^b f(x)dx=\lim_{t\rightarrow -\infty} \int_t^bf(x)dx $$

   - _Tercer caso_: La integral impropia de $f$ de $-\infty$ hasta $+\infty$ se
     denota y define como:

     $$
     \begin{aligned}
         \int_{-\infty} ^{+\infty} f(x)dx&=\int_{-\infty}^b f(x)dx+\int_b^{+\infty} f(x)dx \newline \newline
         \int_{-\infty} ^{+\infty} f(x)dx&=\lim_{t\rightarrow -\infty} \int_t^b f(x)dx+\lim_{t\rightarrow +\infty} \int_a^t f(x)dx
     \end{aligned}
     $$

     Y en cada caso se va a estudiar la convergencia de la integral, la integral
     impropia será convergente cuando los limites existan y será divergente si
     el limite no existe o es infinito.

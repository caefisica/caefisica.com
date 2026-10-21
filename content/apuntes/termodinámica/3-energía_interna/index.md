---
title: "Energía interna"
description:
  "Descripción de la función de estado energía interna, su dependencia de la
  temperatura y el volumen en sistemas cerrados y abiertos, y cómo calcular su
  evolución energética"
lead:
  "Análisis de la función de estado energía interna en termodinámica, su
  relación con la temperatura y el volumen, y su relevancia en el cálculo del
  trabajo calorífico elemental en procesos termodinámicos"
date: 2022-02-01T02:00:00
draft: false
weight: 20
contributors: ["richard"]
types: ["matemática"]
---

Vamos a definir la función de estado llamada energía interna la cual va a
depender de la temperatura y el volumen(para un sistema cerrado):

$$
\begin{align}
  U=U(T,V)
\end{align}
$$

Para un sistema abierto la energía interna dependerá también de $N$ la cual
significa el número de componentes del sistema:

$$
\begin{align}
  U=U(T,V,N)
\end{align}
$$

Calculamos la evolución energetica del sistema hallando la diferencial de $U$:

$$
\begin{align}
  dU &=\left( \frac{\partial U}{\partial T} \right)_V dT + \left( \frac{\partial U}{\partial V} \right)_T dV \\\\
  dU &=\alpha(T)dT+\beta(V)dV
\end{align}
$$

**Observación:**

$$
\begin{align}
  \boxed{\int dU=\int_{T_0}^T \alpha(T)dT+\int_{V_0}^V \beta(V)dV}
\end{align}
$$

## Trabajo calorífico elemental

Tenemos que el trabajo calorifico puede ser expresado como:

$$
\begin{align}
  \delta W&=\sum_{i=1}^{\ell} A_i d a_i \\
  \delta W&=A_1 da_1+\cdots + A_{\ell} da_{\ell}
\end{align}
$$

donde:

- $a_i$ es la i-ésima coordenada generalizada.
- $A_u$ es la i-ésima fuerza generalizada.
- $\ell$ son los grados de libertad

Otra forma de expresarlo es:

$$
\begin{align}
    \delta W=\mathbf{F} \cdot d \mathbf{r}=pdV
\end{align}
$$

Expresado en su forma integral:

$$
\begin{align}
    W=\int \delta W=\int_{V_0}^{V}p dV
\end{align}
$$

{{< img-simple src="diagram-20230116.png" alt="Proceso isotérmico" class="mx-auto block w-1/2 shadow-lg my-12" >}}

---
title: "Primera ley"
description:
  "La primera ley en forma diferencial, las capacidades caloríficas a volumen y
  a presión constantes, y la primera ley para un sistema abierto."
lead:
  "La primera ley en forma diferencial, las capacidades caloríficas a volumen y
  a presión constantes, y la primera ley para un sistema abierto."
date: 2022-02-01T02:00:00
draft: false
weight: 40
contributors: ["richard"]
types: ["matemática"]
---

Conservación de la energía calorífica:

$$
\begin{align}
    Q=U_2-U_1+W\\
    \delta Q=dU+\delta W
\end{align}
$$

Si $\delta W = p dV$, entonces:

$$
\begin{align}
    \delta Q=dU+pdV
\end{align}
$$

la cual es la forma diferencial de la Primera ley de la termodinámica.

$$
\begin{align}
\delta Q=\left( \frac{\partial U}{\partial T}\right)_V dT + \left[ \left(\frac{\partial U}{\partial V}\right)_T+p\right]dV
\end{align}
$$

donde por la **Ley de Joule** se cumple para el gas ideal que:

$$
\begin{align}
    \left(\frac{\partial U}{\partial V}\right)_T=0
\end{align}
$$

## Funciones termodinámicas

**Función de proceso:** Dependen solo del camino recorrido. (Trabajo, calor,etc)

$$
\begin{align}
    V_{1\rightarrow 2}=\int_{1\rightarrow 2} dV
\end{align}
$$

**Función de estado:** Dependen del estado inicial y final. (Entropía,
Entalpía,etc)

$$
\begin{align}
    \int_{(1-2)}d\mu =\int_1^2 d\mu=\mu_2-\mu_1=\mu_{(2)}-\mu_{(1)}
\end{align}
$$

## Aplicación de la primera ley de la Termodinámica

Primera definición de las capacidades caloríficas: $$C=\dfrac{\delta Q}{dT}$$

Si $V=\text{cte}$: $C_v=[C]_v$

Si $p=\text{cte}$: $C_p=[C]_p$

- Para $C=C_v$, donde el volumen es constante y $dV=0$:

  Si $U=U(T,V)$:

  $$
  \begin{align}
    \delta Q&=\left(\frac{\partial U}{\partial T}\right)_V dT+\left( \frac{\partial U}{\partial V}\right)_T dV+pdV \\\\
    \delta Q&=\left(\frac{\partial U}{\partial T}\right)_V dT+\left[\left( \frac{\partial U}{\partial V}\right)_T+p\right]dV
    \label{ecuación 8}
  \end{align}
  $$

  Si $C=C_v$, donde el volumen es constante. Sabemos que la capacidad calorífica
  esta definida de forma general como:

  $$
  \begin{align}
    C=\dfrac{dQ}{dT}
    \label{ecuación 9}
  \end{align}
  $$

  Y para el volumen constante reemplazamos $\eqref{ecuación 8}$ en
  $\eqref{ecuación 9}$:

  $$
  \begin{align}
    C_v&= \left[\frac{\left(\frac{\partial U}{\partial T}\right)_V dT+\left[\left( \frac{\partial U}{\partial V}\right)_T+p\right]dV}{dT}\right]_V \\\\
    C_v&= \left(\frac{\partial U}{\partial T}\right)_V \frac{dT}{dT}+\left[ \left(\frac{\partial U}{\partial V}\right)_T+p\right] \underbrace{\frac{dV}{dT}}\_{0} \\\\
    C_v&=\left(\frac{\partial U}{\partial T}\right)_V \dfrac{dT}{dT}=\left(\frac{\partial U}{\partial T}\right)_V
  \end{align}
  $$

- Calcular $U$ si se tiene $C_v$ donde $dV=0$:

  Si obtenemos la derivada total de la energía interna donde $U=U(T,V)$,
  obtenemos:

  $$
  \begin{align}
    dU=\left( \frac{\partial U}{\partial T} \right)_V dT+\left( \frac{\partial U}{\partial V} \right)_T dV
  \end{align}
  $$

  Como el volumen es constante, entonces $dV=0$, quedándonos así:

  $$
  \begin{align}
      dU=\left( \frac{\partial U}{\partial T} \right)_V dT
  \end{align}
  $$

  Pero sabemos que la capacidad calorífica a volumen constante esta definida
  como:

  $$
  \begin{align}
      C_v=\left( \frac{\partial U}{\partial T} \right)_V dT
  \end{align}
  $$

  Reemplazamos e integramos:

  $$
  \begin{align*}
      dU&=C_v dT \\\\
      \int_{U_0}^{U} dU&=\int_{T_0}^T C_v dT \\\\
      U-U_0&=\int_{T_0}^T C_v dT \\\\
      U&=U_0+\int_{T_0}^T C_v dT
  \end{align*}
  $$

- Calcular $C=C_p$ donde la presión es constante y $dp=0$:

  Si $U=U(T,V)$:

  $$
  \begin{align}
    \delta Q&=\left(\frac{\partial U}{\partial T}\right)_V dT+\left( \frac{\partial U}{\partial V}\right)_T dV+pdV \\\\
    \delta Q&=\left(\frac{\partial U}{\partial T}\right)_V dT+\left[\left( \frac{\partial U}{\partial V}\right)_T+p\right]dV
    \label{ec36}
  \end{align}
  $$

  Si $C_p$ esta definido como:

  $$
  \begin{align}
      C_p=\left[ \dfrac{\delta Q}{dT}\right]_p
      \label{ec37}
  \end{align}
  $$

  Reemplazamos $\eqref{ec36}$ en $\eqref{ec37}$:

  $$
  \begin{align}
    C_p&=\left[ \dfrac{ \displaystyle \left(\frac{\partial U}{\partial T}\right)_V dT+\left[\left( \frac{\partial U}{\partial V}\right)_T+p\right]dV}{dT}\right]_p \\\\
    C_p&=\left[ \left(\frac{\partial U}{\partial T}\right)_V+\left[\left(\frac{\partial U}{\partial V}\right)_T+p\right]\dfrac{dV}{dT}\right]_p
  \end{align}
  $$

  Si $\displaystyle C_v=\left( \frac{\partial U}{\partial T}\right)_V$:

  $$
  \begin{align}
      C_p&=C_v\left[ \left[\left(\frac{\partial U}{\partial V}\right)_T+p\right]\dfrac{dV}{dT}\right]_p
      \label{ec40}
  \end{align}
  $$

  Si consideramos al volumen como una función que depende de $T$ y $p$:

  $$
  \begin{align}
      V=V(T,p)
  \end{align}
  $$

  hallamos su diferencial total:

  $$
  \begin{align}
    dV=\left(\frac{\partial V}{\partial T}\right)_p+\left(\frac{\partial V}{\partial p}\right)_T dp
  \end{align}
  $$

  en el caso cuando la presión es constante queda:

  $$
  \begin{align}
      dV=\left( \frac{\partial V}{\partial T}\right)_p
      \label{ec43}
  \end{align}
  $$

  Reemplazamos $\eqref{ec40}$ en $\eqref{ec43}$:

  $$
  \begin{align}
      C_p=C_v+\left[ \left[\left(\frac{\partial U}{\partial V}\right)_T+p\right]\dfrac{\partial V}{dT}\right]_p
  \end{align}
  $$

## Primera ley para un sistema abierto

Para un sistema abierto monocomponente la primera ley se expresa como:

$$
\begin{align}
  \delta Q=dU+pdV-d \varepsilon
\end{align}
$$

donde $d \varepsilon= \mu dN$ (sistema monocomponente)\footnote{$\mu$ es
conocido como el potencial quimico.}, $d \varepsilon \approx dN$.

De forma general tenemos:

$$
\begin{align}
  \delta Q = dU+pdV-\sum_{i=1}^n \mu_i dN_i
\end{align}
$$

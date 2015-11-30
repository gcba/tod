Mapa de Desarrollo Orientado al Transporte (DOT)
===
# A. Introducción

# B. Metodología
## 1. Estimación de indicadores basados en el Censo Nacional 2010
Una gran parte de los indicadores utilizados en esta herramienta se basan en datos del Censo Nacional 2010. 

Los indicadores relacionados con (a) mercado del trabajo, (b) calidad de la vivienda, (c) nivel educativo, (d) estructura etaria y otros basados en datos del Censo Nacional 2010, respetan las definiciones censales usuales (Ej.: La tasa de inactividad se calcula como los inactivos sobre la población de 14 años o más) o son porcentajes de frecuencias simples sobre el total de casos.

Al no representar complicaciones metodológicas mayores, se remite al apartado final donde se listan todos los indicadores con sus descripciones.

## 2. Estimación del nivel socioeconómico de un radio censal
La siguiente metodología permite obtener una estimación del nivel socioeconómico de un radio censal de la Ciudad Autónoma de Buenos Aires. Esta metodología es una adaptación con modificaciones de la utilizada por el ITDP de México (Instituto de Políticas para el Transporte y el Desarrollo) para la estimación del nivel socioeconómico de un área geoestadística básica (AGEB) de la Zona Metropolitana del Valle de México (ZMVM).

En líneas generales, consiste en realizar un análisis de componentes principales a partir de tres índices que reflejan diferentes aspectos del nivel socioeconómico de un radio censal de la Ciudad. El primer componente principal construido a partir de estos tres índices es utilizado después para ordenar los radios censales por nivel socioeconómico.

$IndiceComputadora = \frac{NúmeroDeHogaresConComputadora}{ConComputadora + ConHeladera + ConCelular + ConTeléfono}$

Calcula el porcentaje de hogares que tienen computadora, dentro de aquellos que tienen al menos una computadora, heladera, celular o teléfono de línea.

$IndiceEscolaridad = \frac{MenoresDe18Asisten}{MenoresDe18}$

Calcula el porcentaje de habitantes menores a 18 años que concurre a algún establecimiento educativo.

$IndiceEducSuperior = \frac{MayoresDe25Universitarios}{MayoresDe25}$

Calcula el porcentaje de habitantes mayores a 25 años que tiene nivel universitario completo.

**Cuadro 1:** *Matriz de correlaciones*
| ******          |   educ_sup |   escolaridad |    compu |
|:----------------|-----------:|--------------:|---------:|
| **educ_sup**    |   1        |      0.496032 | 0.792191 |
| **escolaridad** |   0.496032 |      1        | 0.64806  |
| **compu**       |   0.792191 |      0.64806  | 1        |

El análisis de los tres primeros componentes principales arrojó los siguientes porcentajes de varianza explicada:

1. 88.32%
2. 10.11%
3. 1.57%

Utilizando este método, se reduce la dimensionalidad de la información que aporta cada uno de los índices aprovechando las variaciones conjuntas entre ellos. El primer componente principal es una combinación lineal de los tres índices según la siguiente ecuación:

$PC1 = 0.76120783 * IndiceEducSup + 0.10759338 * IndiceEscolaridad + 0.63952037 * IndiceCompu$

Utilizaremos a este primer componente principal como una estimación del nivel socioeconómico de los radios censales. Pero siendo que el PC1 arroja un rango de valores entre 0 y 1.32 (aproximadamente) se procede a una normalización para facilitar la lectura de los valores.

$NSE = \frac{PC1}{PC1Max} * 10$

De esta manera todos los valores del índice de NSE de radios censales se expresan en una escala del 0 al 10, donde 10 es el máximo valor de NSE alcanzado por el primer radio censal del ranking y 0 es el mínimo.

## 3. Estimación de indicadores relacionados con el transporte
*Distancias*
Para cada radio censal se calculó la distancia de su centroide a la estación más cercana (Ej.: la distancia del centroide de un radio censal a la estación de subte más cercana). 

Suponiendo una distribución uniforme de la población dentro del radio censal, esta distancia se aproximaría a la distancia promedio de todos los habitantes hasta la estación más cercana del modo de transporte del que se trate.

*Superficie alcanzada por colectivos*
Las líneas que proveen servicios estándar de colectivos cubren aproximadamente toda la Ciudad de Buenos Aires, en el sentido de que un habitante usualmente tiene al menos una estación de colectivos a menos de 300 metros de distancia.

Sin embargo algunas zonas pueden tener mejores frecuencias de servicio que otras, o mayor variedad de destinos alcanzables mediante las líneas disponibles suponiendo una distancia caminada máxima de 300 metros.

Muchas veces se utiliza la cantidad de líneas de colectivos disponibles en un área determinada como proxy de la variedad de destinos alcanzables, pero este indicador está lejos de ser óptimo. Tener 10 líneas que hacen un recorrido muy similar no es mejor que tener sólo 2 líneas que cubren recorridos diferentes.

El indicador experimental propuesto en esta herramienta consiste en calcular el total de superficie que un habitante promedio de un área determinada podría alcanzar en un solo viaje en colectivo. 

Para calcular dicho indicador sobre un punto:

1. A partir de un punto determinado (lat, lon) se buscan las líneas de colectivo que están a menos de 300 metros de distancia.
2. Se siguen las líneas de colectivo encontradas por 10 km desde el borde del radio de 300 metros alrededor del punto original (aproximadamente una hora de viaje en la Ciudad de Buenos Aires)
3. Se calcula el buffer de 300 metros de los recorridos detectados. Esto es, la superficie total alcanzable por un viajero que esté dispuesto a caminar 300 metros para tomar un colectivo y otros 300 metros desde la bajada hasta destino.

![alt text]()





## 4. Estimación de indicadores sobre el uso del suelo

## 5. Recálculo de indicadores para radios de cobertura de estaciones (buffers) y barrios (divisiones)

## 6. Recálculo de indicadores para conjuntos de radios de cobertura y para el área no cubierta

# C. Uso y características de la herramienta
## 1. Cómo usar el mapa
## 2. Divisiones de la Ciudad Autónoma de Buenos Aires
## 3. Radios de cobertura
## 4. Indicadores disponibles
### Demográficos
* "Población (cant)"
* "Densidad poblacional (hab/km2)"
* "Hombres (%)"
* "Nacidos en el exterior (%)"
* "0 a 14 años (%)"
* "15 a 64 años (%)"
* "Más de 65 años (%)"

### Socioeconómicos
* "Calidad constructiva básica (%)"
* "Calidad constructiva insuficiente (%)"
* "Calidad constructiva satisfactoria (%)"
* "Conexión a servicios básica (%)"
* "Conexión a servicios insuficiente (%)"
* "Conexión a servicios satisfactoria (%)"
* "1.49 habs por cuarto o menos (%)"
* "1.50 habs por cuarto o más (%)"
* "Ocupación de vivienda (%)"
* "Desocupación (%)"
* "Empleo (%)"
* "Inactividad (%)"
* "Est. educativos privados (cant)"
* "Est. educativos públicos (cant)"
* "Educación superior (%)"
* "Escolaridad (%)"
* "Nivel socioeconómico"
* "NBI (%)"
* "Uso de computadora (%)"
* "Hospitales (cant)"

### Uso del suelo
* "Zona comercial (%)"
* "Zona residencial (%)"
* "Zona industrial (%)"
* "Zona de servicios (%)"
* "Otros usos (%)"
* "Superficie espacios verdes (%)"

### Transporte
* "Distancia al metrobús (km)"
* "Distancia al subte (km)"
* "Distancia al ffcc (km)"
* "Sup. alcanzable en colectivo (km2)"
* "Sup. alcanzable en colectivo (% CABA)"




Mapa de Desarrollo Orientado al Transporte (DOT)
===
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [A. Introducción](#a-introducci%C3%B3n)
- [B. Uso y características de la herramienta](#b-uso-y-caracter%C3%ADsticas-de-la-herramienta)
  - [1. Cómo usar el mapa](#1-c%C3%B3mo-usar-el-mapa)
  - [2. Divisiones de la Ciudad Autónoma de Buenos Aires](#2-divisiones-de-la-ciudad-aut%C3%B3noma-de-buenos-aires)
  - [3. Radios de cobertura](#3-radios-de-cobertura)
  - [4. Indicadores disponibles](#4-indicadores-disponibles)
- [C. Metodología](#c-metodolog%C3%ADa)
  - [1. Estimación de indicadores basados en el Censo Nacional 2010](#1-estimaci%C3%B3n-de-indicadores-basados-en-el-censo-nacional-2010)
  - [2. Estimación del nivel socioeconómico de un radio censal](#2-estimaci%C3%B3n-del-nivel-socioecon%C3%B3mico-de-un-radio-censal)
  - [3. Estimación de indicadores relacionados con el transporte](#3-estimaci%C3%B3n-de-indicadores-relacionados-con-el-transporte)
  - [4. Estimación de indicadores sobre el uso del suelo](#4-estimaci%C3%B3n-de-indicadores-sobre-el-uso-del-suelo)
  - [5. Recálculo de indicadores para radios de cobertura de estaciones (buffers) y distintos niveles de agregación geográfica (divisiones)](#5-rec%C3%A1lculo-de-indicadores-para-radios-de-cobertura-de-estaciones-buffers-y-distintos-niveles-de-agregaci%C3%B3n-geogr%C3%A1fica-divisiones)
  - [6. Recálculo de indicadores para conjuntos de buffers y para el área total fuera de los mismos](#6-rec%C3%A1lculo-de-indicadores-para-conjuntos-de-buffers-y-para-el-%C3%A1rea-total-fuera-de-los-mismos)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# A. Introducción
El objetivo de esta herramienta es visualizar características de la población de la Ciudad Autónoma de Buenos Aires en relación a las áreas de influencia de los sistemas de transporte público masivo.

El tipo de preguntas que apunta a responder son:

* ¿Cuántos habitantes residen en cercanías de los sistemas de transporte público?
* ¿Cómo son esos habitantes?
* ¿Cuáles son las características de la población que está más lejos de los sistemas de transporte público?

Para esto permite realizar mapas de calor de una serie de indicadores sociales, económicos y demográficos filtrables por zonas de la ciudad y modos de transporte.

# B. Uso y características de la herramienta
## 1. Cómo usar el mapa
### Mapa de calor de indicadores por nivel de agregación geográfica
La primera funcionalidad que ofrece el mapa es la de visualizar indicadores sobre la población de la Ciudad Autónoma de Buenos Aires en distintos niveles de agregación geográfica como un mapa de calor.

Haciendo click en "Divisiones" se puede seleccionar un nivel de agregación geográfica (Ej.: "Barrios" o "Radios"). A continuación, se muestra un mapa de calor de un indicador default que puede cambiarse en la tabla de indicadores haciendo click en el indicador deseado y luego en "Divisiones" (para asignarlo a la capa de divisiones).

Si la tabla de indicadores se oculta, aparecerá en la leyenda un link con el texto "cambiar" que permite elegir el indicador deseado.

Debe tenerse en cuenta que la lista de indicadores de la tabla no es completa, son sólo algunos indicadores seleccionados por defecto. Para agregar indicadores a la lista debe hacerse click en el ícono lista a la derecha de la tabla.

#### Filtro de divisiones
En el recuadro debajo del selector de "Divisiones" se pueden aplicar filtros para seleccionar distintos conjuntos de divisiones geográficas. Cada nivel de agregación permite, al menos, la selección de unidades geográficas de su mismo nivel de agregación (si se seleccionan "Radios", se puede filtrar agregando etiquetas de radios censales según su código geográfico - ver códigos geográficos en [Divisiones de la Ciudad Autónoma de Buenos Aires](#divisiones_de_la_ciudad_autonoma_de_buenos_aires)).

Adicionalmente, algunos niveles de agregación permiten filtrar simultáneamente por conjuntos de divisiones geográficas definidas por unidades de niveles de agregación más elevados. Ejemplo: si se selecciona "Radios" y se filtra por "BELGRANO", el mapa seleccionará todos aquellos radios censales que intersecten al barrio de Belgrano. El nivel de agregación de radios censales también permite filtros por fracción censal y comuna.

El mapa selecciona conjuntos de divisiones geográficas a partir de la intersección con divisiones de mayor nivel de agregación; debe entonces notarse siempre que no es lo mismo seleccionar "BELGRANO" desde el nivel de agregación de "Barrios" que hacer lo propio habiendo seleccionado "Radios" como unidad de visualización del mapa de calor, en el segundo caso el universo de superficie y población sobre el cual se calcularán los indicadores será más grande.

Los radios censales, fracciones censales y comunas son unidades geográficas propias del Censo Nacional 2010 y, por lo tanto, son niveles de agregación geográfica consistentes: una comuna es un conjunto de fracciones censales y una fracción censal es un conjunto de radios censales. 

Sin embargo, la cartografía censal disponible no coincide perfectamente. Debe notarse que filtrar por comuna en el nivel de agregación geográfica "Radios" no arrojará el mismo conjunto de radios censales que si la selección se hiciera mediante los códigos geográficos correspondientes. Esto es una limitación de la herramienta que podría mejorarse mediante la implementación de un mecanismo adicional de filtrado por códigos geográficos (en lugar del actual, que realiza un proceso geográfico para intersectar las distintas unidades).

### Mapa de calor de indicadores por modo de transporte
Los indicadores pueden también visualizarse como un mapa de calor de radios de cobertura de estaciones de metrobús, ferrocarril, subte y premetro. Para esto debe elegirse un "Modo transporte" y una "Distancia", luego hacer click en "Agregar". Por ejemplo: si se selecciona "Subte" y "500" se estará agregando el conjunto de radios de cobertura de 500 metros desde las estaciones de subte.

Distintos modos de transporte pueden agregarse/quitarse utilizando distintos radios de cobertura para cada uno.

#### Filtro de buffers
En el recuadro debajo del selector de buffers se pueden filtrar dichos radios de cobertura de estaciones por (a) nombre de la estación y (b) nombre de la línea.

Por ejemplo: agregar la etiqueta "D (lin_subte)" provocará la selección de todas las estaciones de la línea D de subte (siempre y cuando se haya agregado el modo de transporte "Subte" con algún radio de cobertura).

La ausencia de etiquetas de filtrado es equivalente a la presencia de todas ellas simultáneamente: ambas posibilidades indican a la herramienta que todas las estaciones de los modos de transporte agregados deben ser seleccionadas.

Si una línea de un modo de transporte está seleccionada (hay un filtro activo) y se agrega un nuevo modo de transporte, se agregarán automáticamente todas las etiquetas de las líneas del modo de transporte agregado. Esta característica puede ser útil si se desea visualizar todas las líneas de un modo de transporte menos una: basta con seleccionar primero cualquier línea de otro modo de transporte, agregar el modo de transporte de interés y, a continuación, remover todas aquellas líneas que no se desee tener en cuenta en el cálculo.

### Cálculo de indicadores para la zona cubierta y no cubierta por modos de transporte

Si se seleccionan ambos mapas de calor (divisiones y buffers), la tabla de indicadores ahora muestra las características de la población que queda dentro del área de cobertura de los distintos modos de transporte seleccionados y las de la población que queda fuera de la misma. 

Como se explicó anteriormente, el cálculo se realiza en el momento, de manera que el usuario percibirá una demora mayor en visualizar la tabla que en los otros casos.

## 2. Divisiones de la Ciudad Autónoma de Buenos Aires
Las divisiones geográficas disponibles de la Ciudad de Buenos Aires son 4:

* **Radios censales ("Radios"):** código de la forma 1_1_1 (comuna_fracción_radio)
* **Fracciones censales ("Fracciones"):** código de la forma 001_1 (comuna_fracción)
* **Comunas ("Comunas"):** código de la forma 1 (número de comuna)
* **Barrios ("Barrios"):** se utiliza el nombre oficial del barrio como en "VILLA SOLDATI"

Los códigos geográficos utilizados provienen de la [cartografía censal](http://www.estadisticaciudad.gob.ar/eyc/?page_id=827) de la Dirección General de Estadística y Censos del GCBA.

## 3. Radios de cobertura
Los radios de cobertura disponibles son:

* **300** metros
* **500** metros
* **750** metros
* **1000** metros
* **1500** metros
* **2000** metros

## 4. Indicadores disponibles
### Demográficos
**Población (M)**: Población total en 2010 (millones de habitantes) - Censo Nacional 2010 (INDEC)

**Superficie (km2)**: Superficie total (kilómetros cuadrados) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA)

**Densidad poblacional (miles hab/km2)**: Densidad poblacional en 2010 (miles de habitantes por kilómetro cuadrado) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y Censo Nacional 2010 (INDEC)

**Hombres (%)**: Proporción de habitantes de sexo masculino (%) - Censo Nacional 2010 (INDEC)

**Extranjeros (%)**: Proporción de habitantes nacidos en el extranjero (%) - Censo Nacional 2010 (INDEC)

**0 a 14 años (%)**: Proporción de la población con 14 años de edad o menos en 2010 (%) - Censo Nacional 2010 (INDEC)

**15 a 64 años (%)**: Proporción de la población con entre 15 y 64 años de edad en 2010 (%) - Censo Nacional 2010 (INDEC)

**Más de 65 años (%)**: Proporción de la población con 65 años de edad o más en 2010 (%) - Censo Nacional 2010 (INDEC)

### Socioeconómicos
**Calidad constructiva básica (%)**: Proporción de viviendas cuya calidad constructiva es básica en 2010 (%) - Censo Nacional 2010 (INDEC)

**Calidad constructiva insuficiente (%)**: Proporción de viviendas cuya calidad constructiva es  insuficiente en 2010 (%) - Censo Nacional 2010 (INDEC)

**Calidad constructiva satisfactoria (%)**: Proporción de viviendas cuya calidad constructiva es  satisfactoria en 2010 (%) - Censo Nacional 2010 (INDEC)

**Conexión a servicios básica (%)**: Proporción de viviendas cuya calidad de conexión a servicios básicos es básica en 2010 (%) - Censo Nacional 2010 (INDEC)

**Conexión a servicios insuficiente (%)**: Proporción de viviendas cuya calidad de conexión a servicios básicos es insuficiente en 2010 (%) - Censo Nacional 2010 (INDEC)

**Conexión a servicios satisfactoria (%)**: Proporción de viviendas cuya calidad de conexión a servicios básicos es satisfactoria en 2010 (%) - Censo Nacional 2010 (INDEC)

**1.49 habs por cuarto o menos (%)**: Proporción de hogares con 1.49 habitantes por cuarto o menos en 2010 (%) - Censo Nacional 2010 (INDEC)

**1.50 habs por cuarto o más (%)**: Proporción de hogares con 1.50 habitantes por cuarto o más en 2010 (%) - Censo Nacional 2010 (INDEC)"

**Ocupación de vivienda (%)**: Proporción de viviendas ocupadas en 2010 (%) - Censo Nacional 2010 (INDEC)

**Desocupación (%)**: Proporción de habitantes desocupados sobre la población económicamente activa, definida como la suma de habitantes ocupados y desocupados en 2010 (%) - Censo Nacional 2010 (INDEC)

**Empleo (%)**: Proporción de habitantes empleados sobre la cantidad de habitantes con 14 años o más en 2010 (%) - Censo Nacional 2010 (INDEC)

**Inactividad (%)**: Proporción de habitantes inactivos sobre la cantidad de habitantes con 14 años o más en 2010 (%) - Censo Nacional 2010 (INDEC)

**Nivel socioeconómico**: Nivel socioeconómico basado en la segmentación del primer componente principal de la variabilidad de los índices de escolaridad, educación superior y computadora en el hogar en 2010 - Cálculo a partir de Censo Nacional 2010 (INDEC)

**Est. educativos privados (unidades)**: Cantidad de establecimientos educativos privados en 2014 (unidades) - Cálculo a partir de establecimientos educativos georreferenciados por Ministerio de Educación (GCBA)

**Est. educativos públicos (unidades)**: Cantidad de establecimientos educativos públicos en 2014 (unidades) - Cálculo a partir de establecimientos educativos georreferenciados por Ministerio de Educación (GCBA)

**Índice de educación superior (%)**: Proporción de habitantes mayores a 25 años con educación universitaria completada en 2010 (%) - Censo Nacional 2010 (INDEC)

**Índice de escolaridad (%)**: Proporción de habitantes menores a 18 años que asiste a un establecimiento educativo en 2010 (%) - Censo Nacional 2010 (INDEC)

**NBI (%)**: Proporción de hogares con al menos una necesidad básica insatisfecha en 2010 (%) - Censo Nacional 2010 (INDEC)

**Índice de computadora en el hogar (%)**: Proporción de hogares con computadora sobre el total de hogares equipados con al menos uno de los siguientes elementos: heladera, computadora, teléfono celular o teléfono de línea, en 2010 (%) - Censo Nacional 2010 (INDEC)

**Hospitales (unidades)**: Cantidad de hospitales en 2014 (unidades) - Cálculo a partir de hospitales georreferenciados por el Ministerio de Salud (GCBA)

### Uso del suelo
**Zona comercial (%)**: Proporción de la superficie destinada a uso comercial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)

**Zona residencial (%)**: Proporción de la superficie destinada a uso residencial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)

**Zona industrial (%)**: Proporción de la superficie destinada a uso industrial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)

**Zona de servicios (%)**: Proporción de la superficie destinada a uso de servicios en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)

**Otros usos (%)**: Proporción de la superficie destinada a otros usos en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)

**Superficie espacios verdes (%)**: Proporción de espacios verdes sobre la superficie total en 2013 (%) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y espacios verdes georreferenciados por la Unidad de Sistemas de Información Geográfica (GCBA)

### Transporte
**Distancia al ffcc (m)**: Distancia del centroide de un radio censal a la estación más cercana de ferrocarril o promedio ponderado por población de este indicador para otras unidades geográficas en 2015 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de ferrocarril georreferenciadas por Ministerio de Desarrollo Urbano (GCBA) y Censo Nacional 2010 (INDEC)

**Distancia al metrobús (m)**: Distancia del centroide de un radio censal a la estación más cercana de metrobús o promedio ponderado por población de este indicador para otras unidades geográficas en 2014 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de metrobús georreferenciadas por la Subsecretaría de Transporte (GCBA) y Censo Nacional 2010 (INDEC)

**Distancia al subte (m)**: Distancia del centroide de un radio censal a la estación más cercana de subte o promedio ponderado por población de este indicador para otras unidades geográficas en 2015 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de subte georreferenciadas por el Ministerio de Desarrollo Urbano (GCBA) y Censo Nacional 2010 (INDEC)

**Sup. alcanzable en 1 colectivo (km2)**: Superficie alcanzable media estimada viajando hasta 10 kilómetros en un solo servicio de colectivos, sin trasbordos, en 2015. Se toma una distancia máxima recorrida a pie de 300 metros, tanto para abordar el servicio desde el punto de origen como para llegar al punto de destino una vez abandonada la unidad (kilómetros cuadrados) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y trazado georreferenciado de recorridos de colectivos por Unidad de Sistemas de Información Geográfica (GCBA)

**Sup. alcanzable en 1 colectivo (% CABA)**: Superficie alcanzable media estimada viajando hasta 10 kilómetros en un solo servicio de colectivos, sin trasbordos, en 2015. Se toma una distancia máxima recorrida a pie de 300 metros, tanto para abordar el servicio desde el punto de origen como para llegar al punto de destino una vez abandonada la unidad (proporción de kilómetros cuadrados sobre la superficie total de la CABA) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y trazado georreferenciado de recorridos de colectivos por Unidad de Sistemas de Información Geográfica (GCBA)

# C. Metodología
## 1. Estimación de indicadores basados en el Censo Nacional 2010
Una gran parte de los indicadores utilizados en esta herramienta se basan en datos del Censo Nacional 2010.

Los indicadores relacionados con (a) mercado de trabajo, (b) calidad de la vivienda, (c) nivel educativo, (d) estructura etaria y otros basados en datos del Censo Nacional 2010, respetan las definiciones censales usuales (Ej.: La tasa de inactividad se calcula como los inactivos sobre la población de 14 años o más) o son porcentajes de frecuencias simples sobre el total de casos.

Al no representar complicaciones metodológicas mayores, se remite al apartado final donde se listan todos los indicadores con sus descripciones.

## 2. Estimación del nivel socioeconómico de un radio censal
La siguiente metodología permite obtener una estimación del nivel socioeconómico de un radio censal de la Ciudad Autónoma de Buenos Aires. Esta metodología es una adaptación con modificaciones de la utilizada por el ITDP de México (Instituto de Políticas para el Transporte y el Desarrollo) para la estimación del nivel socioeconómico de un área geoestadística básica (AGEB) de la Zona Metropolitana del Valle de México (ZMVM).

En líneas generales, consiste en realizar un análisis de componentes principales a partir de tres índices que reflejan diferentes aspectos del nivel socioeconómico de un radio censal de la Ciudad. 

Esta técnica busca encontrar las causas de la variabilidad de un conjunto de datos y ordernarlas por importancia. De esta manera, se construye una lista de componentes principales (que son combinaciones lineales de los índices utilizados) ordenadas por el grado de poder explicativo que tienen sobre la variabilidad de los tres índices.

El primer componente principal construido a partir de estos tres índices es utilizado después para ordenar los radios censales por nivel socioeconómico.

Todos los datos utilizados para calcular los índices que componen el nivel socioeconómico provienen de la [base de datos REDATAM del Censo Nacional 2010](http://200.51.91.245/argbin/RpWebEngine.exe/PortalAction?BASE=CPV2010B).

$IndiceComputadora = \frac{NúmeroDeHogaresConComputadora}{ConComputadora \cup ConHeladera \cup ConCelular \cup ConTeléfono}$

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

### Distancias
Para cada radio censal se calculó la distancia de su centroide a la estación más cercana (Ej.: la distancia del centroide de un radio censal a la estación de subte más cercana).

Suponiendo una distribución uniforme de la población dentro del radio censal, esta distancia se aproximaría a la distancia promedio de todos los habitantes hasta la estación más cercana del modo de transporte del que se trate.

Para los niveles de agregación geográficos superiores se realizó un promedio ponderado de este indicador. Ver [cómo se recalculan indicadores](#5-recálculo-de-indicadores-para-radios-de-cobertura-de-estaciones-buffers-y-distintos-niveles-de-agregación-geográfica-divisiones) para más detalles.

### Superficie alcanzada por colectivos
Las líneas que proveen servicios estándar de colectivos cubren aproximadamente toda la Ciudad de Buenos Aires, en el sentido de que un habitante usualmente tiene al menos una estación de colectivos a menos de 300 metros de distancia.

Sin embargo algunas zonas pueden tener mejores frecuencias de servicio que otras, o mayor variedad de destinos alcanzables mediante las líneas disponibles suponiendo una distancia caminada máxima de 300 metros.

Muchas veces se utiliza la cantidad de líneas de colectivos disponibles en un área determinada como proxy de la variedad de destinos alcanzables, pero este indicador está lejos de ser óptimo. Tener 10 líneas que hacen un recorrido muy similar no es mejor que tener sólo 2 líneas que cubren recorridos diferentes.

El indicador experimental propuesto en esta herramienta consiste en calcular el total de superficie que un habitante promedio de un área determinada podría alcanzar en un solo viaje en colectivo. 

Para calcular dicho indicador sobre un punto:

1. A partir de un punto determinado (lat, lon) se buscan las líneas de colectivo que están a menos de 300 metros de distancia.
2. Se siguen las líneas de colectivo encontradas por 10 km desde el borde del radio de 300 metros alrededor del punto original (aproximadamente una hora de viaje en la Ciudad de Buenos Aires)
3. Se calcula el buffer de 300 metros de los recorridos detectados. Esto es, la superficie total alcanzable por un viajero que esté dispuesto a caminar 300 metros para tomar un colectivo y otros 300 metros desde la bajada hasta destino.

*Líneas de colectivo que intersectan el buffer de 300 metros de un punto y sus propios buffers de 300 metros (zoom in)*
![](https://raw.githubusercontent.com/gcba/tod/master/docs/images/reachability%201.png)

*Superficie total alcanzable por las íneas de colectivo que intersectan el buffer de 300 metros de un punto (zoom out)*
![](https://raw.githubusercontent.com/gcba/tod/master/docs/images/reachability%202.png)

Calcular el indicador de llegabilidad para los habitantes de un área, sin embargo, requiere calcular la superficie alcanzable para distintos puntos del área y realizar un promedio entre ellas. 

No se puede simplemente utilizar las líneas de colectivos que intersectan el área en cuestión, algunas de estas pueden estar a más de 300 metros de algunos habitantes del área (especialmente para radios censales de gran superficie). Para solucionar este aspecto se adoptó un enfoque pragmático en el que se promedia el resultado de calcular el indicador para una serie de puntos equidistantes entre sí que están dentro del área en cuestión. 

Para calcular el indicador sobre un área:

1 . Se crea una malla de puntos equidistantes a 100 metros que intersecten con el área.

*Puntos equidistantes a 100 metros dentro del radio censal 14_1_8*
![](https://raw.githubusercontent.com/gcba/tod/master/docs/images/reachability%203.png)

2 . Se calcula la superficie alcanzable desde cada uno de los puntos, siguiendo el procedimiento descripto anteriormente.

*Buffers de 300 metros de los puntos equidistantes contenidos dentro del radio censal 14_1_8*
![](https://raw.githubusercontent.com/gcba/tod/master/docs/images/reachability%204.png)

*Superficie alcanzable total de cada uno de los puntos equidistantes contenidos dentro del radio censal 14_1_8*
![](https://raw.githubusercontent.com/gcba/tod/master/docs/images/reachability%205.png)

3 . Se realiza un promedio simple entre las superficies alcanzables de cada uno de los puntos de la malla. 

Se considerará a este promedio como aproximadamente representativo de la superficie alcanzable por el habitante medio del área en cuestión. Esta aproximación pierde precisión cuanto más heterogéneamente distribuida esté la población dentro del área (el promedio debería ser ponderado por cantidad de habitantes). 

Por otro lado, el cálculo de este indicador gana en precisión cuando la distancia elegida entre los puntos de la malla se achica. Utilizar una malla de puntos equidistantes a 100 metros en lugar de una de 200 provee más puntos cuya superficie alcanzable es certera. En el límite, si achicáramos la distancia entre los puntos al mínimo posible, se estaría realizando un promedio de las superficies alcanzables desde cada uno de los puntos del área. Esto incrementa la precisión del indicador al costo de una mayor capacidad computacional necesaria.

## 4. Estimación de indicadores sobre el uso del suelo
Para estimar los porcentajes de uso del suelo de cada división geográfica de la Ciudad Autónoma de Buenos Aires se utilizó el [Relevamiento de Usos del Suelo](http://data.buenosaires.gob.ar/dataset/relevamiento-usos-suelo) de 2011 de la Secretaría de Planeamiento del Ministerio de Desarrollo Urbano del GCBA. 

El RUS toma la forma de un dataset de puntos (lat, lon) donde el uso del suelo fue relevado en el año de referencia. Dicho dataset no cuenta con una indicación de la superficie afectada a ese uso; para asignarles una superficie se utilizaron las parcelas del Registro de Obras y Catastro.

Cabe aclarar que las parcelas no siempre están contenidas en su totalidad por un radio censal: 778 parcelas (sobre un total de 318811) pertenecen a más de uno de ellos. En esta versión de indicadores sobre uso del suelo se asignó un solo radio censal a cada una de las parcelas (una futura versión más compleja de este indicador podría incorporar todos los radios a los que pertenecen) de manera tal que en el caso de las parcelas partidas se tomó uno sólo de los radios censales con los que intersectan y se le asignó el área intersectada en lugar del área total de la parcela.

Este aspecto introduce una distorsión en el cálculo de los porcentajes de uso del suelo de cada radio censal ya que en algunos casos hay radios con "áreas ignoradas". El total de superficie ignorada asciende a casi un 7% de la superficie catastral o a menos de un 5% de la superficie total de la CABA. Para esta versión experimental se consideró como un margen de error aceptable, pero cabe resaltar que en algunas áreas de la Ciudad esta distorsión puede ser más importante que en otras.

Pasos para replicar el cálculo de uso del suelo:

(*tratar de clarificar este tema: más acotado es más claro, se podría hacer mejor preprocesando la capa*)

1. Se asigna un uso del suelo (residencial, comercial, industrial, servicios u otros) a cada punto del RUS según una [clasificación](https://github.com/gcba/tod/raw/master/data/RUS_clasif_rama1.xlsx) desarrollada específicamente para este caso, basada en la agregación de categorías de la variable "rama1".
2. Se asignan parcelas del Catastro a los puntos del RUS.
3. Se asignan radios censales a parcelas del Catastro.
    * Primero se asignan radios censales a aquellas parcelas completamente contenidas por un radio censal
    * En segundo lugar se asignan radios censales a aquellas parcelas parcialmente contenidas por un radio censal
4. Se crea una columna en el dataset que contiene el área de la parcela que intersecta con el radio censal asignado (en la mayoría de los casos, esto es igual al área completa de la parcela ya que esta se encuentra contenida por completo en el radio censal).
5. Se calcula la cantidad de repeticiones de cada parcela en el dataset, luego se crea una columna adicional donde se divide cada área por la cantidad de veces que esa parcela está repetida. En este paso se asume que el área de una parcela con más de un uso del suelo relevado se divide en partes iguales entre sus distintos usos.
6. Se agrupa el dataset por radio censal y uso del suelo. En este punto se calcula el porcentaje de superficie catastral destinado a cada uso del suelo sobre el porcentaje total de superficie catastral de cada radio censal. Se obtiene así una medida de la proporción de uso del suelo de cada radio censal.

## 5. Recálculo de indicadores para radios de cobertura de estaciones (buffers) y distintos niveles de agregación geográfica (divisiones)

### Reestimación de indicadores para radios de cobertura de estaciones (buffers)

Todos los indicadores calculados a nivel de radio censal fueron reestimados para las áreas en torno a estaciones de metrobús, ferrocarril, subte y premetro a 300, 500, 750, 1000, 1500 y 2000 metros de distancia en torno al punto de la estación.

La reestimación de indicadores para áreas de influencia de estaciones (buffers) se realiza como un promedio ponderado por población o superficie (según sea más indicado para el tipo de indicador de que se trate) de los indicadores de cada radio censal contenido dentro del área para la cual se realiza la reestimación.

La fórmula de cálculo más sencilla para indicadores ponderados por población sería la siguiente:

$IndicBuffer = \frac{IndicR1 * PoblR1 + IndicR2 * PoblR2 + ... + IndicRN * PoblRN}{PoblR1 + PoblR2 + ... + PoblRN}$

* *IndicBuffer*: Indicador reestimado para el buffer o área de influencia de una estación.
* *IndicR1*: Indicador original del radio censal número 1.
* *PoblR1*: Población del radio censal número 1.

Sin embargo, el cálculo adquiere complejidad cuando el área en cuestión intersecta radios censales que sólo tienen una porción de su superficie dentro del área. El indicador del radio censal representa a una cantidad de población mayor que la que cae dentro del área de influencia de la estación, de manera que la fórmula anterior estaría sobreponderando a aquellos radios censales cuya superficie no está enteramente contenida por el área alrededor de la estación.

Para corregir estos casos se multiplicó la población de los radios censales por la proporción de superficie del radio censal que intersecta al área de influencia de la estación. De esta manera, si el radio censal A tiene 300 habitantes pero sólo un 30% de su superficie intersecta el área alrededor de una estación, el ponderador a utilizar para ese radio censal será de 90 personas.

$IndicBuffer = \frac{IndicR1 * PoblR1 * \frac{SupR1In}{SupR1Total} + ... + IndicRN * PoblRN * \frac{SupRNIn}{SupRNTotal}}{PoblR1 * ProporciónR1In + ... + PoblRN * ProporciónRNIn}$

* *IndicBuffer*: Indicador reestimado para el buffer o área de influencia de una estación.
* *IndicR1*: Indicador original del radio censal número 1.
* *PoblR1*: Población del radio censal número 1.
* *SupR1*: Superficie del radio censal número 1.

La pertinencia de este procedimiento requiere suponer que la población se distribuye homogéneamente hacia adentro de todos los radios censales. Si el 30% de la superficie de un radio censal con 100 personas intersecta el área de influencia de una estación de subte pero toda la población reside en el 70% restante de la superficie (el caso más extremo) que está fuera, el cálculo se vería distorsionado por considerar que 30 personas de ese radio censal viven dentro del área.

Las distorsiones más significativas en este sentido se dan cuando grandes superficies de un radio censal tienen un uso alternativo al residencial. Este es el caso, por ejemplo, de la presencia de espacios verdes (en los espacios verdes no reside ningún habitante).

De esta forma, la ecuación anterior debe corregirse para atenuar la distorsión del supuesto de homogeneidad en la distribución de la población y así evitar ponderar de la misma manera superficies con distintas proporciones de espacios verdes.

$IndicBuffer = \frac{IndicR1 * PoblR1 * \frac{SupR1In - SupR1VerdeIn}{SupR1Total - SupR1VerdeTotal} + ... + IndicRN * PoblRN * \frac{SupRNIn - SupRNVerdeIn}{SupRNTotal - SupRNVerdeTotal}}{PoblR1 * ProporciónR1NoVerdeIn + ... + PoblRN * ProporciónRNNoVerdeIn}$

* *IndicBuffer*: Indicador reestimado para el buffer o área de influencia de una estación.
* *IndicR1*: Indicador original del radio censal número 1.
* *PoblR1*: Población del radio censal número 1.
* *SupR1*: Superficie del radio censal número 1.
* *SupR1Verde*: Superficie de espacios verdes del radio censal número 1.
* *ProporciónR1NoVerde*: Proporción de la superfice "no verde" del radio censal número 1 que intersecta al área "no verde" alrededor de una estación.

Finalmente, en esta versión del mapa los indicadores reestimados para buffers se calcularon siguiendo esta última ecuación. Cabe mencionar que una versión superadora de esta metodología podría utilizar información del relevamiento de usos del suelo para mejorar la precisión de la ponderación de indicadores de radios censales que intersectan parcialmente el área de influencia de una estación.

A modo de ejemplo, podrían considerarse únicamente las zonas residenciales para el cálculo del ponderador, de forma tal que la ecuación se vería modificada de la siguiente manera:

$IndicBuffer = \frac{IndicR1 * PoblR1 * \frac{SupResidencialR1In}{SupResidencialR1Total} + ... + IndicRN * PoblRN * \frac{SupResidencialRNIn}{SupResidencialRNTotal}}{PoblR1 * ProporciónResidencialR1In + ... + PoblRN * ProporciónResidencialRNIn}$

* *IndicBuffer*: Indicador reestimado para el buffer o área de influencia de una estación.
* *IndicR1*: Indicador original del radio censal número 1.
* *PoblR1*: Población del radio censal número 1.
* *SupResidencialR1*: Superficie residencial del radio censal número 1.
* *ProporciónResidencialR1*: Proporción de la superfice residencial del radio censal número 1 que intersecta al área residencial alrededor de una estación.

La precisión de estas reestimaciones es mayor a medida que (a) el radio elegido del buffer es más grande (un buffer de 300 metros tiene una proproción mayor de casos de intersección parcial sobre la superficie total del buffer que uno de 2000 metros) y (b) la unidad geográfica original a partir de la cual se reestiman los indicadores es más chica (es mejor utilizar radios censales que fracciones censales).

### Reestimación de indicadores para distintos niveles de agregación geográfica (divisiones)

Siempre que fue posible, los indicadores se construyeron a partir de información originalmente publicada en el nivel de agregación geográfico adecuado (se descargaron los datos correspondientes del Censo Nacional a nivel de radio censal, fracción censal y comuna).

En los casos en que un indicador se construyó a partir de otras fuentes, la estimación original se realizó a nivel de radio censal (la división geográfica más pequeña). La reestimación para niveles mayores de agregación geográfica (fracción censal y comuna) se realizó simplemente como un promedio ponderado por población (casi todos) o superficie (indicadores relacionados con el uso del suelo) de los radios censales que componen las fracciones censales o las comunas. En este caso, una fracción censal o comuna siempre contiene completamente a los radios censales que la intersectan.

Sin embargo, un nivel de agregación geográfica muy común en la Ciudad de Buenos Aires es la que surge de dividir a la ciudad en "barrios". Frecuentemente, un habitante de la ciudad comprenderá mejor el área geográfica de que se trate si se le dice "barrio de Palermo" en lugar de "Comuna 14".

Los barrios no necesariamente agrupan radios censales y se dan casos en los que parte de la superficie de un radio censal pertenece a un barrio mientras que el resto pertenece a otro u otros. En este caso, la reestimación de indicadores de radios censales para barrios se realizó siguiendo el mismo procedimiento que el descripto anteriormente para el caso de las áreas de influencia de una estación.

## 6. Recálculo de indicadores para conjuntos de buffers y para el área total fuera de los mismos

Cuando se selecciona tanto un nivel de agregación geográfica de la ciudad (divisiones) con o sin filtros y una o más capas de buffers de distintos modos de transporte, el mapa muestra una lista de indicadores para la población dentro de los buffers (*In*), fuera de los buffers (*Out*) y para la población total seleccionada en el filtro de divisiones elegido (*All*).

Si los buffers no se superpusieran entre sí, el cálculo de los indicadores para la población dentro de los mismos podría realizarse simplemente mediante un promedio ponderado por población o superficie utilizando los datos ya calculados para cada buffer.

Este procedimiento debe descartarse cuando los buffers se superponen (la mayor parte de los casos), ya que en varias ocasiones se estaría contabilizando la misma población más de una vez.

El procedimiento adoptado en este caso es similar al descripto para la reestimación de indicadores por buffer, en su versión más sencilla, y a partir de los datos de fracciones censales en lugar de los de radios censales.

De esta manera, se computa la unión entre todos los buffers seleccionados y se aplica la siguiente ecuación sobre la figura geográfica resultante:

$IndicBuffersIn = \frac{IndicF1 * PoblF1 * \frac{SupF1In}{SupF1Total} + ... + IndicFN * PoblFN * \frac{SupFNIn}{SupFNTotal}}{PoblF1 * ProporciónF1In + ... + PoblFN * ProporciónFNIn}$

* *IndicBuffersIn*: Indicador reestimado para un conjunto de buffers o áreas de influencia de distintas estaciones.
* *IndicF1*: Indicador original de la fracción censal número 1.
* *PoblF1*: Población de la fracción censal número 1.
* *SupF1*: Superficie de la fracción censal número 1.

La reestimaciones de indicadores realizadas con este procedimiento requieren de una capacidad computacional significativa para procesar las operaciones geográficas que dan lugar al cálculo de los ponderadores, cuanto más chicas las unidades geográficas habrá mayor cantidad de ellas y el cálculo tardará más.

En este caso, el cálculo debe hacerse en el momento ya que depende de la selección particular de buffers y divisiones que haga el usuario. El compromiso entre precisión del resultado y usabilidad requirió que este cálculo se realice sin la corrección por espacios verdes y utilizando unidades de agregación geográfica más grandes (fracciones censales) como insumo primario de información.

Las distorsiones de este procedimiento, de todas maneras, son menores respecto del caso de cálculo de indicadores para un buffer individual ya que la proporción de divisiones geográficas (en este caso, fracciones censales) en situación de intersección parcial con un conjunto de buffers es menor que en el caso de buffers individuales (una parte importante de los bordes de los buffers se superpone con otros buffers, eliminando casos de intersección parcial).


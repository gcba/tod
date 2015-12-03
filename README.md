<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [TOD (Transport Oriented Development)](#tod-transport-oriented-development)
  - [Introducción](#introducci%C3%B3n)
  - [Instalación](#instalaci%C3%B3n)
  - [De los datos originales a los shapefiles para CartoDB](#de-los-datos-originales-a-los-shapefiles-para-cartodb)
  - [Agradecimientos](#agradecimientos)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# TOD (Transport Oriented Development)
Herramienta de visualización de características poblacionales de la Ciudad Autónoma de Buenos Aires en relación a las zonas de influencia de los distintos sistemas de transporte público.

## Introducción
Esta herramienta utiliza datos del Censo Nacional 2010, la cartografía censal de la Ciudad de Buenos Aires y distintos datasets públicos para describir en un mapa interactivo características sociales, económicas y demográficas de la población de la ciudad, dentro y fuera del área de cobertura de las estaciones de 4 sistemas de transporte público masivo: metrobús, ferrocarril, subte y premetro.

El mapa fue desarrollado por Agustín Benassi ([@abenassi](https://github.com/abenassi)) en el marco del programa de Innovadores Residentes del Laboratorio de Gobierno de la Ciudad de Buenos Aires y constituye un prototipo experimental para uso de la Subsecretaría de Transporte del GCBA.

El objetivo de este producto es testear el potencial que puede tener el desarrollo de este tipo de herramientas para mejorar y agilizar las tareas de análisis del equipo de transporte.

El mapa final puede ser visualizado [acá](http://gcba.github.io/tod).

El **master** branch contiene una serie de jupyter notebooks escritos en python que toman los datos originales utilizados y construyen una base de datos preprocesada y lista para subir a una cuenta de [CartoDB](https://cartodb.com/). Los notebooks deben ejecutarse en orden (del 1 al 5) y en cada uno pueden especificarse algunos parámetros, agregar o quitar indicadores, modificar aspectos del cálculo de algunos de ellos, etc.

La carpeta *scripts* contiene módulos escritos en python con métodos utilizados por los notebooks.

En el branch **gh-pages** se encuentra el código html, css y JavaScript que construye el frontend del mapa a partir de tener los 4 shapefiles generados por los ipython notebooks cargados en un mapa de CartoDB.

## Instalación
Si bien no es estrictamente necesario, se recomienda instalar la distribución [Anaconda](https://www.continuum.io/downloads) con python 2.7.

Luego se deben seguir los siguientes pasos:

1. `conda create -n tod python=2` *Crea un nuevo entorno virtual*
2. `cd directorio_del_repositorio`
3. `source activate tod` (Mac) o `activate tod` (Windows) *Activa el entorno*
4. `pip install -r requirements.txt` *Instala las dependencias*
5. `deactivate` *Desactiva el entorno cuando se termine de usar*

Una vez creado un entorno virtual con las dependencias de la herramienta, se pueden abrir los distintos ipython notebook que construyen la base de datos siguiendo estos pasos:

1. `source activate tod`
2. `cd directorio_del_repositorio`
3. `ipython notebook`

## De los datos originales a los shapefiles para CartoDB

1.**Crear buffers**: toma los shapefiles de estaciones de metrobús, ferrocarril, subte y premetro, y crea los shapefiles de los buffers a 300, 500, 750, 1000, 1500 y 2000 metros de cada uno de ellos.
2.**Intersectar buffers con radios y fracciones censales**: superpone los buffers creados con radios y fracciones censales para calcular el % de la superficie de cada radio o fracción que intersecta a cada buffer.
3.**Crear indicadores por radio y fracción censal**: descarga datos del Censo Nacional 2010 y crea indicadores a partir de ellos a nivel de radio censal (RADIO), fracción censal (FRAC) y comuna (DPTO).
    * **3b. Precio de terrenos**: analiza la creación de un promedio de precios de terrenos por fracción censal.
    * **3c. Indice de conectividad de colectivos**: crea un indicador de "llegabilidad" para servicios estándar de colectivos.
    * **3d. Uso del suelo**: crea indicadores de uso porcentual del suelo para radios censales.
    * **3e. Otros indicadores**: crea indicadores de indicencia de espacios verdes, cantidad de escuelas y hospitales, y distancia media de los habitantes a estaciones de los distintos modos de transporte.
4.**Recalcular indicadores por buffer y otros niveles de agregación**: recalcula todos los indicadores creados a nivel de radio censal para cada uno de los buffers creados en el paso 1 construyendo ponderadores basados en los % de superficie intersectada calculados en el paso 2. Recalcula algunos indicadores para niveles de agregación superiores a los originales (Por ej.: el índice de conectividad de colectivos se crea para radios censales y luego se calcula como un promedio ponderado para fracciones censales, barrios y comunas)
5. Crear capas para CartoDB: a partir de todos los shapefiles y datos creados en los pasos anteriores, se crean 4 shapefiles para subir a CartoDB haciendo un merge de varios de ellos.

Los 4 shapefiles creados desde los ipython notebooks se encuentran en la carpeta *indicadores*:

* **divisiones**: contiene los shapes de radios censales, fracciones censales, barrios y comunas con todos los indicadores calculados en los pasos 3 y 4.
* **buffers_estaciones**: contiene todos los shapes de buffers de estaciones de los distintos modos de transporte para cada radio de cobertura calculado, con todos los indicadores calculados en el paso 4.
* **lineas**: contiene los shapes de las líneas de los distintos modos de transporte.
* **estaciones**: contiene los shapes de las estaciones de los distintos modos de transporte.

Estos shapefiles deben subirse a una cuenta de CartoDB y crear un mapa agregándolos como 4 capas respetando el siguiente orden: la capa más baja debe ser **divisiones**, la siguiente **buffers_estaciones** y la más alta **estaciones**. Las capas de **divisiones** y **buffers_estaciones** deben tener leyendas activadas (los colores y estilos de estas serán modificados programáticamente más adelante) mientras que las de **estaciones** y **lineas** deben tenerlas desactivadas. Estas últimas dos capas, además, pueden tener un infowindow con los campos que se desee (nombre de estación y nombre de línea, por ejemplo).

El scope del **master** branch llega hasta este punto: la creación de los shapefiles para subir a CartoDB. La puesta a punto del sitio web que utiliza este mapa de CartoDB se cubre en el README del branch **gh-pages**.

## Agradecimientos

* Pablo Lorenzatto ([@plorenzatto](https://github.com/plorenzatto)) por la idea original y brainstorming posterior sobre el indicador de llegabilidad de servicios de colectivos estándar, y por su ayuda en la optimización de consultas geográficas.
* Nacho Leguizamon ([@dorisphanic](https://twitter.com/dorisphanic)) y Mercedes Fiz ([@mechafiz](https://twitter.com/mechafiz)) por la asistencia en el diseño y la usabilidad del mapa.
* Carolina Hadad ([@chadad](https://github.com/chadad)) por la asistencia en el armado de mock ups y consejos técnicos varios



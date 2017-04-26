# TOD (Transport Oriented Development) - Backend

[![Build Status](https://travis-ci.org/gcba/tod.svg)](https://travis-ci.org/gcba/tod)

Herramienta de visualización de características poblacionales de la Ciudad Autónoma de Buenos Aires en relación a las zonas de influencia de los distintos sistemas de transporte público.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Introducción](#introducci%C3%B3n)
- [Instalación](#instalaci%C3%B3n)
- [De los datos originales a los shapefiles para CartoDB](#de-los-datos-originales-a-los-shapefiles-para-cartodb)
- [Estructura del directorio](#estructura-del-directorio)
- [Agradecimientos](#agradecimientos)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introducción
Esta herramienta utiliza datos del Censo Nacional 2010, la cartografía censal de la Ciudad de Buenos Aires y distintos datasets públicos para describir en un mapa interactivo características sociales, económicas y demográficas de la población de la ciudad, dentro y fuera del área de cobertura de las estaciones de 4 sistemas de transporte público masivo: metrobús, ferrocarril, subte y premetro.

El mapa fue desarrollado por Agustín Benassi ([@abenassi](https://github.com/abenassi)) en el marco del programa de Innovadores Residentes del Laboratorio de Gobierno de la Ciudad de Buenos Aires y constituye un prototipo experimental para uso de la Subsecretaría de Transporte del GCBA.

El objetivo de este producto es testear el potencial que puede tener el desarrollo de este tipo de herramientas para mejorar y agilizar las tareas de análisis del equipo de transporte.

El **mapa** final puede ser visualizado [acá](http://gcba.github.io/tod).

La **documentación metodológica** completa puede ser consultada [acá](http://gcba.github.io/tod/nota_metodologica).

El **master** branch contiene una serie de jupyter notebooks escritos en python que toman los datos originales utilizados y construyen una base de datos preprocesada y lista para subir a una cuenta de [CartoDB](https://cartodb.com/). Los notebooks deben ejecutarse en orden (del 1 al 5) y en cada uno pueden especificarse algunos parámetros, agregar o quitar indicadores, modificar aspectos del cálculo de algunos de ellos, etc.

La carpeta *scripts* contiene módulos escritos en python con métodos utilizados por los notebooks.

En el branch **gh-pages** se encuentra el código html, css y JavaScript que construye el frontend del mapa a partir de tener los 4 shapefiles generados por los ipython notebooks cargados en un mapa de CartoDB.

## Instalación
Si bien no es estrictamente necesario, se recomienda instalar la distribución [Anaconda](https://www.continuum.io/downloads) con python 2.7, ya que viene con muchas dependencias preinstaladas tanto para OSX, Linux o Windows.

**Luego se deben seguir los siguientes pasos:**

*Instalar dependencias*

Deben instalarse dependencias para *psycopg2* y *GDAL*.

En Mac:

* `brew install gdal`
* `fink install psycopg2-py27` o `sudo port install py27-psycopg2`

En Linux:

* `sudo apt-get install libgdal-dev libgdal1h libgdal1-dev gdal-bin python-gdal python-numpy python-scipy python-matplotlib python-pandas python-sympy python-nose build-essential python-dev gfortran cython`

*Crear entorno virtual en Anaconda*

Esto no es necesario, pero es altamente recomendable. Siguiendo los pasos 2 a 4 se pueden instalar las dependencias del proyecto en la instalación general de python, evitando la creación de un entorno virtual.

1. `conda create -n tod python=2` *Crea un nuevo entorno virtual*
2. `cd directorio_del_repositorio`
3. `source activate tod` (Mac) o `activate tod` (Windows) *Activa el entorno*
4. `pip install -r requirements.txt` *Instala las dependencias*
5. `deactivate` *Desactiva el entorno cuando se termine de usar*

Una vez creado un entorno virtual con las dependencias de la herramienta, se pueden abrir los distintos ipython notebook que construyen la base de datos siguiendo estos pasos:

1. `source activate tod`
2. `cd directorio_del_repositorio`
3. `ipython notebook`

*Posibles errores y su solución*

Si en Mac ocurre el error:
```
django.core.exceptions.ImproperyConfigured: Error loading psycop2 module
Library not loaded: libssl.1.0.0.dylib
Referenced from: .../psycopg2/_psycopg.so
Reason: image not found
```

Se debe correr en la línea de comandos:
```
sudo ln -s /Applications/Postgres.app/Contents/Versions/9.5/lib/libssl.1.0.0.dylib /usr/local/lib/

sudo ln -s /Applications/Postgres.app/Contents/Versions/9.5/lib/libcrypto.1.0.0.dylib /usr/local/lib/
```

Donde */Applications/Postgres.app/Contents/Versions/9.5* es el path y la versión donde está instalado Postgres; también podría estar en un path como */Library/PosgreSQL/9.4* o en otro lugar.

Para encontrar el path adecuado puede ser útil correr `locate libssl` en la línea de comandos y buscar aquel path donde está instalado Postgres que contiene los archivos **libssl.1.0.0.dylib** y **libcrypto.1.0.0.dylib**

Algunos sistemas operativos MacOS X pueden requerir realizar el symlink en `/usr/lib` pero otros no permiten la operación y debe realizarse en `/usr/local/lib`.

## De los datos originales a los shapefiles para CartoDB

**0-Descargar datasets**: descarga todos los datasets del archivo [Links.xlsx](https://github.com/gcba/tod/raw/master/Links.xlsx)

1. **Crear buffers**: toma los shapefiles de estaciones de metrobús, ferrocarril, subte y premetro, y crea los shapefiles de los buffers a 300, 500, 750, 1000, 1500 y 2000 metros de cada uno de ellos.
2. **Intersectar buffers con radios y fracciones censales**: superpone los buffers creados con radios y fracciones censales para calcular el % de la superficie de cada radio o fracción que intersecta a cada buffer.
3. **Crear indicadores por radio y fracción censal**: descarga datos del Censo Nacional 2010 y crea indicadores a partir de ellos a nivel de radio censal (RADIO), fracción censal (FRAC) y comuna (DPTO).
    * **3b. Precio de terrenos**: analiza la creación de un promedio de precios de terrenos por fracción censal.
    * **3c. Indice de conectividad de colectivos**: crea un indicador de "llegabilidad" para servicios estándar de colectivos.
    * **3d. Uso del suelo**: crea indicadores de uso porcentual del suelo para radios censales.
    * **3e. Otros indicadores**: crea indicadores de cantidad de escuelas y hospitales, de espacios verdes y distancia media de los habitantes a estaciones de los distintos modos de transporte.
4. **Recalcular indicadores por buffer y otros niveles de agregación**: recalcula todos los indicadores creados a nivel de radio censal para cada uno de los buffers creados en el paso 1 construyendo ponderadores basados en los % de superficie intersectada calculados en el paso 2. Recalcula algunos indicadores para niveles de agregación superiores a los originales (Por ej.: el índice de conectividad de colectivos se crea para radios censales y luego se calcula como un promedio ponderado para fracciones censales, barrios y comunas)
5. **Crear capas para CartoDB**: a partir de todos los shapefiles y datos creados en los pasos anteriores, se crean 4 shapefiles para subir a CartoDB haciendo un merge de varios de ellos.

Los 4 shapefiles creados desde los ipython notebooks se encuentran en la carpeta *indicadores*:

* **divisiones**: contiene los shapes de radios censales, fracciones censales, barrios y comunas con todos los indicadores calculados en los pasos 3 y 4.
* **buffers_estaciones**: contiene todos los shapes de buffers de estaciones de los distintos modos de transporte para cada radio de cobertura calculado, con todos los indicadores calculados en el paso 4.
* **lineas**: contiene los shapes de las líneas de los distintos modos de transporte.
* **estaciones**: contiene los shapes de las estaciones de los distintos modos de transporte.

Estos shapefiles deben subirse a una cuenta de CartoDB y crear un mapa agregándolos como 4 capas respetando el siguiente orden: la capa más baja debe ser **divisiones**, la siguiente **buffers_estaciones** y la más alta **estaciones**. Las capas de **divisiones** y **buffers_estaciones** deben tener leyendas activadas (los colores y estilos de éstas serán modificados programáticamente más adelante) mientras que las de **estaciones** y **lineas** deben tenerlas desactivadas. Estas últimas dos capas, además, pueden tener un infowindow con los campos que se desee (nombre de estación y nombre de línea, por ejemplo).

El scope del **master** branch llega hasta este punto: la creación de los shapefiles para subir a CartoDB. La puesta a punto del sitio web que utiliza este mapa de CartoDB se cubre en el README del branch **gh-pages**.

## Estructura del directorio

* *data*: contiene las bases de datos que no sean shapefiles
* *shp*: contiene todos los shapefiles originales utilizados
    - *prjs*: prjs con las proyecciones de Gauss Krueguer Buenos Aires, WGS84 (4326) y Gauss Kruegues Buenos Aires con el centro corregido para coincidir mejor con los basemap de CartoDB
    - *divisiones*: shapefiles de divisiones geográficas de la Ciudad de Buenos Aires
    - *transporte*: shapefiles originales de líneas y estaciones, y shapefiles de estaciones convertidas en buffers
    - *contexto*: shapefiles con información adicional como espacios verdes, hospitales, etc.
* *indicadores*: contiene los resultados del procesamiento de shapefiles y bases de datos
    - *csvs*: un csv por nivel de agregación geográfica del Censo Nacional 2010 con todos los indicadores construidos (para radios censales, fracciones censales y comunas)
    - *radios_censo_2010*, *fracciones_censo_2010*, *barrios_censo_2010* y *comunas_censo_2010*: carpetas que contienen los shapefiles de los 4 niveles de agregación geográfica con los indicadores calculados
    - *buffers*: reúne a las carpetas que contienen todos los shapefiles de los buffers de estaciones con sus indicadores calculados
    - **divisiones**: shapefile que contiene al merge de los 4 niveles de agregación geográficos
    - **buffers_estaciones**: shapefile que contiene al merge de todos los buffers
    - **lineas**: shapefile que contiene al merge de todas las líneas
    - **estaciones**: shapefile que contiene al merge de todas las estaciones
* *intersection_weights*: archivos json con los porcentajes de intersección de cada buffer con radios censales expresados como % de la superficie del buffer y como % de la superficie del radio censal
* *scripts*: módulos escritos en python con métodos utilizados por los ipython notebooks para procesar los datos
* *Links.xlsx*: lista de links con los recursos a descargar necesarios para construir el mapa

## Próximos pasos
El repositorio contiene una serie de ideas para continuar el desarrollo de esta herramienta organizadas en [milestones](https://github.com/gcba/tod/milestones). Algunas de ellas son bastante puntuales y pueden ser implementadas en horas o días; otras son ideas que requieren bastante tiempo de diseño y desarrollo, e incluso pueden significar un replanteo mayor de la herramienta tal como está ahora.

## Agradecimientos

* Pablo Lorenzatto ([@plorenzatto](https://github.com/plorenzatto)) por la idea original y brainstorming posterior sobre el indicador de llegabilidad de servicios de colectivos estándar, y por su ayuda en la optimización de consultas geográficas.
* Nacho Leguizamon ([@dorisphanic](https://twitter.com/dorisphanic)) y Mercedes Fiz ([@mechafiz](https://twitter.com/mechafiz)) por la asistencia en el diseño y la usabilidad del mapa.
* Carolina Hadad ([@chadad](https://github.com/chadad)) por la asistencia en el diseño de mock ups y sus innumerables consejos técnicos.
* Natalia Sampietro ([@nsampi](https://github.com/nsampi)) por el brainstorming sobre construcción de indicadores, la enriquecedora discusión metodológica y mucho más.
* Sebastián Pellizzeri ([@sebapellizzeri](https://twitter.com/sebapellizzeri)) por el constante aporte metodológico a la gestión del proyecto.
* Laura Paonessa ([@laurapaonessa](https://twitter.com/laurapaonessa)) por el beta testing y sus consejos acerca de cómo comunicar el proyecto.



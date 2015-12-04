# TOD (Transport Oriented Development) - Frontend
Herramienta de visualización de características poblacionales de la Ciudad Autónoma de Buenos Aires en relación a las zonas de influencia de los distintos sistemas de transporte público.

## De los shapefiles para CartoDB al mapa final

### 1. Setear el mapa en CartoDB
Una vez construidos los shapefiles mergeados de **divisiones**, **buffers_estaciones**, **lineas** y **estaciones** deben subirse a una cuenta de CartoDB y construirse un mapa con las siguientes características seteadas desde la interfase gráfica:

* Las 4 capas deben estar en el siguiente orden, desde la más baja a la más alta: **divisiones**, **buffers_estaciones**, **lineas** y **estaciones**.
* Las capas de **divisiones** y **buffers_estaciones** deben tener las leyendas activadas, mientras que las de **lineas** y **estaciones** NO deben tenerlas.

### 2. Setear los parámetros del mapa
Todos los parámetros que permiten personalizar el mapa se encuentran en el archivo *js/todParams.js*.

Los llamados **parámetros esenciales** son aquellos que es más probable deban modificarse ante cambios en la cuenta de CartoDB que aloja el mapa, los indicadores disponibles, los radios de influencia elegidos y los colores de las leyendas.

Los llamados **otros parámetros** especifican otros aspectos de la herramienta que es menos probable que deban modificarse: dependen de agregar/quitar niveles de agregación geográfica, capas de transporte, nombres de variables y tablas, orden de las capas, etc.

#### Parámetros esenciales

* *USER* es el usuario de CartoDB donde está alojado el mapa.
* *CARTODB_JSON_URL* es la url que da CartoDB para manipular un mapa con JavaScript.
* *DEFAULT_SELECTED_INDICATORS* es una lista de indicadores que se muestran en la tabla por default.
* *INDICS_HIERARCHY* es un objeto donde las claves son categorías de indicadores y los valores son listas de indicadores que pertenecen a cada una de esas categorías. Los indicadores que no estén en alguna categoría NO aparecerán en el menú que permite seleccionar indicadores para la tabla.
* *AREA_WEIGHTED* es una lista de indicadores que deben ser ponderados por superficie en lugar de por población (el default es ponderar por población).
* *NON_WEIGHTED* es una lista de indicadores que no deben promediarse.
* El objeto de JavaScript *INDICS* es la lista de indicadores que se muestra en el mapa. Los indicadores que no estén en esta lista NO se mostrarán en el mapa.
    - Las claves deben coincidir con los nombres de las variables en los shapefiles cargados en CartoDB.
    - El atributo "short" es el nombre/descripción corto de la variable.
    - El atributo "scale" es un factor por el cual se multiplican todos los valores de esa variable.
    - El atributo "long" es una descripción más explícita del indicador junto con las fuentes utilizadas para construirlo.
* *BUFFERS_SIZE* es una lista de los radios de los buffers disponibles.
* *COLORS* es un objeto donde las claves son "divisiones" y "buffers", y los valores son listas de colores para las leyendas. La cantidad de colores puede variar arbitrariamente y el mapa de color se adaptará al nuevo esquema de colores.

#### Otros parámetros

* *INDIC_SELECTED_COLOR* son los colores para los indicadores seleccionados en la tabla de indicadores.
* *DEFAULT_COLORS* son los colores default cuando el valor del indicador está fuera de escala (típicamente, un missing).
* *LEGEND_NAME* son los nombres de las leyendas.
* *LEGEND_IDX* es el orden en el que aparecen las leyendas dado por CartoDB.
* *SUBLAYER_IDX* es el orden en el que aparecen las 4 capas cargadas en CartoDB.
* *TBL_NAMES* son los nombres de las tablas con indicadores en CartoDB.
* *BUFFERS_TAGS* son los prefijos de los modos de transporte utilizados en las variables.
* *BUFFERS_FIELDS* son los nombres de los campos de filtrado de los buffers.
* *BUFFERS_FILTER_MSG* es el mensaje default del input del filtro de buffers.
* *DIVS_ID_FIELD* es el campo que se usa en la tabla de "divisiones" para identificar a un shape determinado.
* *DIVS_FILTER_MSG* son los mensajes default del input del filtro de divisiones.
* *DIVS_FILTER_LEVELS* son los niveles de agregación geográfica filtrables permitidos para cada uno.
* *DIVS_NAME* son los nombres de cada nivel de agregación geográfica que aparecen en la lista de "Divisiones" en el mapa.
* *DIVS_SINGLE_NAME* son los nombres de cada nivel de agregación geográfica en singular.
* *PANEL_TRANSPORTE* son los nombres de las capas de líneas y estaciones de modos de transporte.
* *TIMEOUTS* son los tiempos que la UI espera antes de realizar una query a CartoDB después de que el usuario añadió o quitó un elemento de los filtros.




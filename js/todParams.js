USER = 'gopm'
CARTODB_JSON_URL = 'https://gopm.cartodb.com/api/v2/viz/20612ffc-9e8b-11e5-80cb-0e3ff518bd15/viz.json'
BBOX = [-58.534235, -34.708906, -58.329524, -34.539576]
CENTER = [-34.615753, -58.4]
ZOOM = 12

DEFAULT_SELECTED_INDICATORS = ["hab", "hab_km2", "area_km2", "d_ffcc",
    "d_metrobus", "d_subte", "reach_area", "reach_prop", "desocup",
    "empleo", "inact", "nse_alt", "nse_mex", "comercial"
]

INDICS_HIERARCHY = {
    "Generales": ["hab", "area_km2", "hab_km2", "hombres", "extranjero"],
    "Edad": ["_0_14", "_15_64", "mas_65"],
    "Uso del suelo": ["comercial", "residencia", "industrial", "servicios",
        "otros"
    ],
    "Vivienda": ["con_basica", "con_insuf", "con_satisf", "serv_basic",
        "serv_insuf", "serv_satis", "hac_149", "hac_150", "ocup_viv",
    ],
    "Mercado de trabajo": ["desocup", "empleo", "inact"],
    "Nivel socioeconómico": ["nse_alt", "nse_mex"],
    "Educación": ["educ_priv", "educ_pub", "educ_sup", "escolarida"],
    "Transporte": ["d_ffcc", "d_metrobus", "d_subte", "reach_area", "reach_prop"],
    "Otros": ["nbi", "compu", "esp_verde", "hospitales"]
}

AREA_WEIGHTED = ["hab_km2", "comercial", "residencia", "industrial",
                 "servicios", "otros"]

NON_WEIGHTED = ["hab", "area_km2"]

INDICS = {
    "hombres": {
        "short": "Hombres (%)",
        "scale": 100,
        "long": "Proporción de habitantes de sexo masculino (%) - Censo Nacional 2010 (INDEC)"
    },
    "extranjero": {
        "short": "Extranjeros (%)",
        "scale": 100,
        "long": "Proporción de habitantes nacidos en el extranjero (%) - Censo Nacional 2010 (INDEC)"
    },
    "hab": {
        "short": "Población (M)",
        "scale": 1 / 1000000,
        "long": "Población total en 2010 (millones de habitantes) - Censo Nacional 2010 (INDEC)"
    },
    "area_km2": {
        "short": "Superficie (km2)",
        "scale": 1,
        "long": "Superficie total (kilómetros cuadrados) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA)"
    },
    "hab_km2": {
        "short": "Densidad poblacional (miles hab/km2)",
        "scale": 1 / 1000,
        "long": "Densidad poblacional en 2010 (miles de habitantes por kilómetro cuadrado) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y Censo Nacional 2010 (INDEC)"
    },
    "_0_14": {
        "short": "0 a 14 años (%)",
        "scale": 100,
        "long": "Proporción de la población con 14 años de edad o menos en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "_15_64": {
        "short": "15 a 64 años (%)",
        "scale": 100,
        "long": "Proporción de la población con entre 15 y 64 años de edad en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "mas_65": {
        "short": "Más de 65 años (%)",
        "scale": 100,
        "long": "Proporción de la población con 65 años de edad o más en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "comercial": {
        "short": "Zona comercial (%)",
        "scale": 100,
        "long": "Proporción de la superficie destinada a uso comercial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)"
    },
    "residencia": {
        "short": "Zona residencial (%)",
        "scale": 100,
        "long": "Proporción de la superficie destinada a uso residencial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)"
    },
    "industrial": {
        "short": "Zona industrial (%)",
        "scale": 100,
        "long": "Proporción de la superficie destinada a uso industrial en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)"
    },
    "servicios": {
        "short": "Zona de servicios (%)",
        "scale": 100,
        "long": "Proporción de la superficie destinada a uso de servicios en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)"
    },
    "otros": {
        "short": "Otros usos (%)",
        "scale": 100,
        "long": "Proporción de la superficie destinada a otros usos en 2011 (%) - Cálculo a partir del Relevamiento de Usos del Suelo del Ministerio de Desarrollo Urbano (GCBA)"
    },
    "con_basica": {
        "short": "Calidad constructiva básica (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad constructiva es básica en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "con_insuf": {
        "short": "Calidad constructiva insuficiente (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad constructiva es  insuficiente en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "con_satisf": {
        "short": "Calidad constructiva satisfactoria (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad constructiva es  satisfactoria en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "serv_basic": {
        "short": "Conexión a servicios básica (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad de conexión a servicios básicos es básica en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "serv_insuf": {
        "short": "Conexión a servicios insuficiente (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad de conexión a servicios básicos es insuficiente en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "serv_satis": {
        "short": "Conexión a servicios satisfactoria (%)",
        "scale": 100,
        "long": "Proporción de viviendas cuya calidad de conexión a servicios básicos es satisfactoria en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "hac_149": {
        "short": "1.49 habs por cuarto o menos (%)",
        "scale": 100,
        "long": "Proporción de hogares con 1.49 habitantes por cuarto o menos en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "hac_150": {
        "short": "1.50 habs por cuarto o más (%)",
        "scale": 100,
        "long": "Proporción de hogares con 1.50 habitantes por cuarto o más en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "ocup_viv": {
        "short": "Ocupación de vivienda (%)",
        "scale": 100,
        "long": "Proporción de viviendas ocupadas en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "desocup": {
        "short": "Desocupación (%)",
        "scale": 100,
        "long": "Proporción de habitantes desocupados sobre la población económicamente activa, definida como la suma de habitantes ocupados y desocupados en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "empleo": {
        "short": "Empleo (%)",
        "scale": 100,
        "long": "Proporción de habitantes empleados sobre la cantidad de habitantes con 14 años o más en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "inact": {
        "short": "Inactividad (%)",
        "scale": 100,
        "long": "Proporción de habitantes inactivos sobre la cantidad de habitantes con 14 años o más en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "nse_mex": {
        "short": "Nivel socioeconómico",
        "scale": 1,
        "long": "Nivel socioeconómico basado en la segmentación del primer componente principal de la variabilidad de los índices de escolaridad, educación superior y computadora en el hogar en 2010 - Cálculo a partir de Censo Nacional 2010 (INDEC)"
    },
    // "educ_priv": {
    //     "short": "Est. educativos privados (unidades)",
    //     "scale": 1,
    //     "long": "Cantidad de establecimientos educativos privados en 2014 (unidades) - Cálculo a partir de establecimientos educativos georreferenciados por Ministerio de Educación (GCBA)"
    // },
    // "educ_pub": {
    //     "short": "Est. educativos públicos (unidades)",
    //     "scale": 1,
    //     "long": "Cantidad de establecimientos educativos públicos en 2014 (unidades) - Cálculo a partir de establecimientos educativos georreferenciados por Ministerio de Educación (GCBA)"
    // },
    "educ_sup": {
        "short": "Índice de educación superior (%)",
        "scale": 100,
        "long": "Proporción de habitantes mayores a 25 años con educación universitaria completada en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "escolarida": {
        "short": "Índice de escolaridad (%)",
        "scale": 100,
        "long": "Proporción de habitantes menores a 18 años que asiste a un establecimiento educativo en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "d_ffcc": {
        "short": "Distancia al ffcc (m)",
        "scale": 1,
        "long": "Distancia del centroide de un radio censal a la estación más cercana de ferrocarril o promedio ponderado por población de este indicador para otras unidades geográficas en 2015 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de ferrocarril georreferenciadas por Ministerio de Desarrollo Urbano (GCBA) y Censo Nacional 2010 (INDEC)"
    },
    "d_metrobus": {
        "short": "Distancia al metrobús (m)",
        "scale": 1,
        "long": "Distancia del centroide de un radio censal a la estación más cercana de metrobús o promedio ponderado por población de este indicador para otras unidades geográficas en 2014 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de metrobús georreferenciadas por la Subsecretaría de Transporte (GCBA) y Censo Nacional 2010 (INDEC)"
    },
    "d_subte": {
        "short": "Distancia al subte (m)",
        "scale": 1,
        "long": "Distancia del centroide de un radio censal a la estación más cercana de subte o promedio ponderado por población de este indicador para otras unidades geográficas en 2015 (kilómetros) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA), estaciones de subte georreferenciadas por el Ministerio de Desarrollo Urbano (GCBA) y Censo Nacional 2010 (INDEC)"
    },
    "reach_area": {
        "short": "Sup. alcanzable en 1 colectivo (km2)",
        "scale": 1,
        "long": "Superficie alcanzable media estimada viajando hasta 10 kilómetros en un solo servicio de colectivos, sin trasbordos, en 2015. Se toma una distancia máxima recorrida a pie de 300 metros, tanto para abordar el servicio desde el punto de origen como para llegar al punto de destino una vez abandonada la unidad (kilómetros cuadrados) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y trazado georreferenciado de recorridos de colectivos por Unidad de Sistemas de Información Geográfica (GCBA)"
    },
    "reach_prop": {
        "short": "Sup. alcanzable en 1 colectivo (% CABA)",
        "scale": 100,
        "long": "Superficie alcanzable media estimada viajando hasta 10 kilómetros en un solo servicio de colectivos, sin trasbordos, en 2015. Se toma una distancia máxima recorrida a pie de 300 metros, tanto para abordar el servicio desde el punto de origen como para llegar al punto de destino una vez abandonada la unidad (proporción de kilómetros cuadrados sobre la superficie total de la CABA) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y trazado georreferenciado de recorridos de colectivos por Unidad de Sistemas de Información Geográfica (GCBA)"
    },
    "nbi": {
        "short": "NBI (%)",
        "scale": 100,
        "long": "Proporción de hogares con al menos una necesidad básica insatisfecha en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "compu": {
        "short": "Índice de computadora en el hogar (%)",
        "scale": 100,
        "long": "Proporción de hogares con computadora sobre el total de hogares equipados con al menos uno de los siguientes elementos: heladera, computadora, teléfono celular o teléfono de línea, en 2010 (%) - Censo Nacional 2010 (INDEC)"
    },
    "esp_verde": {
        "short": "Superficie espacios verdes (%)",
        "scale": 100,
        "long": "Proporción de espacios verdes sobre la superficie total en 2013 (%) - Cálculo a partir de cartografía censal de la Dir. Gral. de Estadística y Censos (GCBA) y espacios verdes georreferenciados por la Unidad de Sistemas de Información Geográfica (GCBA)"
    },
    // "hospitales": {
    //     "short": "Hospitales (unidades)",
    //     "scale": 1,
    //     "long": "Cantidad de hospitales en 2014 (unidades) - Cálculo a partir de hospitales georreferenciados por el Ministerio de Salud (GCBA)"
    // }
}

BUFFERS_SIZE = [300, 500, 750, 1000, 1500, 2000]

COLORS = {
    "divisions": ["#0088e6", "#1492e9", "#2b9eeb", "#40a8ed", "#55b1f0",
        "#6bbcf3", "#81c6f6", "#95d1f8", "#acdcfa", "#c1e6fd"
    ],
    "buffers": ["#e61100", "#e92414", "#eb382b", "#ed4b40", "#f06155",
        "#f3756b", "#f68a81", "#f89b95", "#fab0ac", "#fdc4c1"
    ]
}

INDIC_SELECTED_COLOR = {
    "divisions": COLORS["divisions"][5],
    "buffers": COLORS["buffers"][5],
    "both": "rgba(139, 85, 208, 0.6)"
}

DEFAULT_COLORS = {
    "divisions": "#878787",
    "buffers": "#878787"
}

LEGEND_NAME = {
    "divisions": "Divisiones",
    "buffers": "Buffers"
}

LEGEND_IDX = {
    "divisions": 1,
    "buffers": 0
}

SUBLAYER_IDX = {
    "divisions": 0,
    "buffers": 1,
    "lines": 2,
    "points": 3
}

TBL_NAMES = {
    "divisions": "divisiones",
    "buffers": "buffers_estaciones"
}

BUFFERS_TAGS = {
    "Subte": "est_subte",
    "Premetro": "est_sub_prem",
    "FFCC": "est_ffcc",
    "Metrobus": "est_metrobus"
}

BUFFERS_FIELDS = {
    "lin": "linea",
    "est": "estacion"
}

BUFFERS_FILTER_MSG = "Filtrar por líneas o estaciones..."

DIVS_ID_FIELD = "id_div"

DIVS_FILTER_MSG = {
    "RADIO": "Filtrar por radios, fracciones, barrios o comunas...",
    "FRAC": "Filtrar por fracciones, barrios o comunas...",
    "BARRIO": "Filtrar por barrios...",
    "DPTO": "Filtrar por comunas..."
}

DIVS_FILTER_LEVELS = {
    "RADIO": ["RADIO", "FRAC", "BARRIO", "DPTO"],
    "FRAC": ["FRAC", "BARRIO", "DPTO"],
    "BARRIO": ["BARRIO"],
    "DPTO": ["DPTO"]
}

DIVS_NAME = {
    "None": "Ninguna",
    "RADIO": "Radios",
    "FRAC": "Fracciones",
    "BARRIO": "Barrios",
    "DPTO": "Comunas"
}
DIVS_SINGLE_NAME = {
    "None": "No se ha seleccionado una división",
    "RADIO": "Radio",
    "FRAC": "Fracción",
    "BARRIO": "Barrio",
    "DPTO": "Comuna"
}

PANEL_TRANSPORTE = {
    "est_subte": "Estaciones de Subte",
    "lin_subte": "Lineas de Subte",
    "est_sub_prem": "Estaciones de Premetro",
    "lin_sub_prem": "Lineas de Premetro",
    "est_ffcc": "Estaciones de Ferrocarril",
    "lin_ffcc": "Lineas de Ferrocarril",
    "est_metrobus": "Estaciones de Metrobus",
    "lin_metrobus": "Lineas de Metrobus",
    "lin_colectivos": "Lineas de Colectivos"
}

TIMEOUTS = {
    "add_buffer_tag": 3000,
    "remove_buffer_tag": 600,
    "add_div_filter_tag": 1000,
    "remove_div_filter_tag": 600,
    "filter_buffers": 1500,
    "filter_divs": 1000
}

POINTS_CSS_URL = "https://raw.githubusercontent.com/gcba/tod/gh-pages/css/estaciones.css"
LINES_CSS_URL = "https://raw.githubusercontent.com/gcba/tod/gh-pages/css/lineas.css"

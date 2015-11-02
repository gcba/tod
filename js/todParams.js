USER = 'agustinbenassi'
CARTODB_JSON_URL = 'https://agustinbenassi.cartodb.com/api/v2/viz/39748176-72ab-11e5-addc-0ecd1babdde5/viz.json'

INDICS = {
    "hab": {
        "short": "Población (M)",
        "scale": 1 / 1000000,
        "long": "Población (M)"
    },
    "area_km2": {
        "short": "Superficie (km2)",
        "scale": 1,
        "long": "Superficie (km2)"
    },
    "hab_km2": {
        "short": "Densidad poblacional (miles hab/km2)",
        "scale": 1 / 1000,
        "long": "Densidad poblacional (miles hab/km2)"
    },
    "_0_14": {
        "short": "0 a 14 años (%)",
        "scale": 100,
        "long": "0 a 14 años (%)"
    },
    "_15_64": {
        "short": "15 a 64 años (%)",
        "scale": 100,
        "long": "15 a 64 años (%)"
    },
    "mas_65": {
        "short": "Más de 65 años (%)",
        "scale": 100,
        "long": "Más de 65 años (%)"
    },
    "comercial": {
        "short": "Zona comercial (%)",
        "scale": 100,
        "long": "Zona comercial (%)"
    },
    "residencia": {
        "short": "Zona residencial (%)",
        "scale": 100,
        "long": "Zona residencial (%)"
    },
    "industrial": {
        "short": "Zona industrial (%)",
        "scale": 100,
        "long": "Zona industrial (%)"
    },
    "servicios": {
        "short": "Zona de servicios (%)",
        "scale": 100,
        "long": "Zona de servicios (%)"
    },
    "otros": {
        "short": "Otros usos (%)",
        "scale": 100,
        "long": "Otros usos (%)"
    },
    "con_basica": {
        "short": "Calidad constructiva básica (%)",
        "scale": 100,
        "long": "Calidad constructiva básica (%)"
    },
    "con_insuf": {
        "short": "Calidad constructiva insuficiente (%)",
        "scale": 100,
        "long": "Calidad constructiva insuficiente (%)"
    },
    "con_satisf": {
        "short": "Calidad constructiva satisfactoria (%)",
        "scale": 100,
        "long": "Calidad constructiva satisfactoria (%)"
    },
    "serv_basic": {
        "short": "Conexión a servicios básica (%)",
        "scale": 100,
        "long": "Conexión a servicios básica (%)"
    },
    "serv_insuf": {
        "short": "Conexión a servicios insuficiente (%)",
        "scale": 100,
        "long": "Conexión a servicios insuficiente (%)"
    },
    "serv_satis": {
        "short": "Conexión a servicios satisfactoria (%)",
        "scale": 100,
        "long": "Conexión a servicios satisfactoria (%)"
    },
    "hac_149": {
        "short": "1.49 habs por cuarto o menos (%)",
        "scale": 100,
        "long": "1.49 habs por cuarto o menos (%)"
    },
    "hac_150": {
        "short": "1.50 habs por cuarto o más (%)",
        "scale": 100,
        "long": "1.50 habs por cuarto o más (%)"
    },
    "ocup_viv": {
        "short": "Ocupación de vivienda (%)",
        "scale": 100,
        "long": "Ocupación de vivienda (%)"
    },
    "desocup": {
        "short": "Desocupación (%)",
        "scale": 100,
        "long": "Desocupación (%)"
    },
    "empleo": {
        "short": "Empleo (%)",
        "scale": 100,
        "long": "Empleo (%)"
    },
    "inact": {
        "short": "Inactividad (%)",
        "scale": 100,
        "long": "Inactividad (%)"
    },
    "nse_alt": {
        "short": "Nivel socioeconómico 1",
        "scale": 1,
        "long": "Nivel socioeconómico 1"
    },
    "nse_mex_ca": {
        "short": "Nivel socioeconómico 2",
        "scale": 1,
        "long": "Nivel socioeconómico 2"
    },
    "educ_priv": {
        "short": "Est. educativos privados (cant)",
        "scale": 1,
        "long": "Est. educativos privados (cant)"
    },
    "educ_pub": {
        "short": "Est. educativos públicos (cant)",
        "scale": 1,
        "long": "Est. educativos públicos (cant)"
    },
    "educ_sup": {
        "short": "Educación superior (%)",
        "scale": 100,
        "long": "Educación superior (%)"
    },
    "escolarida": {
        "short": "Escolaridad (%)",
        "scale": 100,
        "long": "Escolaridad (%)"
    },
    "d_ffcc": {
        "short": "Distancia al ffcc (km)",
        "scale": 1,
        "long": "Distancia al ffcc (km)"
    },
    "d_metrobus": {
        "short": "Distancia al metrobús (km)",
        "scale": 1,
        "long": "Distancia al metrobús (km)"
    },
    "d_subte": {
        "short": "Distancia al subte (km)",
        "scale": 1,
        "long": "Distancia al subte (km)"
    },
    "reach_area": {
        "short": "Sup. alcanzable en 1 colectivo (km2)",
        "scale": 1,
        "long": "Sup. alcanzable en 1 colectivo (km2)"
    },
    "reach_prop": {
        "short": "Sup. alcanzable en 1 colectivo (% CABA)",
        "scale": 100,
        "long": "Sup. alcanzable en 1 colectivo (% CABA)"
    },
    "nbi": {
        "short": "NBI (%)",
        "scale": 100,
        "long": "NBI (%)"
    },
    "compu": {
        "short": "Uso de computadora (%)",
        "scale": 100,
        "long": "Uso de computadora (%)"
    },
    "esp_verde": {
        "short": "Superficie espacios verdes (%)",
        "scale": 100,
        "long": "Superficie espacios verdes (%)"
    },
    "hospitales": {
        "short": "Hospitales (cant)",
        "scale": 1,
        "long": "Hospitales (cant)"
    }
}

INDICS_HIERARCHY = {
    "Generales": ["hab", "area_km2", "hab_km2"],
    "Edad": ["_0_14", "_15_64", "mas_65"],
    "Uso del suelo": ["comercial", "residencia", "industrial", "servicios",
        "otros"
    ],
    "Vivienda": ["con_basica", "con_insuf", "con_satisf", "serv_basic",
        "serv_insuf", "serv_satis", "hac_149", "hac_150", "ocup_viv",
    ],
    "Mercado de trabajo": ["desocup", "empleo", "inact"],
    "Nivel socioeconómico": ["nse_alt", "nse_mex_ca"],
    "Educación": ["educ_priv", "educ_pub", "educ_sup", "escolarida"],
    "Transporte": ["d_ffcc", "d_metrobus", "d_subte", "reach_area", "reach_prop"],
    "Otros": ["nbi", "compu", "esp_verde", "hospitales"]
}

COLORS = {
    "divisions": ["#005824", "#238B45", "#41AE76", "#66C2A4",
        "#CCECE6", "#D7FAF4", "#EDF8FB"
    ],
    "buffers": ["#B10026", "#E31A1C", "#FC4E2A", "#FD8D3C",
        "#FEB24C", "#FED976", "#FFFFB2"
    ]
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
    "divisions": 3,
    "buffers": 2
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

BUFFERS_SIZE = [300, 500, 750, 1000, 1500, 2000]
BUFFERS_TAGS = {
    "Subte": "est_subte",
    "Premetro": "est_sub_prem",
    "FFCC": "est_ffcc",
    "Metrobus": "est_metrobus",
}

DIVS_ID_FIELD = {
    "RADIO": "co_frac_ra",
    "FRAC": "co_fracc",
    "BARRIO": "barrios",
    "DPTO": "comunas"
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

AREA_WEIGHTED = ["hab_km2", "comercial", "residencia"]
NON_WEIGHTED = ["hab", "area_km2"]
DEFAULT_SELECTED_INDICSATORS = ["hab", "hab_km2", "area_km2", "d_ffcc",
    "d_metrobus", "d_subte", "reach_area", "reach_prop", "desocup",
    "empleo", "inact", "nse_alt", "nse_mex_ca", "comercial"
]

INDIC_SELECTED_COLOR = {"divisions": "#66C2A4", "buffers": "#FD8D3C"}



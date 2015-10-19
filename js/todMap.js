DEFAULT_INDIC_DIVS = "hab_km2"
DEFAULT_INDIC_BUFFERS = "hab_km2"
SUBLAYER_IDX = {
    "divisions": 0,
    "buffers": 1
}

function main() {
    cartodb.createVis('map', 'https://agustinbenassi.cartodb.com/api/v2/viz/39748176-72ab-11e5-addc-0ecd1babdde5/viz.json', {
            shareable: true,
            title: true,
            description: true,
            search: true,
            tiles_loader: true,
            center_lat: -34.615753,
            center_lon: -58.339657,
            zoom: 12
        })
        .done(function(vis, layers) {
            // layer 0 is the base layer, layer 1 is cartodb layer
            // setInteraction is disabled by default
            layers[1].setInteraction(true);
            layers[1].on('featureOver', function(e, latlng, pos, data) {
                cartodb.log.log(e, latlng, pos, data);
            });
            // you can get the native map to work with it
            var map = vis.getNativeMap();
            // now, perform any operations you need
            // map.setZoom(3);
            // map.panTo([50.5, 30.5]);

            // set the map empty
            do_cartodb_query(layers[1].getSubLayer(0), "")
            do_cartodb_query(layers[1].getSubLayer(1), "")
            do_cartodb_query(layers[1].getSubLayer(2), "")
            do_cartodb_query(layers[1].getSubLayer(3), "")

            create_trans_list(layers[1])
            create_divs_selector(layers[1])
            create_buffers_selector(layers[1])
            create_change_indicators_panel(layers[1])
            create_legend(DEFAULT_INDIC_DIVS, "divisions")
            create_legend(DEFAULT_INDIC_BUFFERS, "buffers")
        })
        .error(function(err) {
            console.log(err);
        });
}
window.onload = main;


// panel de capas de transporte
PANEL_TRANSPORTE = {
    "est_subte": "Estaciones de Subte",
    "lin_subte": "Lineas de Subte",
    "est_ffcc": "Estaciones de Ferrocarril",
    "lin_ffcc": "Lineas de Ferrocarril",
    "est_metrobus": "Estaciones de Metrobus",
    "lin_metrobus": "Lineas de Metrobus",
    "lin_colectivos": "Lineas de Colectivos"
}

function create_trans_list(layer) {
    $("#capas-transporte").change(function() {
        var names = $('#capas-transporte input:checked').map(function() {
            return this.name;
        }).get();
        make_transport_query(names, layer)
    })
    $.each(PANEL_TRANSPORTE, function(key, val) {
        add_trans_li("capas-transporte", val, key)
    })
}

function add_trans_li(idList, text, name) {
    var li = $('<li>').attr("class", "list-group-item")
    li.append($("<input type='checkbox'>").attr("name", name))
    li.append("  " + text)
    $("#" + idList).append(li)
}

function make_transport_query(names, layer) {
    var lineas = layer.getSubLayer(2)
    var estaciones = layer.getSubLayer(3)
    var queryLineas = ""
    var queryEstaciones = ""

    // create queries
    names.forEach(function(name) {
        var nameType = name.split("_")[0]

        if (nameType == "est") {
            queryEstaciones = update_trans_query(name, queryEstaciones, "estaciones")
        } else if (nameType == "lin") {
            queryLineas = update_trans_query(name, queryLineas, "lineas")
        } else {
            console.log(nameType + " from " + name + " not recognized.")
        }
    })

    // do queries
    do_cartodb_query(lineas, queryLineas)
    do_cartodb_query(estaciones, queryEstaciones)
}

function do_cartodb_query(sublayer, query) {
    if (query == "") {
        sublayer.hide()
    } else {
        sublayer.show()
        sublayer.setSQL(query)
    };
}

function update_trans_query(name, query, table) {
    if (query == "") {
        query = get_initial_query(table, name)
    } else {
        query = add_orig_sf(query, name)
    };
    return query
}

function get_initial_query(table, name) {
    return "SELECT * FROM " + table + " WHERE orig_sf = '" + name + "'"
}

function add_orig_sf(query, name) {
    return query += " OR orig_sf = '" + name + "'"
}


// panel principal
// subpanel de filtros
// selección de divisiones
DIVS_NAME = {
    "None": "Ninguna",
    "RADIO": "Radios",
    "FRAC": "Fracciones",
    "BARRIO": "Barrios",
    "DPTO": "Comunas"
}

function create_divs_selector(layer) {
    $.each(DIVS_NAME, function(key, val) {
        add_divisions_li("selector-divisiones", "dropdownMenuDivisiones",
            val, key, layer)
    })
}

function add_divisions_li(idItems, idButton, text, name, layer) {
    var a = $('<a>').text(text).attr("href", "#").attr("name", name)
    a.click(function() {
        var query = get_initial_query("divisiones", this.name)
        $("#" + idButton).text(this.text + "   ")
        $("#" + idButton).append($("<span class='caret'></span>"))

        $("#tag-list-divisiones").empty()
        if (this.name != "None") {
            get_filter_divs(layer, this.name)
        }
        $("#divisiones").attr("areaLevel", this.name)

        do_cartodb_query(layer.getSubLayer(0), query)
        var indic = $("#legend-divisions").attr("indicator")
        $("#panel-indicadores").attr("legend-type", "divisions")
        recalculate_divisions_indicator(layer, indic)
    })
    $("#" + idItems).append($('<li>').append(a))
}


// filtros de divisiones
DIVS_ID_FIELD = {
    "RADIO": "co_frac_ra",
    "FRAC": "co_fracc",
    "BARRIO": "barrios",
    "DPTO": "comunas"
}

function get_filter_divs(layer, nameDivs) {
    var divField = DIVS_ID_FIELD[nameDivs]
    if (divField) {
        var sql = new cartodb.SQL({
            user: 'agustinbenassi'
        });
        var query = "SELECT Distinct(" + divField + ") FROM divisiones"
        var filterDivs = []
        sql.execute("SELECT Distinct({{divField}}) FROM divisiones", {
                "divField": divField
            })
            .done(function(data) {
                filterDivs = data.rows.map(function(row) {
                    return String(row[divField])
                });
                console.log(nameDivs, filterDivs)
                create_divs_filter(layer, filterDivs, nameDivs)
            })
            .error(function(errors) {
                // errors contains a list of errors
                console.log("errors:" + errors);
            })
    }
}

function create_divs_filter(layer, filterDivs, nameDivs) {
    // If using Bootstrap 2, be sure to include:
    // Tags.bootstrapVersion = "2";
    var filter = $('<div>').attr("class", "tag-list")
    $('#tag-list-divisiones').append(filter)
    filter.tags({
        tagData: [],
        suggestions: filterDivs,
        excludeList: [],
        tagSize: "sm",
        caseInsensitive: true,
        restrictTo: filterDivs,
        promptText: "Filtrar por divisiones...",
        afterAddingTag: make_filter_divisions_query,
        afterDeletingTag: make_filter_divisions_query
    });

    function make_filter_divisions_query(newTag) {
        var tags = this.getTags()
        var query = get_initial_query("divisiones", nameDivs)

        if (tags.length == 1) {
            query += " AND " + DIVS_ID_FIELD[nameDivs] + " = '" + tags[0] + "'"
        } else if (tags.length > 1) {
            query += " AND (" + DIVS_ID_FIELD[nameDivs] + " = '" + tags[0] + "'"
            tags.slice(1).forEach(function(tag) {
                query += " OR " + DIVS_ID_FIELD[nameDivs] + " = '" + tag + "'"
            })
            query += ")"
        }

        console.log(query)
        do_cartodb_query(layer.getSubLayer(0), query)
    }
};

// selector de buffers
BUFFERS_SIZE = [300, 500, 750, 1000, 1500, 2000]
BUFFERS_TAGS = {
    "Subte": "est_subte",
    "FFCC": "est_ffcc",
    "Metrobus": "est_metrobus",
}

function create_buffers_selector(layer) {
    // agrega botones cuyo click cambia el attr name de la lista
    $.each(BUFFERS_TAGS, function(key, val) {
        add_buffers_li("selector-modo-transporte",
            "dropdownMenuBufferModoTrans", key, val)
    })

    $.each(BUFFERS_SIZE, function(key, val) {
        add_buffers_li("selector-buffer-size",
            "dropdownMenuBufferSize", val, val)
    })

    var bufferTags = create_selected_buffers_field(layer)

    // boton que agrega el buffer al campo con los seleccionados
    $("#button-add-buffer").click(function() {
        var modo = $("#dropdownMenuBufferModoTrans").text()
        var size = $("#selector-buffer-size").attr("name")
        var tag = modo + " (" + String(size) + ")"
        bufferTags.addTag(tag)
    })

}

function add_buffers_li(idItems, idButton, text, name) {
    var a = $('<a>').text(text).attr("href", "#").attr("name", name)
    a.click(function() {
        $("#" + idButton).text(this.text + "   ")
        $("#" + idButton).append($("<span class='caret'></span>"))
        $("#" + idItems).attr("name", this.name)
    })
    $("#" + idItems).append($('<li>').append(a))
}

function create_selected_buffers_field(layer) {
    // If using Bootstrap 2, be sure to include:
    // Tags.bootstrapVersion = "2";
    var selector = $('<div>').attr("class", "tag-list")
    $('#tag-list-buffers').append(selector)
    var bufferTags = selector.tags({
        readOnly: false,
        tagData: [],
        excludeList: [],
        tagSize: "sm",
        promptText: "No hay buffers seleccionados...",
        beforeAddingTag: remove_repeated_modes,
        afterAddingTag: add_buffer_tag,
        afterDeletingTag: remove_buffer_tag
    });

    function remove_repeated_modes(newTag) {
        var tags = this.getTags()
        if (tags.length >= 1) {
            tags.forEach(function(tag) {
                var modeTag = get_mode_and_size(tag)[0]
                var modeNewTag = get_mode_and_size(newTag)[0]
                if (modeTag == modeNewTag) {
                    bufferTags.removeTag(tag)
                };
            })
        };
    }

    function add_buffer_tag(newTag) {
        make_select_buffers_query(newTag)
        update_capas_transporte(newTag, true)
    }

    function remove_buffer_tag(oldTag) {
        make_select_buffers_query(oldTag)
        update_capas_transporte(oldTag, false)
    }

    function make_select_buffers_query(newTag) {
        var tags = bufferTags.getTags()
        var query = ""

        if (tags.length >= 1) {
            query += "SELECT * FROM buffers_estaciones WHERE orig_sf = '"
            query += get_sf_name(tags[0]) + "'"
        }
        if (tags.length > 1) {
            tags.slice(1).forEach(function(tag) {
                query += " OR orig_sf = '" + get_sf_name(tag) + "'"
            })
        }

        console.log(query)
        do_cartodb_query(layer.getSubLayer(1), query)
        var indic = $("#legend-buffers").attr("indicator")
        $("#panel-indicadores").attr("legend-type", "buffers")
        recalculate_buffers_indicator(layer, indic)
    }

    function update_capas_transporte(newTag, check) {
        $("#capas-transporte li").each(function(index) {
            var modeTag = $(this).children("input")[0].name
            var modeNewTag = get_mode_and_size(newTag)[0]
            if (modeTag.split("_")[1] == modeNewTag.split("_")[1]) {
                $(this).children("input").prop("checked", check)
            };
        })
        $("#capas-transporte li").trigger("change")
    }

    function get_sf_name(tag) {
        var ms = get_mode_and_size(tag)
        return ms[0] + "-buffer" + ms[1]
    }

    function get_mode_and_size(tag) {
        var tagPattern = /([a-z]+)\s+\(([0-9]+)\)/i
        var regexRes = tagPattern.exec(tag)
        var mode = BUFFERS_TAGS[regexRes[1]]
        var size = regexRes[2]
        return [mode, size]
    }

    return bufferTags
};

// crear panel de indicadores para cambiar las leyendas
INDIC_HIERARCHY = {
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

function create_change_indicators_panel(layer) {

    var indicsPanel = $("#panel-indicadores").children("div .panel-body")
    $.each(INDIC_HIERARCHY, function(category, indics) {
        var categoryPanel = $("<div>").attr("class", "panel panel-default")

        // la categoría es el título
        var panelTitle = $("<h5>").attr("class", "panel-title")
        var a = $("<a>").text(category).attr("data-toggle", "collapse")
        a.attr("data-parent", "#accordion")
        var idPanelCategory = "category-panel-" + category.split(" ").join("-")
        panelTitle.append(a.attr("href", "#" + idPanelCategory))
        var panelHeading = $("<div>").attr("class", "panel-heading")
        categoryPanel.append(panelHeading.append(panelTitle))

        // los indicadores son una lista
        var collapsePanel = $("<div>").attr("id", idPanelCategory)
        collapsePanel.attr("class", "panel-collapse collapse")
        var listIndics = $("<ul>").attr("class", "list-group")
        indics.forEach(function(indic) {
            listIndics.append(create_indic_changer(layer, indic))
        })
        collapsePanel.append(listIndics)
        categoryPanel.append(collapsePanel)

        indicsPanel.append(categoryPanel)
    })
}

function create_indic_changer(layer, indic) {
    var li = $("<li>").attr("class", "list-group-item")
    var a = $("<a>").text(INDIC_DESC[indic]).click(function() {
        var legendType = $("#panel-indicadores").attr("legend-type")
        if (legendType == "divisions") {
            recalculate_divisions_indicator(layer, indic)
        } else {
            recalculate_buffers_indicator(layer, indic)
        };
    })
    return li.append(a)
}

function recalculate_divisions_indicator(layer, indic) {
    // var legendType = $("#panel-indicadores").attr("legend-type")
    var legendType = "divisions"
    var table = TBL_NAMES[legendType]
    var areaLevel = $("#divisiones").attr("areaLevel")
    recalculate_indicator(layer, indic,
        get_indic_div_query(indic, table, areaLevel), legendType)
}

function recalculate_buffers_indicator(layer, indic) {
    var legendType = "buffers"
    var sql = layer.getSubLayer(SUBLAYER_IDX[legendType]).getSQL()
    var query = sql.replace("*", indic) + " AND " + indic
    query += " IS NOT NULL ORDER BY " + indic
    recalculate_indicator(layer, indic, query, legendType)
}

function recalculate_indicator(layer, indic, query, legendType) {
    console.log(query)
    execute_query(query, function(data) {
        var all = data.rows

        // remove nulls
        var pos = all.length - 1
        while (!all[pos][indic]) {
            pos -= 1
        }
        all = all.slice(0, pos)

        var min = all[0][indic]
        var max = all[all.length - 1][indic]
        create_legend(indic, legendType, min, max)
        change_indic(indic, legendType, min, max, all, layer)
        $("#panel-indicadores").css("display", "none")
    })
}

function get_indic_div_query(indic, table, origSf) {
    return "SELECT " + indic + " FROM " + table + " WHERE orig_sf = '" + origSf + "' AND " + indic + " IS NOT NULL ORDER BY " + indic
}

function execute_query(query, fnCallback) {
    var sql = new cartodb.SQL({
        user: 'agustinbenassi'
    });
    sql.execute(query, {})
        .done(fnCallback)
        .error(function(errors) {
            // errors contains a list of errors
            console.log("errors:" + errors);
        })
}


// create custom Legend
LEGEND_NAME = {
    "divisions": "Divisiones",
    "buffers": "Buffers"
}
LEGEND_IDX = {
    "divisions": 3,
    "buffers": 2
}
INDIC_DESC = {
    "hab": "Población (cant)",
    "area_km2": "Superficie (km2)",
    "hab_km2": "Densidad poblacional (hab/km2)",
    "_0_14": "0 a 14 años (%)",
    "_15_64": "15 a 64 años (%)",
    "mas_65": "Más de 65 años (%)",
    "comercial": "Zona comercial (%)",
    "residencia": "Zona residencial (%)",
    "industrial": "Zona industrial (%)",
    "servicios": "Zona de servicios (%)",
    "otros": "Otros usos (%)",
    "con_basica": "Calidad constructiva básica (%)",
    "con_insuf": "Calidad constructiva insuficiente (%)",
    "con_satisf": "Calidad constructiva satisfactoria (%)",
    "serv_basic": "Conexión a servicios básica (%)",
    "serv_insuf": "Conexión a servicios insuficiente (%)",
    "serv_satis": "Conexión a servicios satisfactoria (%)",
    "hac_149": "1.49 habs por cuarto o menos (%)",
    "hac_150": "1.50 habs por cuarto o más (%)",
    "ocup_viv": "Ocupación de vivienda (%)",
    "desocup": "Desocupación (%)",
    "empleo": "Empleo (%)",
    "inact": "Inactividad (%)",
    "nse_alt": "Nivel socioeconómico 1",
    "nse_mex_ca": "Nivel socioeconómico 2",
    "educ_priv": "Est. educativos privados (cant)",
    "educ_pub": "Est. educativos públicos (cant)",
    "educ_sup": "Educación superior (%)",
    "escolarida": "Escolaridad (%)",
    "d_ffcc": "Distancia al ffcc (km)",
    "d_metrobus": "Distancia al metrobús (km)",
    "d_subte": "Distancia al subte (km)",
    "reach_area": "Sup. alcanzable en colectivo (km2)",
    "reach_prop": "Sup. alcanzable en colectivo (% CABA)",
    "nbi": "NBI (%)",
    "compu": "Uso de computadora (%)",
    "esp_verde": "Superficie espacios verdes (%)",
    "hospitales": "Hospitales (cant)"
}

function create_legend(indic, legendType, min, max) {
    var idx = LEGEND_IDX[legendType]
    var legend = $("div .cartodb-legend-stack").children("div")[idx]
    $(legend).attr("id", "legend-" + legendType)
    $(legend).attr("indicator", indic)
    $("#current-" + legendType + "-indic").remove()
    $(legend).prepend(build_legend_indicator(indic, legendType))

    // set min-max
    var liMin = $(legend).find("li.min")[0]
    $(liMin).text(Math.round(min * 100) / 100)
    var liMax = $(legend).find("li.max")[0]
    $(liMax).text(Math.round(max * 100) / 100)
}

function build_legend_indicator(indic, legendType) {
    var change = $("<a>").text("cambiar").click(function() {
        $("#panel-indicadores").css("display", "block")
        $("#panel-indicadores").attr("legend-type", legendType)
    })
    var text = LEGEND_NAME[legendType] + ": " + INDIC_DESC[indic] + "  "
    var p = $("<p>").attr("id", "current-" + legendType + "-indic")
    return p.append(text).append(change).attr("class", "legend-indic")
}

function change_indic(indic, legendType, min, max, all, layer) {
    var step = Math.round(all.length / (COLORS[legendType].length))
    // console.log(step)

    var positions = _.range(all.length, 0, -step)
    // console.log(positions)

    var thresholds = $.map(positions, function (pos, index) {
        console.log(pos - 1, all[pos - 1][indic])
        return all[pos - 1][indic]
    })
    // console.log(thresholds)

    var css = create_css(indic, COLORS[legendType], thresholds,
        TBL_NAMES[legendType], DEFAULT_COLORS[legendType])

    console.log(css)
    layer.getSubLayer(SUBLAYER_IDX[legendType]).setCartoCSS(css)
}

// create custom css
COLORS = {
    "divisions": ["#005824", "#238B45", "#41AE76", "#66C2A4", "#CCECE6",
        "#D7FAF4", "#EDF8FB"
    ],
    "buffers": ["#B10026", " #E31A1C", "#FC4E2A", "#FD8D3C", "#FEB24C",
        "#FED976", "#FFFFB2"
    ]
}
TBL_NAMES = {
    "divisions": "divisiones",
    "buffers": "buffers_estaciones"
}
DEFAULT_COLORS = {
    "divisions": "#878787",
    "buffers": "#878787"
}

function create_css(indic, colors, thresholds, table, defaultColour) {
    table = "#" + table

    // general settings
    var css = "/** choropleth visualization */ "
    css += table + "{polygon-fill: " + defaultColour + ";"
    css += "polygon-opacity: 0.8; line-color: #FFF; line-width: 0.5;"
    css += "line-opacity: 1;} "

    // colors segments
    $.each(colors, function(index, color) {
        css += table + "[" + indic + "<=" + thresholds[index] + "]{"
        css += "polygon-fill:" + color + "} "
    })
    return css
}

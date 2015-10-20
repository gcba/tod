DEFAULT_INDIC_DIVS = "hab_km2"
DEFAULT_INDIC_BUFFERS = "hab_km2"
SUBLAYER_IDX = {
        "divisions": 0,
        "buffers": 1
    }
    // trackea el status de las variables necesarias para
    // actualizar las queries
g_divisions = {
    "table": "divisiones",
    "sfField": "orig_sf",
    "areaLevel": "None",
    "tags": [],
    "indicator": DEFAULT_INDIC_DIVS,
    "sublayer_idx": 0,
    "display_lgd": false,
}
g_buffers = {
    "table": "buffers_estaciones",
    "sfField": "orig_sf",
    "tags": [],
    "indicator": DEFAULT_INDIC_BUFFERS,
    "sublayer_idx": 1,
    "display_lgd": false,
}
globals = {
    "divisions": g_divisions,
    "buffers": g_buffers
}
cartodb_vis = null


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
            cartodb_vis = vis
                // layer 0 is the base layer, layer 1 is cartodb layer
                // setInteraction is disabled by default
            layers[1].setInteraction(true);
            layers[1].on('featureOver', function(e, latlng, pos, data) {
                cartodb.log.log(e, latlng, pos, data);
            });
            var map = vis.getNativeMap();

            // add a nice baselayer from Stamen
            // L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
            //     attribution: 'Stamen'
            // }).addTo(map);

            // now, perform any operations you need
            // map.setZoom(3);
            // map.panTo([50.5, 30.5]);
            var sublayer = layers[1].getSubLayer(0)
            sublayer.infowindow.set("template",
                get_infowindow("divisions").html())

            var sublayer = layers[1].getSubLayer(1)
            sublayer.infowindow.set("template",
                get_infowindow("buffers").html())

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
            create_download_image()
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
    "est_sub_prem": "Estaciones de Premetro",
    "lin_sub_prem": "Lineas de Premetro",
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
DIVS_SINGLE_NAME = {
    "None": "No se ha seleccionado una división",
    "RADIO": "Radio",
    "FRAC": "Fracción",
    "BARRIO": "Barrio",
    "DPTO": "Comuna"
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
        g_divisions["areaLevel"] = this.name

        $("#" + idButton).text(this.text + "   ")
        $("#" + idButton).append($("<span class='caret'></span>"))

        $("#tag-list-divisiones").empty()
        if (this.name != "None") {
            get_filter_divs(layer, this.name)
            $(get_legend("divisions")).css("display", "block")
            g_divisions["displayLgd"] = true
        } else {
            $(get_legend("divisions")).css("display", "none")
            g_divisions["displayLgd"] = false
        }
        // $("#divisiones").attr("areaLevel", this.name)

        do_cartodb_query(layer.getSubLayer(0), query)

        $("#panel-indicadores").attr("legend-type", "divisions")
        if (this.name != "None") {
            recalculate_divisions_indicator(layer, g_divisions["indicator"])
        }
        update_infowindow(layer, "divisions")

    })
    $("#" + idItems).append($('<li>').append(a))
}

function update_infowindow(layer, legendType) {
    var sublayer = layer.getSubLayer(SUBLAYER_IDX[legendType])

    if (legendType == "divisions") {
        var updated_infowindow_html = update_divisions_infowindow()
    } else if (legendType == "buffers") {
        var updated_infowindow_html = update_buffers_infowindow()
    };

    sublayer.infowindow.set("template", updated_infowindow_html)

}

function update_divisions_infowindow() {
    var infowindow = $(get_infowindow("divisions").html())

    var division = DIVS_SINGLE_NAME[g_divisions["areaLevel"]]
    $(infowindow.find("h4")[0]).text(division)
    var division = DIVS_SINGLE_NAME[g_divisions["areaLevel"]]
    $(infowindow.find("h4")[0]).text(division)

    var id_field = "content.data." + DIVS_ID_FIELD[g_divisions["areaLevel"]]
    $(infowindow.find("p")[0]).text("{{" + id_field + "}}")

    $(infowindow.find("h4")[1]).text(INDIC_DESC[g_divisions["indicator"]])
    var indicator = "content.data." + g_divisions["indicator"]
    $(infowindow.find("p")[1]).text("{{" + indicator + "}}")

    return '<div class="cartodb-popup">' + infowindow.html() + '</div>'
}

function update_buffers_infowindow() {
    var infowindow = get_infowindow("buffers")

    $(infowindow.find("h4")[0]).text(INDIC_DESC[g_buffers["indicator"]])
    var indicator = "content.data." + g_buffers["indicator"]
    $(infowindow.find("p")[0]).text("{{" + indicator + "}}")

    return '<div class="cartodb-popup">' + infowindow.html() + '</div>'
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
    "Premetro": "est_sub_prem",
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

    create_selected_buffers_field(layer)

    // boton que agrega el buffer al campo con los seleccionados
    $("#button-add-buffer").click(function() {
        var modo = $("#dropdownMenuBufferModoTrans").text()
        var size = $("#selector-buffer-size").attr("name")
        var tag = modo + " (" + String(size) + ")"
        if (modo.trim() != "Modo transporte" && size != "None") {
            g_buffers["tags"].addTag(tag)
        } else {
            alert("Debe seleccionar un modo de transporte y una distancia.")
        };
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
    g_buffers["tags"] = selector.tags({
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
                    g_buffers["tags"].removeTag(tag)
                };
            })
        };
    }

    function add_buffer_tag(newTag) {
        make_select_buffers_query(newTag)
        update_capas_transporte(newTag, true)
        g_buffers["displayLgd"] = true
    }

    function remove_buffer_tag(oldTag) {
        make_select_buffers_query(oldTag)
        update_capas_transporte(oldTag, false)
        if (g_buffers["tags"].getTags().length == 0) {
            g_buffers["displayLgd"] = false
        };
    }

    function make_select_buffers_query(newTag) {
        var tags = g_buffers["tags"].getTags()
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
        $("#panel-indicadores").attr("legend-type", "buffers")
        recalculate_buffers_indicator(layer, g_buffers["indicator"])
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

    return g_buffers["tags"]
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
    var areaLevel = g_divisions["areaLevel"]
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
            // console.log(pos, all.length, all[pos][indic], all[all.length])
        while (!all[pos][indic]) {
            pos -= 1
        }
        // console.log(all.length - 1, pos)
        all = all.slice(0, pos + 1)
            // console.log(all.length - 1, pos)
            // console.log(pos, all.length - 1, all[pos][indic])

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
    "reach_area": "Sup. alcanzable en 1 colectivo (km2)",
    "reach_prop": "Sup. alcanzable en 1 colectivo (% CABA)",
    "nbi": "NBI (%)",
    "compu": "Uso de computadora (%)",
    "esp_verde": "Superficie espacios verdes (%)",
    "hospitales": "Hospitales (cant)"
}

function get_legend(legendType) {
    var idx = LEGEND_IDX[legendType]
    return $("div .cartodb-legend-stack").children("div")[idx]
}

function create_legend(indic, legendType, min, max) {
    var legend = get_legend(legendType)
    $(legend).attr("id", "legend-" + legendType)

    // $(legend).attr("indicator", indic)
    globals[legendType]["indicator"] = indic

    $("#current-" + legendType + "-indic").remove()
    $(legend).prepend(build_legend_indicator(indic, legendType))

    // set min-max
    var liMin = $(legend).find("li.min")[0]
    $(liMin).text(Math.round(min * 100) / 100)
    var liMax = $(legend).find("li.max")[0]
    $(liMax).text(Math.round(max * 100) / 100)

    if (globals[legendType]["displayLgd"]) {
        $(legend).css("display", "block")
    } else {
        $(legend).css("display", "none")
    };
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
    globals[legendType]["indicator"] = indic

    var step = Math.round(all.length / (COLORS[legendType].length))
        // console.log(step)

    var positions = _.range(all.length, 0, -step)
        // console.log(positions)

    var thresholds = $.map(positions, function(pos, index) {
            console.log(pos - 1, all[pos - 1][indic])
            return all[pos - 1][indic]
        })
        // console.log(thresholds)

    var css = create_css(indic, COLORS[legendType], thresholds,
        TBL_NAMES[legendType], DEFAULT_COLORS[legendType])

    console.log(css)
    var sublayer = layer.getSubLayer(SUBLAYER_IDX[legendType])
    sublayer.setCartoCSS(css)
    update_infowindow(layer, legendType)
}

function get_infowindow(legendType) {
    return $('#infowindow_' + legendType)
}

function get_infowindow_html(legendType) {
    var ini_script = '<script type="infowindow/html" id="infowindow_divisions">'
    var end_script = '</script>'
    return ini_script + get_infowindow(legendType).html() + end_script
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
    css += "polygon-opacity: 0.8; line-color: #FFF; line-width: 0.3;"
    css += "line-opacity: 1;} "

    // colors segments
    $.each(colors, function(index, color) {
        css += table + "[" + indic + "<=" + thresholds[index] + "]{"
        css += "polygon-fill:" + color + "} "
    })
    return css
}

// descargar mapa
function create_download_image() {
    $("#button-download-image").click(function() {
        html2canvas($("#map").get(), {
            onrendered: function(canvas) {
                var w = window.open();
                $(w.document.body).css("top", "0")
                $(w.document.body).css("left", "0")
                $(w.document.body).css("margin", "0 0 0 0")
                $(w.document.body).append(canvas)
            },
            useCORS: true,
            allowTaint: true,
            letterRendering: true
        });
    })

}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new BlobBuilder();
    bb.append(ab);
    return bb.getBlob(mimeString);
}

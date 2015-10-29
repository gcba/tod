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
    "displayLgd": false,
}
g_buffers = {
    "table": "buffers_estaciones",
    "sfField": "orig_sf",
    "tags": [],
    "indicator": DEFAULT_INDIC_BUFFERS,
    "sublayer_idx": 1,
    "displayLgd": false,
}
globals = {
    "divisions": g_divisions,
    "buffers": g_buffers
}
cartodb_vis = null
AREA_WEIGHTED = ["hab_km2"]
NON_WEIGHTED = ["hab", "area_km2"]
DEFAULT_SELECTED_INDICATORS = ["hab", "hab_km2", "area_km2", "d_ffcc",
    "d_metrobus", "d_subte", "reach_area", "reach_prop", "desocup",
    "empleo", "inact", "nse_alt", "nse_mex_ca", "comercial"
]

function main() {
    cartodb.createVis('map', 'https://agustinbenassi.cartodb.com/api/v2/viz/39748176-72ab-11e5-addc-0ecd1babdde5/viz.json', {
            shareable: true,
            title: true,
            description: true,
            search: true,
            tiles_loader: true,
            center_lat: -34.615753,
            center_lon: -58.4,
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

            // set the map empty
            do_cartodb_query(layers[1].getSubLayer(0), "")
            do_cartodb_query(layers[1].getSubLayer(1), "")
            do_cartodb_query(layers[1].getSubLayer(2), "")
            do_cartodb_query(layers[1].getSubLayer(3), "")

            create_trans_list(layers[1])
            create_divs_selector(layers[1])
            create_main_panel_hide_btn()
            create_buffers_selector(layers[1])
            create_change_indicators_panel(layers[1])
            create_selected_indicators_table()
            create_select_indicators_panel(layers[1])
            create_panel_indicators_hide_btn()
            create_legends_hide_btn()
            create_legend(DEFAULT_INDIC_DIVS, "divisions")
            create_legend(DEFAULT_INDIC_BUFFERS, "buffers")
            set_legend_container_hidden()
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
function create_main_panel_hide_btn() {
    $("#close-main-panel").click(function() {
        $("#main-panel").hide("fast")
        $("#open-main-panel").show("fast")
    })
    $("#open-main-panel").click(function() {
        $("#main-panel").show("fast")
        $("#open-main-panel").hide("fast")
    })
}

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
            set_legend_container_hidden()
        }
        // $("#divisiones").attr("areaLevel", this.name)

        do_cartodb_query(layer.getSubLayer(0), query)

        $("#panel-indicators").attr("legend-type", "divisions")
        if (this.name != "None") {
            recalculate_divisions_indicator(layer, g_divisions["indicator"])
            $("#panel-indicators-seleccionados").show("fast")
            calculate_indicators(layer)
        } else {
            if (!g_buffers["displayLgd"]) {
                $("#panel-indicators-seleccionados").hide("fast")
            } else {
                calculate_indicators(layer)

            };
        }
        update_tooltip(layer, "divisions")
        set_universe_totals(layer)
    })
    $("#" + idItems).append($('<li>').append(a))
}

function update_tooltip(layer, legendType) {
    // sólo usar tooltip o infobox, pero no las dos

    if (legendType == "divisions") {
        // update_divisions_tooltip(layer, legendType)
        // update_divisions_infobox(layer, legendType)
    } else if (legendType == "buffers") {
        // update_buffers_tooltip(layer, legendType)
        // update_buffers_infobox(layer, legendType)
    };
}

function update_divisions_infobox(layer, legendType) {
    // no funciona con divisions+buffers activado
    var division = DIVS_SINGLE_NAME[g_divisions["areaLevel"]]
    var id_field = DIVS_ID_FIELD[g_divisions["areaLevel"]]
    var indicator = g_divisions["indicator"]
    var indicator_desc = INDIC[indicator]["short"]

    $("#divisions-tooltip").remove()

    var sublayer = layer.getSubLayer(SUBLAYER_IDX[legendType])
    sublayer.set({
        'interactivity': ['cartodb_id', id_field, indicator]
    });
    var i = new cdb.geo.ui.InfoBox({
        width: 300,
        layer: layer,
        template: '<div id="divisions-tooltip" class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><h4>' + division + '</h4><p>{{' + id_field + '}}</p><h4>' + indicator_desc + '</h4><p>{{' + indicator + '}}</p></div></div>',
        position: 'top|left'
    });
    $('#map').append(i.render().el);

}

function update_divisions_tooltip(layer, legendType) {
    var division = DIVS_SINGLE_NAME[g_divisions["areaLevel"]]
    var id_field = DIVS_ID_FIELD[g_divisions["areaLevel"]]
    var indicator = g_divisions["indicator"]
    var indicator_desc = INDIC[indicator]["short"]

    $("#divisions-tooltip").remove()

    var sublayer = layer.getSubLayer(SUBLAYER_IDX[legendType])
    sublayer.set({
        'interactivity': ['cartodb_id', id_field, indicator]
    });
    var i = new cdb.geo.ui.Tooltip({
        layer: layer,
        template: '<div id="divisions-tooltip" class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><h4>' + division + '</h4><p>{{' + id_field + '}}</p><h4>' + indicator_desc + '</h4><p>{{' + indicator + '}}</p></div></div>',
        width: 200,
        position: 'bottom|right'
    });
    $('#map').append(i.render().el);
    console.log("Tooltip set with:", division, id_field, indicator)
}

function update_buffers_tooltip(layer, legendType) {
    // no está implementado
}

function set_universe_totals(layer) {
    // remueve resultados anteriores
    $("#poblacion-total").text("")
    $("#superficie-total").text("")

    var sublayerDivs = layer.getSubLayer(SUBLAYER_IDX["divisions"])
    var sublayerBuffers = layer.getSubLayer(SUBLAYER_IDX["buffers"])
    var queryDivs = sublayerDivs.getSQL()
    var queryBuffers = sublayerBuffers.getSQL()

    if (g_divisions["displayLgd"] && g_buffers["displayLgd"]) {
        set_coverage_universe_totals(queryDivs, queryBuffers)
    } else if (g_divisions["displayLgd"]) {
        set_divisions_universe_totals(queryDivs)
    } else if (g_buffers["displayLgd"]) {
        set_buffers_universe_totals(queryBuffers)
    } else {
        $("#poblacion-total").text("0.00")
        $("#superficie-total").text("0.00")
    };
}

function set_divisions_universe_totals(mapDivsQuery) {
    var queryPop = mapDivsQuery.replace("*", "SUM(hab) AS hab")
    execute_query(queryPop, function(data) {
        var pop = format_val("hab", data.rows[0]["hab"])
        $("#poblacion-total").text(pop)
    })

    var queryArea = mapDivsQuery.replace("*", "SUM(area_km2) AS area_km2")
    execute_query(queryArea, function(data) {
        var area = format_val("area_km2", data.rows[0]["area_km2"])
        $("#superficie-total").text(area)
    })
}

POLYS_UNION_SELECT = "1 AS cartodb_id, ST_Buffer(ST_Union(the_geom), 0) AS the_geom"
POLYS_DIFF_UNION_SELECT = "1 AS cartodb_id, ST_Union(ST_Difference(ST_Buffer(divisiones.the_geom, 0), buffers_union.the_geom)) AS the_geom FROM divisiones, buffers_union"

function query_pop_in(mapBuffersQuery) {
    var queryPop = "WITH buffers_union AS ("
    queryPop += mapBuffersQuery.replace("*", POLYS_UNION_SELECT)
    queryPop += "), \
 \
divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, divisiones.hab, \
            (ST_Area(ST_Intersection(ST_Buffer(divisiones.the_geom, 0), buffers_union.the_geom)) / ST_Area(divisiones.the_geom)) AS intersect_sup \
     FROM divisiones, buffers_union \
     WHERE ST_Intersects(divisiones.the_geom, buffers_union.the_geom) \
         AND divisiones.orig_sf = 'RADIO') \
 \
SELECT SUM(divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) \
FROM divs_con_intersect_sups"
    return queryPop
}

function query_area_in(mapBuffersQuery) {
    var queryArea = "WITH buffers_union AS ("
    queryArea += mapBuffersQuery.replace("*", POLYS_UNION_SELECT)
    queryArea += "), \
 \
 divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, \
            divisiones.area_km2, \
            (ST_Area(ST_Intersection(ST_Buffer(divisiones.the_geom, 0), buffers_union.the_geom)) / ST_Area(divisiones.the_geom)) AS intersect_sup \
     FROM divisiones, buffers_union \
     WHERE ST_Intersects(divisiones.the_geom, buffers_union.the_geom) \
         AND divisiones.orig_sf = 'RADIO') \
 \
SELECT SUM(divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) \
FROM divs_con_intersect_sups"
    return queryArea
}

function set_buffers_universe_totals(mapBuffersQuery) {

    // set population universe total
    var queryPop = query_pop_in(mapBuffersQuery)
    execute_query(queryPop, function(data) {
        var pop = format_val("hab", data.rows[0]["sum"])
        $("#poblacion-total").text(pop)
    })

    // set area universe total
    var queryArea = query_area_in(mapBuffersQuery)
    execute_query(queryArea, function(data) {
        var area = format_val("area_km2", data.rows[0]["sum"])
        $("#superficie-total").text(area)
    })
}

function set_coverage_universe_totals(mapDivsQuery, mapBuffersQuery) {
    var queryPopAll = mapDivsQuery.replace("*", "SUM(hab) AS hab")
    var queryAreaAll = mapDivsQuery.replace("*", "SUM(area_km2) AS area_km2")
    var queryPopIn = query_pop_in(mapBuffersQuery)
    var queryAreaIn = query_area_in(mapBuffersQuery)

    execute_query(queryPopAll, function(dataPopAll) {
        var popAll = format_val("hab", dataPopAll.rows[0]["hab"])
        execute_query(queryAreaAll, function(dataAreaAll) {
            var areaAll = format_val("area_km2", dataAreaAll.rows[0]["area_km2"])

            execute_query(queryPopIn, function(dataPopIn) {
                var popIn = format_val("hab", dataPopIn.rows[0]["sum"])
                execute_query(queryAreaIn, function(dataAreaIn) {
                    var areaIn = format_val("area_km2", dataAreaIn.rows[0]["sum"])

                    var popCover = format_percent(popIn / popAll) + " ("
                    popCover += popIn + " / " + popAll + ")"
                    $("#poblacion-total").text(popCover)

                    var areaCover = format_percent(areaIn / areaAll) + " ("
                    areaCover += areaIn + " / " + areaAll + ")"
                    $("#superficie-total").text(areaCover)
                })
            })
        })
    })

}

function gen_buffers_out_query(mapDivsQuery, mapBuffersQuery, indics) {

    // agrega las variables usadas como ponderadores
    if ($.inArray("hab", indics) == -1) {
        indics.push("hab")
    };
    if ($.inArray("area_km2", indics) == -1) {
        indics.push("area_km2")
    };

    // crea los strings para las partes de la query con los indicators
    var joined_indics1 = "divisiones." + indics.join(", divisiones.")
    var joined_indics1b = " AND divisiones." + indics.join(" IS NOT NULL AND divisiones.") + " IS NOT NULL"
    var joined_indics2 = "divs_con_intersect_sups."
    joined_indics2 += $.grep(indics, function(indic, index) {
        return (indic != "hab" && indic != "area_km2")
    }).join(", divs_con_intersect_sups.")
    var joined_indics3 = "divs_con_habs_y_sups."
    joined_indics3 += indics.join(", divs_con_habs_y_sups.")

    // crea la consulta final que suma los indicators ponderados
    var final_query = ""
    $.each(indics, function(index, indic) {
        if ($.inArray(indic, NON_WEIGHTED) != -1) {
            final_query += "SUM(divs_con_ponds." + indic + ")"
            final_query += " AS "
            final_query += indic + ", "
        } else if ($.inArray(indic, AREA_WEIGHTED) != -1) {
            final_query += "SUM(divs_con_ponds." + indic + " * divs_con_ponds."
            final_query += "pond_sup) AS " + indic + ", "
        } else {
            final_query += "SUM(divs_con_ponds." + indic + " * divs_con_ponds."
            final_query += "pond_hab) AS " + indic + ", "
        };
    })

    // construcción de la query
    var query = "WITH buffers_union AS \
    (" + mapBuffersQuery.replace("*", POLYS_UNION_SELECT) + "), buffers_out AS \
    (" + mapDivsQuery.replace("* FROM divisiones", POLYS_DIFF_UNION_SELECT) + "), \
 \
     divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, " + joined_indics1 + ", \
        CASE WHEN ST_Within(ST_Buffer(divisiones.the_geom, 0), buffers_out.the_geom) THEN 1 \
                ELSE (ST_Area(ST_Intersection(ST_Buffer(divisiones.the_geom, 0), buffers_out.the_geom)) / ST_Area(divisiones.the_geom)) \
            END AS intersect_sup \
     FROM divisiones, buffers_out \
     WHERE ST_Intersects(divisiones.the_geom, buffers_out.the_geom) \
         AND divisiones.orig_sf = 'RADIO' " + joined_indics1b + "), \
 \
     divs_con_habs_y_sups AS \
    (SELECT divs_con_intersect_sups.cartodb_id, " + joined_indics2 + ", \
            (divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) AS area_km2, \
            (divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) AS hab \
     FROM divs_con_intersect_sups), \
 \
     divs_con_ponds AS \
    (SELECT divs_con_habs_y_sups.cartodb_id, " + joined_indics3 + ", \
            (divs_con_habs_y_sups.area_km2 / \
                 (SELECT SUM(area_km2) \
                  FROM divs_con_habs_y_sups)) AS pond_sup, \
            (divs_con_habs_y_sups.hab / \
                 (SELECT SUM(hab) \
                  FROM divs_con_habs_y_sups)) AS pond_hab \
     FROM divs_con_habs_y_sups) \
 \
SELECT * FROM divs_con_ponds"

    return query
}

function gen_buffers_in_query(mapBuffersQuery, indics) {

    // agrega las variables usadas como ponderadores
    if ($.inArray("hab", indics) == -1) {
        indics.push("hab")
    };
    if ($.inArray("area_km2", indics) == -1) {
        indics.push("area_km2")
    };

    // crea los strings para las partes de la query con los indicators
    var joined_indics1 = "divisiones." + indics.join(", divisiones.")
    var joined_indics1b = " AND divisiones." + indics.join(" IS NOT NULL AND divisiones.") + " IS NOT NULL"
    var joined_indics2 = "divs_con_intersect_sups."
    joined_indics2 += $.grep(indics, function(indic, index) {
        return (indic != "hab" && indic != "area_km2")
    }).join(", divs_con_intersect_sups.")
    var joined_indics3 = "divs_con_habs_y_sups."
    joined_indics3 += indics.join(", divs_con_habs_y_sups.")

    // crea la consulta final que suma los indicators ponderados
    var final_query = ""
    $.each(indics, function(index, indic) {
        if ($.inArray(indic, NON_WEIGHTED) != -1) {
            final_query += "SUM(divs_con_ponds." + indic + ")"
            final_query += " AS "
            final_query += indic + ", "
        } else if ($.inArray(indic, AREA_WEIGHTED) != -1) {
            final_query += "SUM(divs_con_ponds." + indic + " * divs_con_ponds."
            final_query += "pond_sup) AS " + indic + ", "
        } else {
            final_query += "SUM(divs_con_ponds." + indic + " * divs_con_ponds."
            final_query += "pond_hab) AS " + indic + ", "
        };
    })

    // construcción de la query
    var query = "WITH buffers_union AS \
    (" + mapBuffersQuery.replace("*", POLYS_UNION_SELECT) + "), \
 \
     divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, " + joined_indics1 + ", \
            (ST_Area(ST_Intersection(ST_Buffer(divisiones.the_geom, 0), buffers_union.the_geom)) / ST_Area(divisiones.the_geom)) AS intersect_sup \
     FROM divisiones, buffers_union \
     WHERE ST_Intersects(divisiones.the_geom, buffers_union.the_geom) \
         AND divisiones.orig_sf = 'RADIO' " + joined_indics1b + "), \
 \
     divs_con_habs_y_sups AS \
    (SELECT divs_con_intersect_sups.cartodb_id, " + joined_indics2 + ", \
            (divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) AS area_km2, \
            (divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) AS hab \
     FROM divs_con_intersect_sups), \
 \
     divs_con_ponds AS \
    (SELECT divs_con_habs_y_sups.cartodb_id, " + joined_indics3 + ", \
            (divs_con_habs_y_sups.area_km2 / \
                 (SELECT SUM(area_km2) \
                  FROM divs_con_habs_y_sups)) AS pond_sup, \
            (divs_con_habs_y_sups.hab / \
                 (SELECT SUM(hab) \
                  FROM divs_con_habs_y_sups)) AS pond_hab \
     FROM divs_con_habs_y_sups) \
 \
SELECT * FROM divs_con_ponds"

    return query
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
        set_universe_totals(layer)
        calculate_indicators(layer)
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
        $("#panel-indicators-seleccionados").css("display", "block")
        calculate_indicators(layer)
    }

    function remove_buffer_tag(oldTag) {
        make_select_buffers_query(oldTag)
        update_capas_transporte(oldTag, false)
        if (g_buffers["tags"].getTags().length == 0) {
            g_buffers["displayLgd"] = false
            if (!g_divisions["displayLgd"]) {
                $("#panel-indicators-seleccionados").css("display", "none")
            } else {
                calculate_indicators(layer)
            };
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
        if (query != "") {
            g_buffers["displayLgd"] = true
        } else {
            g_buffers["displayLgd"] = false
        };
        do_cartodb_query(layer.getSubLayer(1), query)
        $("#panel-indicators").attr("legend-type", "buffers")
        recalculate_buffers_indicator(layer, g_buffers["indicator"])
        set_universe_totals(layer)
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

// crear panel de indicators para cambiar las leyendas
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

function create_panel_indicators_hide_btn() {
    $("#close-indicators-table").click(function() {
        $("#close-indicators-table").hide("fast")
        $("#open-indicators-table").show("fast")
        $("#indicators-seleccionados_wrapper").hide("fast")
    })
    $("#open-indicators-table").click(function() {
        $("#open-indicators-table").hide("fast")
        $("#close-indicators-table").show("fast")
        $("#indicators-seleccionados_wrapper").show("fast")
        $("#indicators-seleccionados").DataTable().draw()
    })
}

function create_change_indicators_panel(layer) {

    var indicsPanel = $("#panel-indicators").children("div .panel-body")
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

        // los indicators son una lista
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

function calculate_indicators(layer) {
    $("#indicators-seleccionados").DataTable().rows().remove().draw()
    var checked = $("#panel-indicators-select").find("input:checked")
    var names = checked.map(function() {
        return this.name;
    }).get();

    select_indicators(layer, names)
}

function create_select_indicators_panel(layer) {
    $("#close-indicators-select").click(function() {
        calculate_indicators(layer)
        $("#panel-indicators-select").hide("fast")
    })

    $("#open-indicators-select").click(function() {
        $("#panel-indicators-select").show("fast")
    })

    var indicsPanel = $("#panel-indicators-select").children("div .panel-body")
    $.each(INDIC_HIERARCHY, function(category, indics) {
        var categoryPanel = $("<div>").attr("class", "panel panel-default")

        // la categoría es el título
        var panelTitle = $("<h5>").attr("class", "panel-title")
        var a = $("<a>").text(category).attr("data-toggle", "collapse")
        a.attr("data-parent", "#accordion-select")
        var idPanelCategory = "category-select-" + category.split(" ").join("-")
        panelTitle.append(a.attr("href", "#" + idPanelCategory))
        var panelHeading = $("<div>").attr("class", "panel-heading")
        categoryPanel.append(panelHeading.append(panelTitle))

        // los indicators son una lista
        var collapsePanel = $("<div>").attr("id", idPanelCategory)
        collapsePanel.attr("class", "panel-collapse collapse")
        var listIndics = $("<ul>").attr("class", "list-group")
        indics.forEach(function(indic) {
            listIndics.append(create_indic_option(layer, indic))
        })
        collapsePanel.append(listIndics)
        categoryPanel.append(collapsePanel)

        indicsPanel.append(categoryPanel)
    })

    calculate_indicators(layer)
}

function calcDataTableHeight(options, percent) {
    var position = $("#indicators-seleccionados").offset()
    var height = ($(document).height() - position.top) * percent
    console.log($(document).height(), position.top, height)
    options.sScrollY = (height - 57) + "px"
    var table = $("#indicators-seleccionados").DataTable(options)
    table.draw();
};

function create_selected_indicators_table() {
    var columns = [{
        title: "Indicador"
    }, {
        title: "In"
    }, {
        title: "Out"
    }, {
        title: "All"
    }]
    var options = {
        "columns": columns,
        "bLengthChange": false,
        'bPaginate': false,
        'bInfo': false,
        'bFilter': false,
        'bDestroy': true,
        "sScrollY": "25vh",
                "bScrollCollapse": true
    }
    var table = $("#indicators-seleccionados").DataTable(options)
    $(window).resize(function() {
        calcDataTableHeight(options, 0.95)
    });
}

function select_indicators(layer, names) {
    console.log(g_divisions["displayLgd"] && g_buffers["displayLgd"])
    var table = $("#indicators-seleccionados").DataTable()

    if (g_divisions["displayLgd"] && g_buffers["displayLgd"]) {
        table.column(1).visible(true)
        table.column(2).visible(true)
        query_indic_mixed(layer, names, table)

    } else if (g_divisions["displayLgd"] || g_buffers["displayLgd"]) {
        if (g_divisions["displayLgd"]) {
            table.column(1).visible(false)
            table.column(2).visible(false)
            var sublayer = layer.getSubLayer(SUBLAYER_IDX["divisions"])
            query_divisions_indic_all(sublayer, names, table, convert_result_in_new_row)
        } else {
            table.column(1).visible(false)
            table.column(2).visible(false)
            var sublayer = layer.getSubLayer(SUBLAYER_IDX["buffers"])
            query_buffers_indic_in(sublayer, names, table, convert_result_in_new_row)
        };

    } else {
        console.log("Nothing showed in the map.")
    };
}

function add_new_row(table, idRow, row) {
    table.row.add(row).draw(true)
}

function query_indic_mixed(layer, indics, table) {

    var sublayerBuffers = layer.getSubLayer(SUBLAYER_IDX["buffers"])
    var sublayerDivisions = layer.getSubLayer(SUBLAYER_IDX["divisions"])

    query_buffers_indic_in(sublayerBuffers, indics, table,
        function(table, indics, bufferInResult) {

            query_buffers_indic_out(layer, indics, table,
                function(table, indics, bufferOutResult) {

                    query_divisions_indic_all(sublayerDivisions, indics,
                        table,
                        function(table, indics, divisionsAllResult) {
                            table.rows().remove().draw()
                            $.each(indics, function(index, indic) {
                                var row = [INDIC[indic]["short"],
                                    format_val(indic, bufferInResult[indic]),
                                    format_val(indic, bufferOutResult[indic]),
                                    format_val(indic, divisionsAllResult[indic])
                                ]
                                add_new_row(table, "table-" + indic, row)
                            })
                        })
                })
        })
}

function convert_result_in_new_row(table, indics, result) {
    $.each(indics, function(index, indic) {
        var row = [INDIC[indic]["short"], "", "", format_val(indic,
            result[indic])]
        add_new_row(table, "table-" + indic, row)
    })
}

function format_val(indic, value) {
    return Math.round(value * INDIC[indic]["scale"] * 100) / 100
}

function format_percent(value) {
    return Math.round(value * 100 * 100) / 100 + "%"
}

function group_by_weight_type(indics) {
    var groupedIndics = {
        "sum": [],
        "pop": [],
        "area": []
    }
    $.each(indics, function(index, indic) {
        if ($.inArray(indic, NON_WEIGHTED) != -1) {
            groupedIndics["sum"].push(indic)
        } else if ($.inArray(indic, AREA_WEIGHTED) != -1) {
            groupedIndics["area"].push(indic)
        } else {
            groupedIndics["pop"].push(indic)
        };
    })
    return groupedIndics
}

function calc_aggregated_indics(rows, indics) {
    var groupedIndics = group_by_weight_type(indics)
    var averages = {}

    // calc indics that must be added, but not averaged
    if (groupedIndics["sum"].length > 0) {
        $.each(groupedIndics["sum"], function(index, indic) {
            averages[indic] = calc_indic_sum(rows, indic)
        })
    }

    // calc weighted indics
    if (groupedIndics["pop"].length > 0) {
        $.each(groupedIndics["pop"], function(index, indic) {
            averages[indic] = calc_indic_weighted_avg(rows, indic, "hab")
        })
    }
    if (groupedIndics["area"].length > 0) {
        $.each(groupedIndics["area"], function(index, indic) {
            averages[indic] = calc_indic_weighted_avg(rows, indic, "area_km2")
        })
    }

    return averages
}

function calc_indic_sum(rows, indic) {
    var indic_sum = 0
    $.each(rows, function(index, row) {
        indic_sum += row[indic]
    })
    return indic_sum
}

function calc_indic_weighted_avg(rows, indic, weight) {
    var indic_sum = 0
    var weight_sum = 0
    $.each(rows, function(index, row) {
        if (row[indic]) {
            indic_sum += row[indic] * row[weight]
            weight_sum += row[weight]
        }
    })
    return indic_sum / weight_sum
}


function query_buffers_indic_out(layer, indics, table, res_manager) {
    var mapDivisionsQuery = layer.getSubLayer(SUBLAYER_IDX["divisions"]).getSQL()
    var mapBuffersQuery = layer.getSubLayer(SUBLAYER_IDX["buffers"]).getSQL()
    var query = gen_buffers_out_query(mapDivisionsQuery, mapBuffersQuery, indics)
    execute_query(query, function(data) {
        var averages = calc_aggregated_indics(data.rows, indics)
        res_manager(table, indics, averages)
    })
}

function query_buffers_indic_in(sublayer, indics, table, res_manager) {
    var query = gen_buffers_in_query(sublayer.getSQL(), indics)
    execute_query(query, function(data) {
        var averages = calc_aggregated_indics(data.rows, indics)
        res_manager(table, indics, averages)
    })
}

function query_divisions_indic_all(sublayer, indics, table, res_manager) {
    var groupedIndics = group_by_weight_type(indics)
    var result = {}

    // create count variables query
    var countCols = ""
    if (groupedIndics["sum"].length > 0) {
        $.each(groupedIndics["sum"], function(index, indic) {
            countCols += ", SUM(" + indic + ") AS " + indic
        })
        countCols = countCols.slice(1)
        var countQuery = sublayer.getSQL().replace("*", countCols)
    } else {
        countQuery = ""
    };

    // create weighted variables query
    var weightedIndics = $.merge(groupedIndics["area"], groupedIndics["pop"])
    weightedIndics.push("area_km2")
    weightedIndics.push("hab")

    if (weightedIndics.length > 2) {
        var weightedCols = weightedIndics.join(", ")
        var weightedQuery = sublayer.getSQL().replace("*", weightedCols)
    } else {
        var weightedCols = ""
        var weightedQuery = ""
    };

    // count query first
    execute_query(countQuery, function(dataCountQuery) {
        execute_query(weightedQuery, function(dataWeightedQuery) {
            var sumAreaWeight = 0
            var sumPopWeight = 0
            var sumWeightedIndics = {}
            $.each(weightedIndics, function(index, indic) {
                if (indic != "hab" && indic != "area_km2") {
                    sumWeightedIndics[indic] = 0
                }
            })

            $.each(dataWeightedQuery.rows, function(index, row) {
                sumAreaWeight += row["area_km2"]
                sumPopWeight += row["hab"]

                $.each(sumWeightedIndics, function(key, value) {
                    if ($.inArray(key, AREA_WEIGHTED) != -1) {
                        sumWeightedIndics[key] += row[key] * row["area_km2"]
                    } else {
                        sumWeightedIndics[key] += row[key] * row["hab"]
                    };
                })
            })

            var result = {}
            $.each(sumWeightedIndics, function(key, value) {
                if ($.inArray(key, AREA_WEIGHTED) != -1) {
                    result[key] = value / sumAreaWeight
                } else {
                    result[key] = value / sumPopWeight
                };
            })

            result = $.extend(dataCountQuery.rows[0], result)
            res_manager(table, indics, result)
        })
    })
}

function create_indic_changer(layer, indic) {
    var li = $("<li>").attr("class", "list-group-item")
    var a = $("<a>").text(INDIC[indic]["short"]).click(function() {
        var legendType = $("#panel-indicators").attr("legend-type")
        if (legendType == "divisions") {
            recalculate_divisions_indicator(layer, indic)
        } else {
            recalculate_buffers_indicator(layer, indic)
        };
    })
    return li.append(a)
}

function create_indic_option(layer, indic) {
    var li = $('<li>').attr("class", "list-group-item")
    li.append($("<input type='checkbox'>").attr("name", indic))
    li.append("  " + INDIC[indic]["short"])

    if ($.inArray(indic, DEFAULT_SELECTED_INDICATORS) != -1) {
        // debugger
        $(li.find("input")[0]).prop("checked", true)
    };

    return li
}

function recalculate_divisions_indicator(layer, indic) {
    // var legendType = $("#panel-indicators").attr("legend-type")
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
        $("#panel-indicators").css("display", "none")
    })
}

function get_indic_div_query(indic, table, origSf) {
    return "SELECT " + indic + " FROM " + table + " WHERE orig_sf = '" + origSf + "' AND " + indic + " IS NOT NULL ORDER BY " + indic
}

function execute_query(query, fnCallback) {
    var sql = new cartodb.SQL({
        user: 'agustinbenassi'
    });
    if (query.length == 0) {
        fnCallback({
            "rows": [{}]
        })
    } else {
        sql.execute(query, {})
            .done(fnCallback)
            .error(function(errors) {
                // errors contains a list of errors
                console.log("errors:" + errors);
            })
    };
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
INDIC = {
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
        "short": "Densidad poblacional (hab/km2)",
        "scale": 1,
        "long": "Densidad poblacional (hab/km2)"
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

function get_legend(legendType) {
    var idx = LEGEND_IDX[legendType]
    return $("div .cartodb-legend-stack").children("div")[idx]
}

function create_legends_hide_btn() {
    $("#close-legends").click(function() {
        $(".cartodb-legend-stack").hide("fast")
        $("#close-legends").hide("fast")
        $("#open-legends").show("fast")
    })
    $("#open-legends").click(function() {
        $(".cartodb-legend-stack").show("fast")
        $("#open-legends").hide("fast")
        $("#close-legends").show("fast")
    })
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
        $("#map .cartodb-legend-stack").show("fast")
        $("#show-hide-legends").show("fast")
    } else {
        $(legend).css("display", "none")
        set_legend_container_hidden()
    };
}

function set_legend_container_hidden() {
    if (!g_buffers["displayLgd"] && !g_divisions["displayLgd"]) {
        $("#map .cartodb-legend-stack").hide("fast")
        $("#show-hide-legends").hide("fast")
    };
}

function build_legend_indicator(indic, legendType) {
    var change = $("<a>").text("cambiar").click(function() {
        $("#panel-indicators").css("display", "block")
        $("#panel-indicators").attr("legend-type", legendType)
    })
    var text = LEGEND_NAME[legendType] + ": " + INDIC[indic]["short"] + "  "
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
    update_tooltip(layer, legendType)
}

function get_tooltip(legendType) {
    return $('#tooltip_' + legendType)
}

function get_tooltip_html(legendType) {
    var ini_script = '<script type="tooltip/html" id="tooltip_divisions">'
    var end_script = '</script>'
    return ini_script + get_tooltip(legendType).html() + end_script
}

// create custom css
COLORS = {
    "divisions": ["#005824", "#238B45", "#41AE76", "#66C2A4",
        "#CCECE6", "#D7FAF4", "#EDF8FB"
    ],
    "buffers": ["#B10026", "#E31A1C", "#FC4E2A", "#FD8D3C",
        "#FEB24C", "#FED976", "#FFFFB2"
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

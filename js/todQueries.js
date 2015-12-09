POLYS_UNION_SELECT = "1 AS cartodb_id, ST_MakeValid(ST_Union(ST_Intersection(buffers_estaciones.the_geom, ST_MakeValid(ST_Buffer(divs.the_geom, 0.00000001))))) AS the_geom"

// por algún motivo esta opción no funciona
// POLYS_UNION_SELECT = "1 AS cartodb_id, ST_MakeValid(ST_Union(safe_intersection(buffers_estaciones.the_geom, divs.the_geom))) AS the_geom"

POLYS_DIFF_UNION_SELECT = "1 AS cartodb_id, ST_MakeValid(ST_Buffer(ST_Union(ST_Difference(ST_MakeValid(divisiones.the_geom), buffers_union.the_geom)), 0.00000001)) AS the_geom FROM divisiones, buffers_union"

SELECT_BUFFERS = "ST_MakeValid(ST_Intersection(buffers_estaciones.the_geom_webmercator, ST_MakeValid(divs.the_geom_webmercator))) AS the_geom_webmercator, buffers_estaciones.cartodb_id"

// no logré que esto funcione, queda sólo para tratar de hacerlo en el futuro
// http://gis.stackexchange.com/questions/50399/how-best-to-fix-a-non-noded-intersection-problem-in-postgis
SAFE_INTERSECTION = " \
CREATE OR REPLACE FUNCTION safe_isect(geom_a geometry, geom_b geometry) \
RETURNS geometry AS \
$$ \
BEGIN \
    RETURN ST_Intersection(geom_a, geom_b); \
    EXCEPTION \
        WHEN OTHERS THEN \
            BEGIN \
                RETURN ST_Intersection(ST_Buffer(geom_a, 0.00000001), ST_Buffer( geom_b, 0.00000001)); \
                EXCEPTION \
                    WHEN OTHERS THEN \
                        RETURN ST_GeomFromText('POLYGON EMPTY'); \
    END; \
END \
$$ \
LANGUAGE 'plpgsql' STABLE STRICT; "

UNIVERSE_CALC_AREA_LEVEL = "FRAC"
COVERAGE_CALC_AREA_LEVEL = "FRAC"

g_queries_cache = {}

$(document).ready(function() {
    $.each(INDICS, function(indic, indicParams) {
        SELECT_BUFFERS += ", buffers_estaciones.{}".format(indic)
    })
})

// realizar queries a cartodb
function do_map_query(sublayer, query) {
    if (query == "") {
        sublayer.hide()
    } else {
        sublayer.show()
        sublayer.setSQL(query)
        if (query != "") {
            console.debug(query)
        } else {
            console.debug("Attempt empty query")
        };
    };
}

function do_db_query(query, fnCallback) {
    console.debug("\n", query, "\n")
    var sql = new cartodb.SQL({
        user: USER
    });
    if (query.length == 0) {
        fnCallback({
            "rows": [{}]
        })
    } else {
        if (query in g_queries_cache) {
            fnCallback({
                "rows": g_queries_cache[query].slice()
            })
        } else if (typeof(Storage) !== "undefined" && sessionStorage.getItem(query)) {
            fnCallback({
                "rows": JSON.parse(sessionStorage.getItem(query))
            })
        } else {
            if (query != "") {
                sql.execute(query, {})
                    .done(function(data) {
                        if (typeof(Storage) !== "undefined") {
                            try {
                                sessionStorage.setItem(query, JSON.stringify(data.rows.slice()))
                            } catch (e) {
                                g_queries_cache[query] = data.rows.slice()
                            }
                        } else {
                            g_queries_cache[query] = data.rows.slice()
                        }

                        fnCallback({
                            "rows": data.rows
                        })
                    })
                    .error(function(errors) {
                        // errors contains a list of errors
                        console.debug("errors:" + errors);
                    })
            } else {
                console.debug("Attempt empty query")
            };
        };
    };
}

// DIVISIONES mapa
function gen_divisions_map_query(areaLevel, areasFilter) {
    if (areaLevel == "None") {
        return ""
    };

    var query = "SELECT divisiones.* FROM divisiones WHERE divisiones.orig_sf = '{}'".format(areaLevel)

    if (areasFilter.length == 1) {
        query += " AND " + div_filter(areaLevel, areasFilter[0])
    } else if (areasFilter.length > 1) {
        query += " AND (" + div_filter(areaLevel, areasFilter[0])
        areasFilter.slice(1).forEach(function(areaFilter) {
            query += " OR " + div_filter(areaLevel, areaFilter)
        })
        query += ")"
    }

    return query
}

function div_filter(areaLevel, areaFilter) {
    var validFilterLevels = DIVS_FILTER_LEVELS[areaLevel]
    var areaLevelField = "divisiones." + DIVS_ID_FIELD
    var query = ""
        // console.log(areaFilter, areaLevel, g_divs_ids[areaLevel])
        // debugger
    if ($.inArray(areaFilter, g_divs_ids[areaLevel]) != -1) {
        query = "{} = '{}'".format(areaLevelField, areaFilter)
    } else {
        $.each(validFilterLevels, function(index, filterLevel) {
            if ($.inArray(areaFilter, g_divs_ids[filterLevel]) != -1) {
                query = "ST_Intersects(divisiones.the_geom, (SELECT the_geom FROM divisiones WHERE orig_sf = '{}' AND id_div = '{}'))".format(filterLevel, areaFilter)
            }
        })
    }
    // console.log("entering here", query)
    return query
}

function gen_divs_legend_query(indic, divsMapQuery) {
    var indicReference = "divisiones." + indic
    var query = gen_divisions_map_query(g_divisions["areaLevel"], [])
    query = query.replace("divisiones.*", indicReference)
    query += " ORDER BY " + indicReference
    return query
}

// BUFFERS mapa
function gen_buffers_map_query(divsMapQuery, tags, filter_tags) {
    if (!divsMapQuery) {
        divsMapQuery = "SELECT divisiones.* FROM divisiones WHERE orig_sf = '{}'".format("DPTO")
    };

    var query = ""
    if (tags.length >= 1) {
        query += "WITH divs AS ({}) SELECT {} FROM buffers_estaciones, divs \
        WHERE ".format(divsMapQuery, SELECT_BUFFERS)

        if (tags.length == 1) {
            query += "buffers_estaciones.orig_sf = '"
        } else {
            query += "(buffers_estaciones.orig_sf = '"
        };
        query += get_sf_name(tags[0]) + "'"
    }
    if (tags.length > 1) {
        tags.slice(1).forEach(function(tag) {
            query += " OR buffers_estaciones.orig_sf = '" + get_sf_name(tag) + "'"
        })
        query += ")"
    }

    if (filter_tags.length == 1) {
        query += " AND " + get_buffer_filter_condition(filter_tags[0])
    }
    if (filter_tags.length > 1) {
        query += " AND ("
        query += filter_tags.map(get_buffer_filter_condition).join(" OR ")
        query += ")"
    }

    if (query.length > 0) {
        query += " AND ST_Intersects(buffers_estaciones.the_geom, divs.the_geom)"
    };

    return query
}

function get_buffer_filter_condition(tag) {
    var nm = get_name_and_mode(tag)
    var field = BUFFERS_FIELDS[nm[1].slice(0, 3)]
    return "buffers_estaciones.{} = '{}'".format(field, nm[0])
}

function get_name_and_mode(tag) {
    // debugger
    var tagPattern = /([^]+)\s+\(([a-z\_]+)\)/i
    var regexRes = tagPattern.exec(tag)
        // debugger
    return [regexRes[1], regexRes[2]]
}

function get_mode_and_size(tag) {
    var tagPattern = /([a-z]+)\s+\(([0-9]+)\)/i
    var regexRes = tagPattern.exec(tag)
    var mode = BUFFERS_TAGS[regexRes[1]]
    var size = regexRes[2]
    return [mode, size]
}

function get_sf_name(tag) {
    var ms = get_mode_and_size(tag)
    return ms[0] + "-buffer" + ms[1]
}

function gen_buffers_legend_query(indic, buffersMapQuery) {
    var indicReference = "buffers_estaciones." + indic
    var query = buffersMapQuery.replace(SELECT_BUFFERS, indicReference)
    query += " ORDER BY " + indicReference
    return query
}

// BUFFERS indicadores
function gen_buffers_out_query(mapDivsQuery, mapBuffersQuery, indics) {
    return gen_buffers_db_query(indics, mapBuffersQuery, mapDivsQuery)
}

function gen_buffers_in_query(mapBuffersQuery, indics) {
    return gen_buffers_db_query(indics, mapBuffersQuery)
}

function gen_buffers_db_query(indics, mapBuffersQuery, mapDivsQuery) {
    var query = ""
        // var query = SAFE_INTERSECTION
        // debugger

    var buffers_union = mapBuffersQuery.replace(SELECT_BUFFERS,
        POLYS_UNION_SELECT)

    // detecta si debe construir una query para lo que está dentro o fuera
    if (mapDivsQuery) {
        var buffers_out = mapDivsQuery.replace("divisiones.* FROM divisiones", POLYS_DIFF_UNION_SELECT)
        var big_polygon = "buffers_out"
        query += "WITH buffers_union AS ({0}), buffers_out AS ({1}), ".format(buffers_union, buffers_out)
    } else {
        var buffers_out = undefined
        var big_polygon = "buffers_union"
        query += "WITH buffers_union AS ({0}), ".format(buffers_union)
    };

    // agrega las variables usadas como ponderadores
    if ($.inArray("hab", indics) == -1) {
        indics.push("hab")
    };
    if ($.inArray("area_km2", indics) == -1) {
        indics.push("area_km2")
    };

    // crea los strings para las partes de la query con los indicators
    var joined_indics1 = "divisiones.{}".format(indics.join(", divisiones."))

    var joined_indics1b = " AND divisiones.{} IS NOT NULL".format(
        indics.join(" IS NOT NULL AND divisiones."))

    // console.log(indics)
    var joined_indics2 = "divs_con_intersect_sups.{}".format(
        $.grep(indics, function(indic, index) {
            return (indic != "hab" && indic != "area_km2")
        }).join(", divs_con_intersect_sups."))

    var joined_indics3 = "divs_con_habs_y_sups.{}".format(
        indics.join(", divs_con_habs_y_sups."))


    // construcción de la query
    query += "divs_con_intersect_sups AS (SELECT divisiones.cartodb_id, {0}, \
        CASE WHEN ST_Within(ST_MakeValid(divisiones.the_geom), {4}.the_geom) THEN 1 \
                ELSE (ST_Area(ST_Intersection(ST_MakeValid(divisiones.the_geom), ST_MakeValid({4}.the_geom) )) / ST_Area(divisiones.the_geom)) \
            END AS intersect_sup \
     FROM divisiones, {4} \
     WHERE ST_Intersects(divisiones.the_geom, {4}.the_geom) \
         AND divisiones.orig_sf = '{5}' {1}), \
 \
     divs_con_habs_y_sups AS \
    (SELECT divs_con_intersect_sups.cartodb_id, {2}, \
            (divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) AS area_km2, \
            (divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) AS hab \
     FROM divs_con_intersect_sups), \
 \
     divs_con_ponds AS \
    (SELECT divs_con_habs_y_sups.cartodb_id, {3}, \
            divs_con_habs_y_sups.area_km2 AS pond_sup, \
            divs_con_habs_y_sups.hab AS pond_hab \
     FROM divs_con_habs_y_sups) \
 \
SELECT * FROM divs_con_ponds".format(joined_indics1, joined_indics1b,
        joined_indics2, joined_indics3, big_polygon, COVERAGE_CALC_AREA_LEVEL)

    return query
}

function query_pop_in(mapBuffersQuery) {
    var queryPop = "WITH buffers_union AS ("
    queryPop += mapBuffersQuery.replace(SELECT_BUFFERS, POLYS_UNION_SELECT)
    queryPop += "), \
 \
divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, divisiones.hab, \
            (ST_Area(ST_Intersection(ST_MakeValid(divisiones.the_geom), ST_MakeValid(buffers_union.the_geom))) / ST_Area(divisiones.the_geom)) AS intersect_sup \
     FROM divisiones, buffers_union \
     WHERE ST_Intersects(divisiones.the_geom, buffers_union.the_geom) \
         AND divisiones.orig_sf = '" + UNIVERSE_CALC_AREA_LEVEL + "') \
 \
SELECT SUM(divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) \
FROM divs_con_intersect_sups"
    return queryPop
}

function query_area_in(mapBuffersQuery) {
    var queryArea = "WITH buffers_union AS ("
    queryArea += mapBuffersQuery.replace(SELECT_BUFFERS, POLYS_UNION_SELECT)
    queryArea += "), \
 \
 divs_con_intersect_sups AS \
    (SELECT divisiones.cartodb_id, \
            divisiones.area_km2, \
            (ST_Area(ST_Intersection(ST_MakeValid(divisiones.the_geom), ST_MakeValid(buffers_union.the_geom))) / ST_Area(divisiones.the_geom)) AS intersect_sup \
     FROM divisiones, buffers_union \
     WHERE ST_Intersects(divisiones.the_geom, buffers_union.the_geom) \
         AND divisiones.orig_sf = '" + UNIVERSE_CALC_AREA_LEVEL + "') \
 \
SELECT SUM(divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) \
FROM divs_con_intersect_sups"
    return queryArea
}

// TRANSPORTE mapa
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

// FILTROS
function query_distinct_cases(field, table, orig_sfs, res_manager) {
    var conditions = {
        "orig_sf": orig_sfs
    }
    var query = gen_distinct_cases_query(field, table, conditions)
    do_db_query(query, res_manager)
}

function gen_distinct_cases_query(field, table, conditions) {
    var query = "SELECT Distinct({}) FROM {}".format(field, table)
        // debugger

    if ($(conditions).size() > 0) {
        var firstCondition = true
        query += " WHERE"
        $.each(conditions, function(key, values) {
            $.each(values, function(index, value) {
                if (firstCondition) {
                    query += " {} = '{}'".format(key, value)
                    firstCondition = false
                } else {
                    query += " AND {} = '{}'".format(key, value)
                }
            })
        })
    }

    return query
}

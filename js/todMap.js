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
    $("#panel-transporte").click(function() {
        $(this).toggleClass("open")
    })
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
    $("#divisiones").click(function() {
        $(this).toggleClass("open")
    })
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

        do_cartodb_query(layer.getSubLayer(0), query)
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
    $("#buffer-modo-transporte").click(function() {
        $(this).toggleClass("open")
    })
    $.each(BUFFERS_TAGS, function(key, val) {
        add_buffers_li("selector-modo-transporte",
            "dropdownMenuBufferModoTrans", key, val)
    })

    $("#buffer-size").click(function() {
        $(this).toggleClass("open")
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
        console.log(tag)
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

    function remove_repeated_modes (newTag) {
        var tags = this.getTags()
        if (tags.length >= 1) {
            tags.forEach(function (tag) {
                var modeTag = get_mode_and_size(tag)[0]
                var modeNewTag = get_mode_and_size(newTag)[0]
                if (modeTag == modeNewTag) {
                    bufferTags.removeTag(tag)
                };
            })
        };
    }

    function add_buffer_tag (newTag) {
        make_select_buffers_query(newTag)
        update_capas_transporte(newTag, true)
    }

    function remove_buffer_tag (oldTag) {
        make_select_buffers_query(oldTag)
        update_capas_transporte(oldTag, false)
    }

    function make_select_buffers_query (newTag) {
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
    }

    function update_capas_transporte (newTag, check) {
        $("#capas-transporte li").each(function (index) {
            var modeTag = $(this).children("input")[0].name
            var modeNewTag = get_mode_and_size(newTag)[0]
            if (modeTag.split("_")[1] == modeNewTag.split("_")[1]) {
                $(this).children("input").prop("checked", check)
            };
        })
        $("#capas-transporte li").trigger("change")
    }

    function get_sf_name (tag) {
        var ms = get_mode_and_size(tag)
        return ms[0] + "-buffer" + ms[1]
    }

    function get_mode_and_size (tag) {
        var tagPattern = /([a-z]+)\s+\(([0-9]+)\)/i
        var regexRes = tagPattern.exec(tag)
        var mode = BUFFERS_TAGS[regexRes[1]]
        var size = regexRes[2]
        return [mode, size]
    }

    return bufferTags
};

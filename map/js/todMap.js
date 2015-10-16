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
            create_trans_list(layers[1])
            create_divs_selector(layers[1])
        })
        .error(function(err) {
            console.log(err);
        });
}
window.onload = main;


// panel de capas de transporte
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
    var panelTransporte = {
        "est_subte": "Estaciones de Subte",
        "lin_subte": "Lineas de Subte",
        "est_ffcc": "Estaciones de Ferrocarril",
        "lin_ffcc": "Lineas de Ferrocarril",
        "est_metrobus": "Estaciones de Metrobus",
        "lin_metrobus": "Lineas de Metrobus",
        "lin_colectivos": "Lineas de Colectivos"
    }
    $.each(panelTransporte, function (key, val) {
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
            queryEstaciones = update_query(name, queryEstaciones, "estaciones")
        } else if (nameType == "lin") {
            queryLineas = update_query(name, queryLineas, "lineas")
        } else {
            console.log(nameType + " from " + name + " not recognized.")
        }
    })

    // do queries
    do_cartodb_query(lineas, queryLineas)
    do_cartodb_query(estaciones, queryEstaciones)
}

function do_cartodb_query (sublayer, query) {
    if (query == "") {
        sublayer.hide()
    } else {
        sublayer.show()
        sublayer.setSQL(query)
    };
}

function update_query (name, query, table) {
    if (query == "") {
        query = get_initial_query(table, name)
    } else {
        query = add_orig_sf(query, name)
    };
    return query
}

function get_initial_query (table, name) {
    return "SELECT * FROM " + table + " WHERE orig_sf = '" + name + "'"
}

function add_orig_sf (query, name) {
    return query += " OR orig_sf = '" + name + "'"
}


// panel principal
// filtros
// divisiones
function create_divs_selector (layer) {
    $("#selector-divisiones").change(function() {
        var value = $("#selector-divisiones option:selected").val();
        var query = get_initial_query("divisiones", value)
        do_cartodb_query(layer.getSubLayer(0), query)
    })
    var divisiones = {
        "None": "Ninguna",
        "RADIO": "Radios",
        "FRAC": "Fracciones",
        "BARRIO": "Barrios",
        "DPTO": "Comunas"
    }
    $.each(divisiones, function (key, val) {
        add_div_option("selector-divisiones", val, key)
    })
}

function add_div_option(idSelector, text, value) {
    var option = $('<option>').attr("value", value).text(text)
    $("#" + idSelector).append(option)
}

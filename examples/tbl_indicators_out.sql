WITH buffers_union AS (WITH divs AS
                           (SELECT divisiones.*
                            FROM divisiones
                            WHERE divisiones.orig_sf = 'DPTO')
                       SELECT 1 AS cartodb_id,
                              ST_MakeValid(ST_Union(ST_Intersection(ST_MakeValid(ST_Buffer(buffers_estaciones.the_geom, 0.00000001)), ST_MakeValid(ST_Buffer(divs.the_geom, 0.00000001))))) AS the_geom
                       FROM buffers_estaciones,
                            divs
                       WHERE buffers_estaciones.orig_sf = 'est_subte-buffer500'
                           AND ST_Intersects(buffers_estaciones.the_geom, divs.the_geom)),
     buffers_out AS
    (SELECT 1 AS cartodb_id,
            ST_Buffer(ST_Difference(ST_Union(ST_MakeValid(divisiones.the_geom)), buffers_union.the_geom), 0.00000001) AS the_geom
     FROM divisiones,
          buffers_union
     WHERE divisiones.orig_sf = 'DPTO'),
     divs_con_intersect_sups AS
    (SELECT divisiones.cartodb_id,
            divisiones.hab,
            divisiones.area_km2,
            divisiones.hab_km2,
            divisiones.comercial,
            divisiones.desocup,
            divisiones.empleo,
            divisiones.inact,
            divisiones.nse_mex_ca,
            divisiones.d_ffcc,
            divisiones.d_metrobus,
            divisiones.d_subte,
            divisiones.reach_area,
            divisiones.reach_prop,
            CASE
                WHEN ST_Within(ST_MakeValid(divisiones.the_geom), buffers_out.the_geom) THEN 1
                ELSE (ST_Area(ST_Intersection(ST_MakeValid(divisiones.the_geom), ST_MakeValid(buffers_out.the_geom))) / ST_Area(divisiones.the_geom))
            END AS intersect_sup
     FROM divisiones,
          buffers_out
     WHERE ST_Intersects(divisiones.the_geom, buffers_out.the_geom)
         AND divisiones.orig_sf = 'RADIO'
         AND divisiones.hab IS NOT NULL
         AND divisiones.area_km2 IS NOT NULL
         AND divisiones.hab_km2 IS NOT NULL
         AND divisiones.comercial IS NOT NULL
         AND divisiones.desocup IS NOT NULL
         AND divisiones.empleo IS NOT NULL
         AND divisiones.inact IS NOT NULL
         AND divisiones.nse_mex_ca IS NOT NULL
         AND divisiones.d_ffcc IS NOT NULL
         AND divisiones.d_metrobus IS NOT NULL
         AND divisiones.d_subte IS NOT NULL
         AND divisiones.reach_area IS NOT NULL
         AND divisiones.reach_prop IS NOT NULL),
     divs_con_habs_y_sups AS
    (SELECT divs_con_intersect_sups.cartodb_id,
            divs_con_intersect_sups.hab_km2,
            divs_con_intersect_sups.comercial,
            divs_con_intersect_sups.desocup,
            divs_con_intersect_sups.empleo,
            divs_con_intersect_sups.inact,
            divs_con_intersect_sups.nse_mex_ca,
            divs_con_intersect_sups.d_ffcc,
            divs_con_intersect_sups.d_metrobus,
            divs_con_intersect_sups.d_subte,
            divs_con_intersect_sups.reach_area,
            divs_con_intersect_sups.reach_prop,
            (divs_con_intersect_sups.area_km2 * divs_con_intersect_sups.intersect_sup) AS area_km2,
            (divs_con_intersect_sups.hab * divs_con_intersect_sups.intersect_sup) AS hab
     FROM divs_con_intersect_sups),
     divs_con_ponds AS
    (SELECT divs_con_habs_y_sups.cartodb_id,
            divs_con_habs_y_sups.hab,
            divs_con_habs_y_sups.area_km2,
            divs_con_habs_y_sups.hab_km2,
            divs_con_habs_y_sups.comercial,
            divs_con_habs_y_sups.desocup,
            divs_con_habs_y_sups.empleo,
            divs_con_habs_y_sups.inact,
            divs_con_habs_y_sups.nse_mex_ca,
            divs_con_habs_y_sups.d_ffcc,
            divs_con_habs_y_sups.d_metrobus,
            divs_con_habs_y_sups.d_subte,
            divs_con_habs_y_sups.reach_area,
            divs_con_habs_y_sups.reach_prop,
            (divs_con_habs_y_sups.area_km2 /
                 (SELECT SUM(area_km2)
                  FROM divs_con_habs_y_sups)) AS pond_sup,
            (divs_con_habs_y_sups.hab /
                 (SELECT SUM(hab)
                  FROM divs_con_habs_y_sups)) AS pond_hab
     FROM divs_con_habs_y_sups)
SELECT *
FROM divs_con_ponds

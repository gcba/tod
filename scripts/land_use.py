#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
land_use.py

Methods for processing land use datasets.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import shapefile
import dataset

from path_finders import get_division_path
from geo_utils import reproject_point, get_shapely_shape


def conn_postgis_db():
    # return dataset.connect('postgresql://abenassi:pass@localhost:5432/tod')
    return dataset.connect('postgresql://localhost:5432')


def find_containing_radios(df):
    shp_path = get_division_path("radios_censo_2010")
    sf = shapefile.Reader(shp_path)

    radios_dict = {int(comuna): {} for comuna in df["comuna"].unique()}
    for sr in sf.iterShapeRecords():
        shape = get_shapely_shape(sr.shape)
        radio = sr.record[0]
        comuna = int(radio.split("_")[0])
        radios_dict[comuna][radio] = shape

    return df.apply(find_containing_shape, axis=1,
                    args=(radios_dict, shp_path))


def find_containing_shape(row, radios_dict, shp_path):
    lat = row["y"]
    lon = row["x"]
    comuna = int(row["comuna"])
    point = reproject_point(lon, lat, shp_path)

    for id_shape, shape in radios_dict[comuna].iteritems():
        if shape.contains(point):
            return id_shape

    return None

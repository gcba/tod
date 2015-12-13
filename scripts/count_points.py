#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
count_points.py

Count points contained by each shape, in a shapefile.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os

from geo_utils import iter_shp_as_shapely
import path_finders as pf


def count_points(points_shp_path, polygons_shp_path):
    points_shp_path = pf.find_shp_path(points_shp_path)
    polygons_shp_path = pf.find_shp_path(polygons_shp_path)

    points = dict(iter_shp_as_shapely(points_shp_path))
    polygons = dict(iter_shp_as_shapely(polygons_shp_path))

    count = {id_polygon: 0 for id_polygon in polygons.iterkeys()}
    for id_polygon, polygon in polygons.iteritems():
        remove_points = []

        for id_point, point in points.iteritems():
            if polygon.contains(point):
                count[id_polygon] += 1
                remove_points.append(id_point)

        for remove_point in remove_points:
            del points[remove_point]

    return count

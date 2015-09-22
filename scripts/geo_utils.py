#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
geo_utils.py

Helper methods for geographic tasks.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
from shapely.geometry import Polygon, Point, LineString
import shapefile


def get_shapely_shapes(sf_est):
    """Convert shapes to shapely shapes.

    Args:
        sf_est (shapefile.Reader): Reader object for a shapefile.
    """

    if sf_est.shapeType == shapefile.POINT:
        return [Point(*shape.points[0]) for shape in sf_est.iterShapes()]
    elif sf_est.shapeType == shapefile.POLYGON:
        return [Polygon(shape.points) for shape in sf_est.iterShapes()]
    elif sf_est.shapeType == shapefile.POLYLINE:
        return [LineString(shape.points) for shape in sf_est.iterShapes()]

    raise Exception("Can't handle shape type " + unicode(sf_est.shapeType))


def get_shapely_shape(shape):

    if shape.shapeType == shapefile.POINT:
        return Point(*shape.points[0])
    elif shape.shapeType == shapefile.POLYGON:
        return Polygon(shape.points)
    elif shape.shapeType == shapefile.POLYLINE:
        return LineString(shape.points)

    raise Exception("Can't handle shape type " + unicode(sf_est.shapeType))


def iter_shp_as_shapely(shp_path):
    """Create a generator to iterate shapes and ids of a shapefile.

    Args:
        shp_path (str): Path to a shapefile.

    Yield:
        tuple: Ids and shapes in the shapely format (id_shape, shapely_shape)
    """

    sf_est = shapefile.Reader(shp_path)

    for record, shape in zip(sf_est.iterRecords(), sf_est.iterShapes()):
        yield (record[0], get_shapely_shape(shape))

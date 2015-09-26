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
import shutil
import distutils

from path_finders import get_project_dir

POPULATION = "hab"


def calculate_area(shape):
    area = get_shapely_shape(shape).area
    return area


def join_df_with_shp(shp_path, df, output_dir, create_pop_density=True):
    """Join data in a DataFrame with a shp from common ids.

    Args:
        shp_path (str): Path where shp is.
        df (pandas.DataFrame): A data frame with data to join by id.
        output_dir (str): Directory where new shp will be.

    Side effects:
        Create a copy of the shp with joined data in output_dir.
        Create population density indicator
    """
    dir_input_shp = os.path.dirname(shp_path)
    shp_name = os.path.basename(shp_path)
    dir_output_shp = os.path.join(get_project_dir(), output_dir, shp_name)

    if os.path.isdir(dir_output_shp):
        # print("should delete")
        shutil.rmtree(dir_output_shp)
    shutil.copytree(dir_input_shp, dir_output_shp)

    sf = shapefile.Reader(shp_path)
    w = shapefile.Writer()

    # creating fields
    for field in sf.fields:
        w.field(*field)
    for indicator in df.columns:
        w.field(*[str(indicator), str("N"), 20, 18])
    if create_pop_density:
        w.field(*[str("area_km2"), str("N"), 20, 18])
        w.field(*[str("hab_km2"), str("N"), 20, 18])
    # print(w.fields)

    # creating records
    for record_shape in sf.iterShapeRecords():
        record = record_shape.record
        shape = record_shape.shape

        if unicode(record[0]) in df.index:
            for col in df.columns:
                record.append(df[col][unicode(record[0])])
            if create_pop_density:
                area = calculate_area(shape) / 1000000
                record.append(area)
                population = df[POPULATION][unicode(record[0])]
                record.append(population / area)
        else:
            for col in df.columns:
                record.append(None)
            if create_pop_density:
                record.append(None)
                record.append(None)
        # print("\n", record)
        w.record(*record)

    w.saveDbf(os.path.join(dir_output_shp, shp_name))
    # shutil.make_archive(dir_output_shp, 'zip', dir_output_shp)


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

    sf = shapefile.Reader(shp_path)

    for shape_record in sf.iterShapeRecords():
        shape = shape_record.shape
        record = shape_record.record
        yield (record[0], get_shapely_shape(shape))

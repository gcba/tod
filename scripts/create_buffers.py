#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
create_buffers.py

Create a derivated shapefile buffering an original one.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import sys
import zipfile
import shapefile
import glob

from path_finders import find_shp_path
import geo_utils
import utils

BASE_DIR = os.path.join("shp", "transporte")
BUFFER_DIR = "buffers"
BUFFERS = [300, 500, 750, 1000, 1500, 2000]


def _create_shp_name(shp_dir, distance):
    return os.path.basename(shp_dir) + "-buffer" + unicode(distance)


def _create_shp_path(directory, shp_name, buffer_dir):
    return os.path.join(os.path.dirname(directory), buffer_dir,
                        shp_name, shp_name)


def write_shapefile(sf_est, shapely_shapes, shp_path):

    # creating a new shapefile for buffers
    w = shapefile.Writer(shapefile.POLYGON)
    for est_buffer in shapely_shapes:
        w.poly(shapeType=shapefile.POLYGON,
               parts=[est_buffer.boundary.coords])

    # creating fields
    for field in sf_est.fields:
        w.field(*field)

    # creating records
    for record in sf_est.iterRecords():
        w.record(*record)

    # print(shp_path)
    w.save(shp_path)


def create_buffered_shp(directory, distance, buffer_dir=BUFFER_DIR,
                        resolution=16, recalculate=False):

    shp_path = find_shp_path(directory)
    shp_name = _create_shp_name(shp_path, distance)
    # print("\n".join([directory, shp_name, buffer_dir]))
    buffer_shp_path = _create_shp_path(directory, shp_name, buffer_dir)
    # print(buffer_shp_path)

    if not os.path.isfile(buffer_shp_path + ".shp") or recalculate:

        # read shapefile with pyshp
        sf_est = shapefile.Reader(shp_path)

        # create buffers from shapely shapes
        buffer_shapes = [shape.buffer(distance, resolution)
                         for shape in geo_utils.get_shapely_shapes(sf_est)]

        write_shapefile(sf_est, buffer_shapes, buffer_shp_path)
        utils.copy_prj(shp_path, buffer_shp_path)


def main(input_dir=BASE_DIR, skip=None, buffers=BUFFERS, recalculate=False):
    skip = skip or []

    # unzip any zipped shapefiles
    for zipped_shp in glob.glob(os.path.join(input_dir, "*.zip")):
        if not os.path.isdir(zipped_shp[:-4]):
            zfile = zipfile.ZipFile(zipped_shp)
            zfile.extractall(zipped_shp[:-4])

    # list shapefile folders
    shp_dirs = (shp for shp in os.listdir(input_dir)
                if os.path.isdir(os.path.join(input_dir, shp)))

    print("Calculating buffers...")
    for shp_dir in shp_dirs:
        if (shp_dir[0] != "." and shp_dir != BUFFER_DIR and
                os.path.basename(shp_dir) not in skip):
            print("\n", shp_dir)
            sys.stdout.flush()

            for distance in buffers:
                print("buffering", shp_dir, "with distance", distance)
                sys.stdout.flush()

                try:
                    create_buffered_shp(os.path.join(input_dir, shp_dir),
                                        distance, BUFFER_DIR,
                                        recalculate=recalculate)
                except Exception as inst:
                    print(shp_dir, "couldn't be buffered with distance",
                          distance)
                    print(inst, "\n")


if __name__ == '__main__':
    main()

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
cartodb_layers.py

Create cartodb layers.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import shapefile
from utils import copy_prj


# SECONDARY
def write_fields(w, shp_paths, merging_field):
    """Write all the fields of merging shape files, without repeating."""
    w.field(str(merging_field), str("C"), 255, 0)
    for id_sf, sf_path in shp_paths.iteritems():
        sf = shapefile.Reader(sf_path)

        # only write fields that are new
        new_fields = [new_field[0] for new_field in w.fields]
        for old_field in sf.fields:
            if (old_field[0] not in new_fields and
                    old_field[0] != "DeletionFlag"):
                # max character size for "C" field types
                if old_field[1] == "C":
                    old_field = (old_field[0], old_field[1], 255, 0)
                if old_field[2] < 4:
                    old_field = (old_field[0], old_field[1], 255, old_field[3])
                w.field(*old_field)


# MAIN
def merge_shapefiles(shp_paths, output_path, merging_field="orig_sf"):
    """Merge shapefiles in a single shapefile.

    There is a merging_field retaining the name of the original field taken
    from shp_paths keys. Fields not shared by all merged shape files will take
    a None value.

    Args:
        shp_paths (dict): Shps to merge {"RADIO": path_to_radio_indicators_shp}
        output_path (str): Path of the merged shapefile.
        merging_field (str): Name of the field retaining name of original shps.
    """

    sf_first = shapefile.Reader(shp_paths.values()[0])
    w = shapefile.Writer(sf_first.shapeType)
    copy_prj(shp_paths.values()[0], output_path)

    # write all the fields first
    write_fields(w, shp_paths, merging_field)

    # now write shapes and records
    new_fields = [new_field[0] for new_field in w.fields]
    for id_sf, sf_path in shp_paths.iteritems():
        print("Merging", id_sf, sf_path)
        sf = shapefile.Reader(sf_path)
        orig_fields = [f[0] for f in sf.fields if f[0] != "DeletionFlag"]

        for sr in sf.shapeRecords():
            record = sr.record
            shape = sr.shape
            w.poly(shapeType=sf.shapeType, parts=[shape.points])

            dict_record = {orig_field: value for orig_field, value in
                           zip(orig_fields, record)}

            # add elements to the record in the writing sf fields order
            new_record = []
            for field in new_fields:
                if field == merging_field:
                    new_record.append(id_sf)
                elif field in dict_record:
                    new_record.append(dict_record[field])
                else:
                    new_record.append(None)

            w.record(*new_record)

    w.save(output_path)

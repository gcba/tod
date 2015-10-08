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


def merge_shapefiles(shp_paths, output_path):

    sf = shapefile.Reader(shp_paths.values()[0])
    w = shapefile.Writer(sf.shapeType)
    w.field(str("orig_sf"), str("C"), 255, 0)

    # write all the fields first
    for id_sf, sf_path in shp_paths.iteritems():
        sf = shapefile.Reader(sf_path)
        old_fields = [f[0] for f in sf.fields]

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

    # now write shapes and records
    new_fields = [new_field[0] for new_field in w.fields]
    for id_sf, sf_path in shp_paths.iteritems():
        print("Merging", id_sf, sf_path)
        sf = shapefile.Reader(sf_path)

        for sr in sf.shapeRecords():
            record = sr.record
            shape = sr.shape
            w.poly(shapeType=sf.shapeType, parts=[shape.points])

            dict_record = {old_field: value for old_field, value in
                           zip(old_fields, record)}

            # add elements to the record in the writing sf fields order
            new_record = [id_sf]
            for field in new_fields:
                if field in dict_record:
                    new_record.append(dict_record[field])
                else:
                    new_record.append(None)

            w.record(*new_record)

    return w
    # import pdb
    # pdb.set_trace()
    w.save(output_path)

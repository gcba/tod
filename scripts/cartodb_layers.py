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

from path_finders import find_shp_path
from utils import copy_prj


def translate(field, group_fields=None, group_fields_by_sf=None):
    """Return the grouped field name, when field is inside a group."""
    name = field[0]

    if group_fields:
        for group_field, fields_group in group_fields.iteritems():
            if name.upper() in map(str.upper, fields_group):
                name = group_field.upper()

    if group_fields_by_sf:
        group_fields_by_sf = {key.upper(): value for key, value in
                              group_fields_by_sf.iteritems()}
        if name.upper() in group_fields_by_sf:
            name = group_fields_by_sf[name.upper()].upper()

    if field[1] == "C":
        return (name, field[1], 255, 0)

    if field[2] < 4:
        return (name, field[1], 255, field[3])

    field[0] = name
    return field


def write_fields(w, shp_paths, merging_field, group_fields=None,
                 group_fields_by_sf=None):
    """Write all the fields of merging shape files, without repeating."""
    gf = group_fields
    gfsf = group_fields_by_sf

    w.field(str(merging_field), str("C"), 255, 0)
    for id_sf, sf_path in shp_paths.iteritems():
        sf = shapefile.Reader(sf_path)

        # only write fields that are new
        new_fields = [new_field[0] for new_field in w.fields]
        for old_field in sf.fields:
            translated_field = translate(old_field, gf,
                                         gfsf[id_sf] if gfsf else None)
            if (translated_field[0] not in new_fields and
                    translated_field[0] != "DeletionFlag"):
                w.field(*translated_field)


def create_shp_paths_dict(shps_dir, replacements=None):
    """Create a dict with paths to shps inside shps_dir directory."""

    shp_paths_dict = {}
    abs_shp_dirs = [os.path.join(shps_dir, shp_dir) for shp_dir in
                    os.listdir(shps_dir)]
    for shp_dir in (i for i in abs_shp_dirs if
                    os.path.isdir(i) and i[0] != "."):
        buffer_tag = shp_dir.split("-")[-1]

        shp_name = os.path.basename(shp_dir).replace("-" + buffer_tag, "")
        if replacements and shp_name in replacements:
            shp_name = replacements[shp_name]

        shp_path = find_shp_path(os.path.join(shps_dir, shp_dir))
        shp_paths_dict[shp_name + "-" + buffer_tag] = shp_path

    return shp_paths_dict


# MAIN
def merge_shapefiles(shp_paths, output_path, merging_field="orig_sf",
                     replacements=None, group_fields=None,
                     group_fields_by_sf=None):
    """Merge shapefiles in a single shapefile.

    There is a merging_field retaining the name of the original field taken
    from shp_paths keys. Fields not shared by all merged shape files will take
    a None value.

    Args:
        shp_paths (dict or str):
            If dict, paths to shps to merge as  {"RADIO": "radio_indic_path"}
            If str, dir where all the subdirs are shps to be merged.
        output_path (str): Path of the merged shapefile.
        merging_field (str): Name of the field retaining name of original shps.
        replacements (dict): Only if shp_paths is str. Replace long names with
            short ones, to put in the merging_field. {"long_name": "short"}
        group_fields (dict): Fields with different names that should be grouped
            into the same field (group_field: ["name1", "name2", "name3"])
    """

    if type(shp_paths) == str or type(shp_paths) == unicode:
        shp_paths = create_shp_paths_dict(shp_paths, replacements)

    sf_first = shapefile.Reader(shp_paths.values()[0])
    w = shapefile.Writer(sf_first.shapeType)
    # print(sf_first.shapeType)
    copy_prj(shp_paths.values()[0], output_path)

    # write all the fields first
    write_fields(w, shp_paths, merging_field, group_fields, group_fields_by_sf)

    # now write shapes and records
    new_fields = [new_field[0] for new_field in w.fields]
    # print(new_fields)
    for id_sf, sf_path in shp_paths.iteritems():
        sf = shapefile.Reader(sf_path)
        print("Merging", sf.shapeType, id_sf.ljust(15),
              os.path.basename(sf_path))

        gfsf = group_fields_by_sf
        orig_fields = [translate(f, group_fields,
                                 gfsf[id_sf] if gfsf else None)[0]
                       for f in sf.fields if f[0] != "DeletionFlag"]
        # print(orig_fields)

        # extend writing shapefile with all new shapes
        w._shapes.extend(sf.shapes())
        for sr in sf.iterShapeRecords():
            record = sr.record
            # shape = sr.shape

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

    # return w
    w.save(output_path)

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
green_land.py

Calculate green spaces indicende per radio.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement

from calculate_weights import create_spatial_index, calc_area
from geo_utils import iter_shp_as_shapely
from path_finders import find_shp_path


def calculate_green_spaces(division_dir, green_spaces_dir):

    division_path = find_shp_path(division_dir)

    if type(green_spaces_dir) != list:
        green_spaces_dir = [green_spaces_dir]
    green_spaces_paths = [find_shp_path(i) for i in green_spaces_dir]

    # create spatial index for green spaces
    green_spaces = []
    for green_spaces_path in green_spaces_paths:
        green_spaces.extend(list(iter_shp_as_shapely(green_spaces_path)))
    green_spaces_idx = create_spatial_index(green_spaces)

    divisions = list(iter_shp_as_shapely(division_path))
    total_divisions = len(divisions)

    green_relevance = {}
    for index, (id_division, division_shp) in enumerate(divisions):
        area = division_shp.area
        area_without_green = calc_area(division_shp, green_spaces,
                                       green_spaces_idx)
        area_green = area - area_without_green
        green_relevance[id_division] = area_green / area

        progress_msg = unicode(index) + " of " + unicode(total_divisions)
        print(progress_msg, end="\r" * len(progress_msg))

    return green_relevance

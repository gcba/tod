#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
calculate_weights.py

Calculate the surface weights of a shapefile of polygons intersecting another
one, typically one being the "inner polygons" shapefile while the other one
act as a container.

The name "division" here is being used to refer to the areas in which census
data may be divided inside the city. The name "buffer" refers to the radious
around a point (subway station, bus station and others) where inside we can
find many "divisions" that intersect totally or partially.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import sys
from rtree import index
import json
from multiprocessing import Process

from path_finders import get_weights_path, iter_buffer_dirs, get_division_dir
from path_finders import find_shp_path
import geo_utils

# DIVISIONS = ["fracciones_caba_censo_2010", "radios_censo_2010"]
DIVISIONS = ["radios_censo_2010"]
# DIVISION_NAMES = ["fracciones", "radios"]
DIVISION_NAMES = ["radios"]
CONTEXT_DIR = os.path.join("shp", "contexto")
EMPTY_SHPS_DIR = [os.path.join(CONTEXT_DIR, "espacios-verdes-privados"),
                  os.path.join(CONTEXT_DIR, "espacios-verdes-publicos")]


def save_to_json(divisions_weights, json_path):
    """Save calculated weights into a json file."""
    with open(json_path, "wb") as f:
        json.dump(divisions_weights, f, indent=4)


def create_spatial_index(shapes):
    """Create and rtree optimized spatial index from shapes.

    Args:
        shapes (list): Shapely objects.
    """
    shapes_idx = index.Index()
    for pos, shape in enumerate(shapes):
        shapes_idx.insert(pos, shape[1].bounds)

    return shapes_idx


def find_intersections(shape, shapes, shapes_idx):
    """Find the shapes that intersect shape."""
    # correct any topological errors of self-intersection
    shape = shape.buffer(0)

    # print(shapes)
    bound_intersects_gen = (shapes[pos] for pos in
                            shapes_idx.intersection(shape.bounds))

    for id_shape, bound_instersect_shape in bound_intersects_gen:

        # correct any topological errors of self-intersection
        bound_instersect_shape = bound_instersect_shape.buffer(0)

        if shape.intersects(bound_instersect_shape):
            yield id_shape, bound_instersect_shape


def remove_intersections(shape, remove_shapes, remove_idx):
    """Remove intersecting shapes from shape."""
    intersect_generator = find_intersections(shape, remove_shapes, remove_idx)
    for id_remove, remove_shape in intersect_generator:
        shape = shape.difference(remove_shape)

    return shape


def calc_area(shape, empty_shapes, empty_idx):
    """Calculate area of a shape subtracting empty shapes."""
    shape = shape.buffer(0)
    intersect_generator = find_intersections(shape, empty_shapes, empty_idx)
    area = shape.area
    for id_empty, empty_shape in intersect_generator:
        area -= shape.intersection(empty_shape.buffer(0)).area

    return area


def calculate_intersect_weights(division_dir, buffer_dir, weights_path,
                                empty_dirs=None, force_buffer_sum=True):
    """Calculate perecentage of division_dir shapes intersecting buffer_dir.

    Find which shapes in the division shapefile intersect with each shape in
    buffer, and how much surface of the division shape is intersecting as well
    as how much of the buffer shape is being intersected by that division
    shape.

    If a list with "empty shapefiles" is provided, the surfaces from
    those shps that intersect with the buffer will not be taken into account
    for the calculation of weights. They will be subtracted both from divisions
    and buffers.

    Args:
        division_dir (str): Directory where shapefile with "inner shapes" is
            in this case the polygons used to divide the greater shape.
        buffer_dir (str): Directory where shapefile with "container shapes" is,
            in this case the buffers calculated over points or lines.
        empty_dirs (list): Paths to shapefiles with surfaces that shouldn't be
            taken into account in the calculation.

    Returns:
        dict: The perecentage of intersected surface is returned as calculated
            over total division area and total buffer area in a dictionary like
            this dict[id_buffer][id_division][division]

        >>> {
            "id_buffer1":
                {"id_division1": {"division": %_intersect_division_surface,
                                  "buffer": %_intersect_buffer_surface},
                 "id_division2": {"division": %_intersect_division_surface,
                                  "buffer": %_intersect_buffer_surface}
                },
            }
    """
    division_path = find_shp_path(division_dir)
    buffer_path = find_shp_path(buffer_dir)
    if empty_dirs:
        empty_paths = [find_shp_path(shp) for shp in empty_dirs]

    # create spatial index for divisions
    divisions = list(geo_utils.iter_shp_as_shapely(division_path))
    divisions_idx = create_spatial_index(divisions)

    # create spatial index for empty shapes
    if empty_dirs:
        empty_shps = []
        for empty_path in empty_paths:
            empty_shps.extend(list(geo_utils.iter_shp_as_shapely(empty_path)))

        empty_idx = create_spatial_index(empty_shps)

    weighted_intersections = {}
    for id_buffer, buffer_shp in geo_utils.iter_shp_as_shapely(buffer_path):
        buffer_shp = buffer_shp.buffer(0)
        weighted_intersections[id_buffer] = {}

        if empty_dirs:
            buffer_area = calc_area(buffer_shp, empty_shps, empty_idx)
        else:
            buffer_area = buffer_shp.area
        assert buffer_area > 0, "Buffer area can't be 0 " + unicode(id_buffer)

        intersect_generator = find_intersections(buffer_shp, divisions,
                                                 divisions_idx)

        for id_division, division_shp in intersect_generator:
            division_shp = division_shp.buffer(0)

            if empty_dirs:
                division_area = calc_area(division_shp, empty_shps, empty_idx)
            else:
                division_area = division_shp.area

            try:
                intersect = buffer_shp.intersection(division_shp)
                if empty_dirs:
                    intersect_area = calc_area(intersect, empty_shps,
                                               empty_idx)
                else:
                    intersect_area = intersect.area
            except Exception as inst:
                print("id_divison:", id_division,
                      "couldn't be intersected with id_buffer:", id_buffer)
                print(inst, "\n")

            weighted_intersections[id_buffer][id_division] = {
                "division": round(intersect_area / division_area, 30),
                "buffer": round(intersect_area / buffer_area, 30)
            }

        if force_buffer_sum:
            total_w = sum([i["buffer"] for i in
                           weighted_intersections[id_buffer].itervalues()])
            for id_division in weighted_intersections[id_buffer]:
                weighted_intersections[id_buffer][
                    id_division]["buffer"] /= total_w

    save_to_json(weighted_intersections, weights_path)
    return weighted_intersections


def main(buffers_dir=None, divisions=DIVISIONS,
         division_names=DIVISION_NAMES, divisions_dir=None,
         empty_shps_dir=EMPTY_SHPS_DIR,
         recalculate=False):

    p_counter = 0
    for buffer_dir in iter_buffer_dirs(buffers_dir):
        for division, division_name in zip(divisions, division_names):
            weights_path = get_weights_path(buffer_dir, division_name)

            if not os.path.isfile(weights_path) or recalculate:
                division_dir = get_division_dir(division, divisions_dir)

                p = Process(target=calculate_intersect_weights,
                            args=(division_dir, buffer_dir,
                                  weights_path, empty_shps_dir))

                print("Start process of calculating intersections between",
                      os.path.basename(division_dir), "and",
                      os.path.basename(buffer_dir), "...")
                p.start()

                if p_counter % 5 == 0:
                    p.join()


if __name__ == '__main__':
    main()

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
reachability.py

Methods to calculate reachability of standard bus services.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
from rtree import index
import numpy as np
import pandas as pd
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import cascaded_union
from create_buffers import write_shapefile
# from calculate_weights import find_intersections
from path_finders import get_division_path, find_shp_path, get_indicators_path
from create_indicators import get_or_create_indicators_df
import time
import shapefile
from path_finders import get_transport_shp_path, get_division_path
from geo_utils import iter_shp_as_shapely, get_shapely_shapes
from shapely.geometry import LineString, Point, Polygon, MultiPolygon, MultiPoint

from global_vars import IDS_GCBA, AREA_LEVEL_SHP_NAME

SHP_INDIC_RADIO = find_shp_path(os.path.join("indicadores",
                                             "radios_censo_2010"))


# AUXILIARY
def find_intersections(shape, shapes):
    """Find the shapes that intersect shape."""
    # correct any topological errors of self-intersection
    shape = shape.buffer(0)

    for shp in shapes:
        if shape.intersects(shp):
            yield shp


def create_spatial_index(points, tolerance):
    """Create and rtree optimized spatial index from points.

    Args:
        points (list): Shapely objects.
    """
    points_idx = index.Index()
    for pos, point in enumerate(points):
        points_idx.insert(pos, Point(point).buffer(tolerance).bounds)

    return points_idx


def split_line(line, shape, tolerance=30):
    splitted_line = line.difference(shape.boundary)
    buffered_shape = shape.buffer(tolerance)
    lines = []
    for s_line in splitted_line:
        if buffered_shape.contains(Point(s_line.coords[0])):
            lines.append(s_line)
        elif buffered_shape.contains(Point(s_line.coords[-1])):
            lines.append(reverse_line(s_line))
    return lines


def reverse_line(line):
    return LineString(list(reversed(line.coords)))


def cut(line, distance):
    # Cuts a line in two at a distance from its starting point
    if distance <= 0.0 or distance >= line.length:
        return [LineString(line)]

    coords = list(line.coords)

    for i, p in enumerate(coords):
        pd = line.project(Point(p))
        if pd == distance:
            return [
                LineString(coords[:i + 1]),
                LineString(coords[i:])]
        if pd > distance:
            cp = line.interpolate(distance)
            return [
                LineString(coords[:i] + [(cp.x, cp.y)]),
                LineString([(cp.x, cp.y)] + coords[i:])]


# SECONDARY
def intersecting_lines(shape, lines):
    return list(find_intersections(shape, lines))


def split_lines_by_shape_start(shape, lines_intersect):
    lines = []
    for line in lines_intersect:
        splitted_lines = split_line(line, shape, 30)
        lines.extend(splitted_lines)
    return lines


def cut_lines_by_travel_dist(lines_split, travel_dist):
    return [cut(line, travel_dist * 1000)[0] for line in lines_split]


def calc_buffers(lines_travel, walk_dist):
    return [line.buffer(walk_dist * 1000) for line in lines_travel]


def gen_grid_points(polygon, distance=50):
    (minx, miny, maxx, maxy) = polygon.bounds
    points = []
    for x in np.arange(minx, maxx, distance):
        for y in np.arange(miny, maxy, distance):
            point = Point(x, y)
            if polygon.contains(point):
                points.append(point)
    return points


# MAIN
def gen_reachable_polygon(shape, lines, walk_dist=0.3, travel_dist=10):

    lines_intersect = intersecting_lines(shape, lines)
    lines_split = split_lines_by_shape_start(shape, lines_intersect)
    lines_travel = cut_lines_by_travel_dist(lines_split, travel_dist)
    travel_buffers = calc_buffers(lines_travel, walk_dist)

    travel_buffers.append(shape)
    return cascaded_union(travel_buffers)


def calc_reachable_surface(polygons):
    surfaces = [polygon.area for polygon in polygons]
    return np.mean(surfaces) / 1000000


def calc_reachable_people(polygons, divisions_path):
    # TODO: Falta implementar la cantidad de población promedio presente en las
    # superficies de los polygons
    return None


def calc_reachable_surface_and_people(shape, lines, walk_dist=0.3,
                                      travel_dist=10, points_distance=100,
                                      print_points=False):
    polygons = []
    for point in gen_grid_points(shape, points_distance):
        if print_points:
            print(point, end=" ")
        polygon = gen_reachable_polygon(point.buffer(walk_dist * 1000), lines,
                                        walk_dist, travel_dist)
        if print_points:
            print(polygon.area / 1000000)
        polygons.append(polygon)

    reachable_surface = calc_reachable_surface(polygons)
    # reachable_people = calc_reachable_people(polygons, SHP_INDIC_RADIO)

    return reachable_surface


def add_value(id_area, value, indicators_df):
    indicators_df.loc[id_area, "reach_area"] = value


def get_indicators_df(area_level="RADIO"):
    indicators_df = get_or_create_indicators_df(area_level)
    old_index = indicators_df.index.copy()
    indicators_df = indicators_df.set_index(IDS_GCBA[area_level])
    return indicators_df, old_index, indicators_df.index


def save_indicators_df(indicators_df, old_index, area_level="RADIO"):
    fracc_index = indicators_df.index.copy()
    indicators_df = indicators_df.set_index(old_index)
    indicators_df[IDS_GCBA[area_level]] = fracc_index
    indicators_df.to_csv(get_indicators_path(area_level), encoding="utf-8")


def main(area_level="RADIO", limit=10000, field_name="reach_area",
         transport_shp_name="recorridos_de_colectivos"):
    df, old_index, new_index = get_indicators_df(area_level)
    already_done = list(df[pd.notnull(df[field_name])].index)

    # get bus lines
    path_bus = get_transport_shp_path(transport_shp_name)
    sf_lines = shapefile.Reader(path_bus)
    lines = get_shapely_shapes(sf_lines)

    # get division shapes
    path_divisions = get_division_path(AREA_LEVEL_SHP_NAME[area_level])
    sf_polys = shapefile.Reader(path_divisions)
    polys = get_shapely_shapes(sf_polys)
    ids = [record[0] for record in sf_polys.records()]
    area_level_shapes = {id_p: polygon for id_p, polygon in zip(ids, polys) if
                         id_p not in already_done}

    # iterate division shapes calculating the indicator
    start = time.time()
    total_shapes = len(area_level_shapes)
    progress_status = "Nothing done."
    for i, (id_shape, shape) in enumerate(area_level_shapes.iteritems(), 1):
        # only add new value if the shape is in the index
        if id_shape in new_index:
            try:
                lines_intersect = intersecting_lines(shape, lines)
                surface = calc_reachable_surface_and_people(shape,
                                                            lines_intersect)
                add_value(id_shape, surface, df)

                elapsed = (time.time() - start) / 60.0
                average = elapsed / i
                prediction = (total_shapes - i) * average

                progress_status = """
                {} {}/{} in {:.2f} mins. Average: {:.2f} Time to end: {:.2f}
                """.format(id_shape.ljust(10), i, total_shapes, elapsed,
                           average, prediction).strip()
                print(progress_status, end="\r" * len(progress_status))

                if i >= limit:
                    print(progress_status)
                    print("Limit of", limit, "shapes reached.")
                    break
            except KeyboardInterrupt:
                print(progress_status)
                print("Interrupted!")
                break

    print("Saving values...", end=" ")
    save_indicators_df(df, old_index)
    print("Done.")


if __name__ == '__main__':
    main()

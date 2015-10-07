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
from shapely.geometry import LineString, Point, Polygon
# from calculate_weights import find_intersections


# AUXILIARY
def find_intersections(shape, shapes):
    """Find the shapes that intersect shape."""
    # correct any topological errors of self-intersection
    shape = shape.buffer(0)

    for shp in shapes:
        if shape.intersects(shp):
            yield shp


def split_line(line, points, tolerance=30):
    if type(points) != list:
        points = [points]
    lines = []

    coords = list(line.coords)
    last_i = 0
    for i, p in enumerate(coords):
        for point in points:
            if Point(p).buffer(tolerance).intersects(point):
                lines.append(LineString(coords[last_i:i + 1]))
                last_i = i

    lines.append(LineString(coords[last_i:]))
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
        intersect_points = shape.boundary.intersection(line)
        splitted_lines = split_line(line, intersect_points, 30)
        lines.append(reverse_line(splitted_lines[0]))
        lines.extend(splitted_lines[1:])
    return lines


def cut_lines_by_travel_dist(lines_split, travel_dist):
    return [cut(line, travel_dist * 1000)[0] for line in lines_split]


def calc_buffers(lines_travel, walk_dist):
    return [line.buffer(walk_dist * 1000) for line in lines_travel]


def make_unified_polygon(travel_buffers):
    unified_polygon = Polygon()

    for shape in travel_buffers:
        unified_polygon = unified_polygon.union(shape)

    return unified_polygon


# MAIN
def get_reachable_surface(shape, lines, walk_dist=0.3, travel_dist=10):

    lines_intersect = intersecting_lines(shape, lines)
    lines_split = split_lines_by_shape_start(shape, lines_intersect)
    lines_travel = cut_lines_by_travel_dist(lines_split, travel_dist)
    travel_buffers = calc_buffers(lines_travel, walk_dist)

    return make_unified_polygon(travel_buffers)


def main():
    pass

if __name__ == '__main__':
    main()

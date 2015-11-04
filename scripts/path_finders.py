#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
path_finders.py

Helper methods related to paths inside the repository.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import sys
from global_vars import AREA_LEVEL_SHP_NAME

BUFFERS_DIR = os.path.join("shp", "transporte", "buffers")
DIVISIONS_DIR = os.path.join("shp", "divisiones")
TRANSPORT_DIR = os.path.join("shp", "transporte")
CONTEXT_DIR = os.path.join("shp", "contexto")
WEIGHTS_DIR = "intersection_weights"


def get_context_shp_path(shp_name):
    context_dir = os.path.join(get_project_dir(), CONTEXT_DIR)
    return find_shp_path(os.path.join(context_dir, shp_name))


def get_indicators_dir():
    return os.path.join(get_project_dir(), "indicadores")


def get_transport_shp_path(shp_name):
    transport_dir = os.path.join(get_project_dir(), TRANSPORT_DIR)
    return find_shp_path(os.path.join(transport_dir, shp_name))


def get_indicators_shp_path(shp_name, subcategory=None):
    if subcategory:
        buffer_indic_path = os.path.join("indicadores", subcategory,
                                         shp_name, shp_name)
    else:
        buffer_indic_path = os.path.join("indicadores", shp_name, shp_name)
    return os.path.join(get_project_dir(), buffer_indic_path)


def get_data_path(area_level, variable, subcategory=None, tag=None):
    if tag:
        filename = area_level + "_" + variable + "_" + tag + ".csv"
    else:
        filename = area_level + "_" + variable + ".csv"

    if subcategory:
        data_path = os.path.join("data", subcategory, filename)
    else:
        data_path = os.path.join("data", filename)

    return os.path.join(get_project_dir(), data_path)


def get_data_dir(subcategory=None):
    if subcategory:
        data_dir = os.path.join("data", subcategory)
    else:
        data_dir = os.path.join("data")

    return os.path.join(get_project_dir(), data_dir)


def iter_buffer_dirs(buffers_dir=None):
    buffers_dir = buffers_dir or BUFFERS_DIR
    return iter_subdirectories(os.path.join(get_project_dir(), buffers_dir))


def iter_subdirectories(directory):
    return (os.path.join(get_project_dir(), directory, subdirectory)
            for subdirectory in os.listdir(directory)
            if subdirectory[0] != "." and
            os.path.isdir(os.path.join(directory, subdirectory)))


def get_division_dir(division, divisions_dir=None):
    divisions_dir = divisions_dir or DIVISIONS_DIR
    division_dir = os.path.join(divisions_dir, division)
    return os.path.join(get_project_dir(), division_dir)


def get_division_path(division):
    return find_shp_path(get_division_dir(division))


def get_area_level_shp_path(area_level):
    return get_division_path(AREA_LEVEL_SHP_NAME[area_level])


def get_indicators_path(area_level, format_file=".csv"):
    indicators_path = os.path.join(
        "indicadores", "indicadores_" + area_level + format_file)
    return os.path.join(get_project_dir(), indicators_path)


def get_weights_path(buffer_dir, division_name, weights_dir=None):
    """Create weights json file path."""
    weights_dir = weights_dir or WEIGHTS_DIR
    filename = "".join([os.path.basename(buffer_dir), "-",
                        division_name, ".json"])

    weights_path = os.path.join(weights_dir, filename)
    return os.path.join(get_project_dir(), weights_path)


def iter_weights_paths(weights_dir=None):
    weights_dir = os.path.join(get_project_dir(), weights_dir or WEIGHTS_DIR)
    for filename in os.listdir(weights_dir):
        if filename[0] != ".":
            yield os.path.join(weights_dir, filename)


def find_shp_path(directory):
    """Find the folder where the shape files are, from a base dir."""

    shp_dir = os.path.join(get_project_dir(), directory)

    while os.path.isdir(shp_dir):
        shp_dirs = [shp for shp in os.listdir(shp_dir) if
                    os.path.isdir(shp) and shp[0] != "."]
        if len(shp_dirs) > 1:
            raise Exception("There is more than one folder in the shp dir.")

        elif len(shp_dirs) == 1:
            shp_dir = os.path.join(shp_dir, shp_dirs[0])

        else:
            shapefile_name = [shp for shp in os.listdir(shp_dir)
                              if shp[0] != "."][0].split(".")[0]
            shp_dir = os.path.join(shp_dir, shapefile_name)

    return shp_dir


def get_project_dir(project_name="tod", inside_path=__file__):
    """Get the directory of a package given an inside path.

    Recursively get parent directories until project_name is reached.

    Args:
        project_name: Name of the package to retrieve directory.
        inside_path: A path inside the package.
    """
    if os.path.basename(os.getcwd()) == project_name:
        return os.getcwd()

    # go up in the tree folder looking for the root directory of the package
    elif os.path.isabs(inside_path):
        if os.path.basename(os.path.split(inside_path)[0]) == project_name:
            return os.path.split(inside_path)[0]

        else:
            return get_project_dir(project_name, os.path.split(inside_path)[0])

    # look at the enviormental variables for the package path
    else:
        for path in sys.path:
            if os.path.basename(path) == project_name:
                return path

        raise Exception(project_name + " dir couldn't be found.")

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
data_loaders.py

Helper methods to load data files used in the project.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import pandas as pd
import json
from simpledbf import Dbf5

from path_finders import get_weights_path, get_indicators_path
from path_finders import iter_weights_paths, find_shp_path

AREA_LEVEL_NAMES = {"FRAC": "fracciones", "RADIO": "radios"}


def get_indicators(area_level):
    return pd.read_csv(get_indicators_path(area_level), encoding="utf-8")


def get_weights(buffer_dir, area_level):
    with open(get_weights_path(buffer_dir,
                               AREA_LEVEL_NAMES[area_level]), "rb") as f:
        return json.load(f)


def iterate_weights():
    for weight_path in iter_weights_paths():
        with open(weight_path, "rb") as f:
            yield os.path.basename(weight_path), json.load(f)


def read_dbf(shp_dir_or_dbf_path):
    if os.path.isdir(shp_dir_or_dbf_path):
        dbf_path = find_shp_path(shp_dir_or_dbf_path) + ".dbf"
    else:
        dbf_path = shp_dir_or_dbf_path
    dbf = Dbf5(dbf_path)
    return dbf.to_dataframe()

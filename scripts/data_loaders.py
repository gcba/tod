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

from path_finders import get_weights_path, get_indicators_path

AREA_LEVEL_NAMES = {"FRAC": "fracciones", "RADIO": "radios"}


def get_indicators(area_level):
    return pd.read_csv(get_indicators_path(area_level), encoding="utf-8")


def get_weights(buffer_dir, area_level):
    with open(get_weights_path(buffer_dir,
                               AREA_LEVEL_NAMES[area_level]), "rb") as f:
        return json.load(f)

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
shapefile_importer.py

Import shapefiles into PostGIS database.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import subprocess


def shp_to_postgis(shp_path):
    cmds = 'shp2pgsql "' + shp_path + '" new_shp_table | psql '
    subprocess.call(cmds, shell=True)

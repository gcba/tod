#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_path_finders

Tests for `path_finders` module.
"""

from __future__ import unicode_literals
import unittest
import nose
import os

import path_finders as pf


class PathFindersTestCase(unittest.TestCase):

    def test_find_shp_path(self):

        directory = "shp/transporte/subte-estaciones"
        shp_path = pf.find_shp_path(directory)
        exp_shp_path = os.path.join(
            pf.get_project_dir(),
            "shp/transporte/subte-estaciones/estaciones_de_subte")

        self.assertEqual(shp_path, exp_shp_path)

    def test_get_indicators_path(self):
        shp_name = "estaciones"
        subcategory = "buffers"
        exp_path = os.path.join(pf.get_project_dir(),
                                "indicadores/buffers/estaciones/estaciones")
        path = pf.get_indicators_shp_path(shp_name, subcategory)
        self.assertEqual(path, exp_path)

    def test_get(self):
        path = pf.get("shp/transporte")
        exp_path = os.path.join(pf.get_project_dir(), "shp/transporte")
        self.assertEqual(path, exp_path)

        path = pf.get("/Users/abenassi/github/tod/shp/transporte")
        exp_path = "/Users/abenassi/github/tod/shp/transporte"
        self.assertEqual(path, exp_path)

    def test_get_shp(self):
        path = pf.get_shp("subte-estaciones")
        exp_path = pf.get(
            "shp/transporte/subte-estaciones/estaciones_de_subte")
        self.assertEqual(path, exp_path)

        path = pf.get_shp("estaciones_de_subte")
        exp_path = pf.get(
            "shp/transporte/subte-estaciones/estaciones_de_subte")
        self.assertEqual(path, exp_path)


if __name__ == '__main__':
    nose.run(defaultTest=__name__)

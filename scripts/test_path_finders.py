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

import path_finders
from path_finders import get_project_dir


class PathFindersTestCase(unittest.TestCase):

    def test_find_shp_path(self):

        directory = "shp/transporte/subte-estaciones"
        shp_path = path_finders.find_shp_path(directory)
        exp_shp_path = os.path.join(
            get_project_dir(),
            "shp/transporte/subte-estaciones/estaciones_de_subte")

        self.assertEqual(shp_path, exp_shp_path)


if __name__ == '__main__':
    nose.run(defaultTest=__name__)

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_create_bufferss

Tests for `create_buffers` module.
"""

from __future__ import unicode_literals
import unittest
import nose
import create_buffers


class CreateBufferTestCase(unittest.TestCase):

    # @unittest.skip("skip")
    def test_create_shp_name(self):

        shp_path = "shp/transporte/subte-estaciones/estaciones_de_subte"
        shp_name = create_buffers._create_shp_name(shp_path, 500)
        exp_shp_name = "estaciones_de_subte-buffer500"

        self.assertEqual(shp_name, exp_shp_name)

    # @unittest.skip("skip")
    def test_create_shp_path(self):

        directory = "shp/transporte/subte-estaciones"
        shp_name = "estaciones_de_subte-buffer500"
        buffer_dir = "buffers"
        buffer_shp_path = create_buffers._create_shp_path(directory, shp_name,
                                                          buffer_dir)
        exp = "shp/transporte/buffers/" + \
            "estaciones_de_subte-buffer500/estaciones_de_subte-buffer500"

        self.assertEqual(buffer_shp_path, exp)

if __name__ == '__main__':
    nose.run(defaultTest=__name__)

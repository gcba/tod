#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_geo_utils

Tests for `geo_utils` module.
"""

from __future__ import unicode_literals
import unittest
import nose

from geo_utils import reproject_point, prj_to_proj4
import path_finders as pf


class GeoUtilsTestCase(unittest.TestCase):

    def test_reproject_point(self):
        shp_path = pf.get_shp("RADIO")
        lat, lon = -34.567277, -58.440509
        point = reproject_point(lat, lon, shp_path)
        reproj_coords = list(point.coords)[0]
        exp_reproj_coords = (1476458.5151069912, -2797102.116439601)

        self.assertAlmostEqual(reproj_coords[0], exp_reproj_coords[0])
        self.assertAlmostEqual(reproj_coords[1], exp_reproj_coords[1])

    @unittest.skip("skip")
    def test_prj_to_proj4(self):
        shp_path = pf.get_shp("RADIO")
        crs = prj_to_proj4(shp_path)
        exp_crs = '+proj=tmerc +ellps=intl +a=6378388.0 +f=297.0 +pm=0.0  +x_0=100000.0 +y_0=100000.0 +lon_0=-58.4627 +lat_0=-34.6297166 +units=m +to_meter=1.0 +axis=enu +no_defs'

        self.assertEqual(crs.to_proj4(), exp_crs)


if __name__ == '__main__':
    nose.run(defaultTest=__name__)

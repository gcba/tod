#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_calculate_weights

Tests for `calculate_weights` module.
"""

from __future__ import unicode_literals
import unittest
import nose

from data_loaders import iterate_weights


class RecalculateIndicatorsTestCase(unittest.TestCase):

    def test_results_consistency(self):

        for weights_path, weights in iterate_weights():
            if "fracciones.json" not in weights_path:
                for buffer_id, buffer_values in weights.iteritems():
                    total = sum([i["buffer"] for i in buffer_values.values()])

                    print total, buffer_id, weights_path
                    self.assertGreater(total, 0.999)
                    self.assertLessEqual(total, 1.001)

if __name__ == '__main__':
    nose.run(defaultTest=__name__)

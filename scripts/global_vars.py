#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
global_vars.py

Global variables used by all modules.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os


IDS_GCBA = {"FRAC": "CO_FRACC",
            "FRACC": "CO_FRACC",
            "RADIO": "CO_FRAC_RA",
            "DPTO": "COMUNAS"}

AREA_LEVEL_SHP_NAME = {
    "RADIO": "radios_censo_2010",
    "BARRIO": "barrios_censo_2010",
    "DPTO": "comunas_caba_censo_2010",
    "COMUNA": "comunas_caba_censo_2010",
    "FRACC": "fracciones_caba_censo_2010",
    "FRAC": "fracciones_caba_censo_2010"
}

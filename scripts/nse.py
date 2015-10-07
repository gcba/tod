#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
nse.py

Methods for socioeconomic level calculations.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import numpy as np


class NSE():

    def __init__(self, indicators):
        self.i = indicators

    def c1(self, con_satisf):
        return 1 if 1 - con_satisf <= self.i["con_satisf"][0] else 2

    def c2(self, c1, jefes_univ, pers_domestico, asist_secundario):
        if c1 == 1:
            if (jefes_univ > self.i["jefes_univ"][0] and
                    pers_domestico > self.i["pers_domestico"][0]):
                return 1

            elif (jefes_univ <= self.i["jefes_univ"][0] or
                  pers_domestico <= self.i["pers_domestico"][0]):
                return 2

            else: raise Exception("This case should not exist.")

        elif c1 == 2:
            if asist_secundario >= self.i["asist_secundario"][0]: return 3
            else: return 4

        else: raise Exception("This case should not exist.")

    def c3(self, c2, piso, joven_compu):
        if c2 == 2:
            if (piso < self.i["piso_c3"][0] and
                joven_compu > self.i["joven_compu"][0]): return 1
            elif (piso >= self.i["piso_c3"][0] or
                  joven_compu <= self.i["joven_compu"][0]): return 2
            else: raise Exception("This case should not exist.")

        else: return np.nan

    def c4(self, c3, desague, jefe_secun, piso, joven_compu):
        if c3 == 1:
            if (desague < self.i["desague"][0] and
                jefe_secun > self.i["jefe_secun"][0]): return 1
            elif (desague >= self.i["desague"][0] or
                  jefe_secun <= self.i["jefe_secun"][0]): return 2
            else: raise Exception("This case should not exist.")

        elif c3 == 2:
            if (piso <= self.i["piso_c4"][0] and
                joven_compu > self.i["joven_compu"][0]): return 3
            elif (piso > self.i["piso_c4"][0] or
                  joven_compu <= self.i["joven_compu"][0]): return 4
            else: raise Exception("This case should not exist.")

        else: return np.nan

    @staticmethod
    def _calc(c1, c2, c3, c4):
        crits = repr((c1, c2, c3, c4))

        # INI Criterio 1 --->
        if c1 == 1:

            # INI Criterio 2 --->
            if c2 == 1: return 1
            elif c2 == 2:

                # INI Criterio 3 --->
                if c3 == 1:
                    # INI Criterio 4 --->
                    if c4 == 1: return 2
                    elif c4 == 2: return 3
                    else: raise Exception("This case should not exist: " +
                                          crits)
                    # <--- FIN Criterio 4

                elif c3 == 2:
                    # INI Criterio 4 --->
                    if c4 == 3: return 4
                    elif c4 == 4: return 5
                    else: raise Exception("This case should not exist: " +
                                          crits)
                    # <--- FIN Criterio 4

                else: raise Exception("This case should not exist: " + crits)
                # <--- FIN Criterio 3
            else: raise Exception("This case should not exist: " + crits)
            # <--- FIN Criterio 2

        elif c1 == 2:
            # INI Criterio 2 --->
            if c2 == 3: return 6
            elif c2 == 4: return 7
            else: raise Exception("This case should not exist: " + crits)
            # <--- FIN Criterio 2

        else: raise Exception("This case should not exist: " + crits)
        # <--- FIN Criterio 1

    def calc(self, df):
        """Calculate socioeconomic level."""

        df["c1"] = map(self.c1, self.i["con_satisf"][1])
        df["c2"] = map(self.c2, df["c1"], self.i["jefes_univ"][1],
                       self.i["pers_domestico"][1],
                       self.i["asist_secundario"][1])
        df["c3"] = map(self.c3, df["c2"], self.i["piso_c3"][1],
                       self.i["joven_compu"][1])
        df["c4"] = map(self.c4, df["c3"], self.i["desague"][1],
                       self.i["jefe_secun"][1], self.i["piso_c4"][1],
                       self.i["joven_compu"][1])

        df["nse_alt"] = map(
            self._calc, df["c1"], df["c2"], df["c3"], df["c4"])

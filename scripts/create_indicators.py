#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
create_indicators.py

Create indicators at the level of census divisions.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os

from path_finders import get_data_path
import pandas as pd


def get_data(area_level, variable, redownload=False):
    path = get_data_path(area_level, variable)

    if not os.path.isfile(path) or redownload:
        query = pyredatam.arealist_query(area_level, variable,
                                         {"PROV": "02"})
        df = cpv2010arg.make_arealist_query(query)
        df.to_csv(path, encoding="utf-8")

    else:
        df = pd.read_csv(path, encoding="utf-8")

    return df


def replace_index(df, id_len=7):
    """Create GCBA shp ids and replace index with Census ids."""
    df["Código"] = df["Código"].astype(str)
    df["Código"] = df["Código"].str.zfill(id_len)

    if id_len == 7:
        df["CO_FRACC"] = df["Código"].str[2:5] + \
            "_" + \
            df["Código"].str[5:7].map(lambda x: x.lstrip("0"))
    elif id_len == 9:
        df["CO_FRAC_RA"] = df["Código"].str[2:5].map(lambda x: x.lstrip("0")) + \
            "_" + df["Código"].str[5:7].map(lambda x: x.lstrip("0")) + \
            "_" + \
            df["Código"].str[7:9].map(lambda x: x.lstrip("0"))

    return df.set_index(df["Código"]).drop("Código", 1)


def main():
    pass

if __name__ == '__main__':
    main()

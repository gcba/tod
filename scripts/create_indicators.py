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
import pandas as pd
from simpledbf import Dbf5

import pyredatam
from pyredatam import cpv2010arg
from path_finders import get_data_path, get_indicators_path
from path_finders import get_context_shp_path
from global_vars import IDS_GCBA

AREAS_LENIDS = {"PROV": 2, "DPTO": 5, "FRAC": 7, "RADIO": 9}


def get_or_create_indicators_df(area_level, df_example=None):
    df = get_indicators_df(area_level, AREAS_LENIDS[area_level])
    if df is not None:
        return df
    else:
        if df_example is None:
            raise Exception("Can't create a df without an example with index.")
        df = pd.DataFrame(data={"Código": df_example.index})
        return replace_index(df, AREAS_LENIDS[area_level])


def get_indicators_df(area_level, id_len=7):
    path = get_indicators_path(area_level)

    if not os.path.isfile(path):
        return None
    else:
        df = pd.read_csv(path, encoding="utf-8")
        df = replace_index(df, id_len)
        return df


def get_data_from_query(area_level, query, redownload=False):
    path = get_data_path(area_level, "query", "censo", unicode(hash(query)))

    if not os.path.isfile(path) or redownload:
        html = pyredatam.cpv2010arg.make_query(query)

        df = pd.read_html(html, header=1, thousands=".")[0].dropna()
        if "Código" in df.columns:
            df = replace_index(df, AREAS_LENIDS[area_level])

        df.to_csv(path, encoding="utf-8")

    else:
        df = pd.read_csv(path, encoding="utf-8")
        if "Código" in df.columns:
            df = replace_index(df, AREAS_LENIDS[area_level])

    return df


def get_data(area_level, variable, universe_filter=None, redownload=False):
    path = get_data_path(area_level, variable, "censo", universe_filter)

    if not os.path.isfile(path) or redownload:
        query = pyredatam.arealist_query(area_level, variable,
                                         {"PROV": "02"},
                                         universe_filter=universe_filter)

        df = cpv2010arg.make_arealist_query(query)
        if "Código" in df.columns:
            df = replace_index(df, AREAS_LENIDS[area_level])

        df.to_csv(path, encoding="utf-8")

    else:
        df = pd.read_csv(path, encoding="utf-8")
        if "Código" in df.columns:
            df = replace_index(df, AREAS_LENIDS[area_level])

    return df


def replace_index(df, id_len=7):
    """Create GCBA shp ids and replace index with Census ids."""
    code_kw = df.columns[0]
    df[code_kw] = df[code_kw].astype(int)
    df[code_kw] = df[code_kw].astype(str)
    df[code_kw] = df[code_kw].str.zfill(id_len)

    def _strip_0(x):
        return x.lstrip("0")

    if id_len == 9 and "CO_FRAC_RA" not in df.columns:
        df["CO_FRAC_RA"] = df[code_kw].str[2:5].map(_strip_0) + \
            "_" + df[code_kw].str[5:7].map(_strip_0) + \
            "_" + \
            df[code_kw].str[7:9].map(_strip_0)

    elif id_len == 7 and "CO_FRACC" not in df.columns:
        df["CO_FRACC"] = df[code_kw].str[2:5] + \
            "_" + \
            df[code_kw].str[5:7].map(_strip_0)

    elif id_len == 5 and "COMUNAS" not in df.columns:
        df["COMUNAS"] = df[code_kw].str[-3:].map(_strip_0)

    return df.set_index(df[code_kw]).drop(code_kw, 1)


def add_indicator(area_level, indic_name, indicator):
    indicators = get_or_create_indicators_df(area_level)
    if type(indicator) == pd.core.series.Series:
        indicators[indic_name] = indicator
    elif type(indicator) == dict:
        indicators[indic_name] = indicators[
            IDS_GCBA[area_level]].map(indicator)
    else:
        raise Exception("Indicator must be dict or ")
    indicators.to_csv(get_indicators_path(area_level), encoding="utf-8")

    return indicators


def add_dbf_indicator_by_id(area_level, context_shp_name, context_id_field,
                            context_indic_field):
    indicators = get_or_create_indicators_df(area_level)
    indicators.drop(context_indic_field, 1, inplace=True)

    dbf = Dbf5(get_context_shp_path(context_shp_name) + ".dbf")
    context_df = dbf.to_dataframe()
    context_df.drop_duplicates(context_id_field, inplace=True)
    context_df.set_index(context_id_field, inplace=True)

    indicators = indicators.join(context_df[context_indic_field])
    indicators.to_csv(get_indicators_path(area_level), encoding="utf-8")

    return indicators

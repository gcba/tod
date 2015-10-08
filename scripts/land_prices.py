#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
land_prices.py

Aggregate data of land prices to create average indicators on the "FRAC" level.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import pandas as pd
from shapely.geometry import Point
from shapely.ops import transform
import shapefile
from functools import partial
import pyproj
import pycrs
import numpy as np

from path_finders import get_division_path
import geo_utils
from calculate_weights import find_intersections, create_spatial_index
from scripts.path_finders import get_division_path, get_data_dir


def read_dataset(year):
    file_name = os.path.join(
        "data", "terrenos", "precio-terrenos-{}.csv".format(year))
    return pd.read_csv(file_name, sep=";", encoding="utf-8")


def create_unique_dataset(years):
    """Append datasets of selected years together."""

    total_df = pd.DataFrame()

    replacements = {
        "BARRIOS": "BARRIO",
        "X": "LON",
        "Y": "LAT",
        "LONGITUD": "LON",
        "LATITUD": "LAT"
    }

    for year in years:
        try:
            df = read_dataset(year)
            df["YEAR"] = year
            df.columns = df.columns.str.upper()
            df.rename(columns=replacements, inplace=True)
            total_df = total_df.append(df, ignore_index=True)
        except:
            pass

    return total_df


def remove_duplicates(df, fields=None):
    """Remove duplicates keeping the closest ones in time."""
    fields = fields or ["BARRIO", "CALLE", "NUMERO", "M2"]
    return df.sort("YEAR", ascending=False).drop_duplicates(fields)


def keep_useful_columns(df, useful_cols=None):
    """Keep only some fields of the dataset."""
    useful_cols = useful_cols or ["BARRIO", "CALLE", "COMUNA", "DOLARES",
                                  "YEAR", "FECHA", "LAT", "LON", "M2",
                                  "NUMERO", "U_S_M2"]
    return df[useful_cols]


def reproject_point(lat, lon, shp_path):
    point_wgs84 = Point(lat, lon)

    fromcrs = pycrs.loader.from_file(os.path.join("shp", "4326.prj"))
    fromcrs_proj4 = fromcrs.to_proj4()

    tocrs = pycrs.loader.from_file(shp_path + ".prj")
    tocrs_proj4 = tocrs.to_proj4()

    # print(fromcrs_proj4)
    project = partial(
        pyproj.transform,
        pyproj.Proj(fromcrs_proj4),
        pyproj.Proj(tocrs_proj4))

    return transform(project, point_wgs84)


def find_id_intersecting_shape(lat, lon, shapes, shp_idx, shp_path):
    """Return id of shape containing the lat-lon point."""
    point = reproject_point(lon, lat, shp_path)

    # for id_shp, shp in find_intersections(point.buffer(0.1), shapes,
    # shp_idx):
    for id_shp, shp in shapes:
        if shp.contains(point):
            # print(lat, lon, "is", id_shp)
            return id_shp

    return None


def intersect_data_with_shps(df, shp_path, lat_field="LAT", lon_field="LON"):
    """Asign an id from shp_path based on lat-lon intersection."""
    sf = shapefile.Reader(shp_path)
    id_field_name = sf.fields[1][0]

    # def wrapper(fn, shapes, shp_idx, shp_path):
    #     @wraps(fn)
    #     def inner(*args, **kwargs):
    #         kwargs["shapes"] = shapes
    #         kwargs["shp_idx"] = shp_idx
    #         kwargs["shp_path"] = shp_path
    #         fn(*args, **kwargs)
    #     return inner

    shapes = list(geo_utils.iter_shp_as_shapely(shp_path))
    shp_idx = create_spatial_index(shapes)

    # func_get_id = wrapper(
    #     find_id_intersecting_shape, shapes, shp_idx, shp_path)
    # df[id_field_name] = map(func_get_id, df[lat_field], df[lon_field])

    def func(x):
        return find_id_intersecting_shape(x["LAT"], x["LON"],
                                          shapes, shp_idx, shp_path)
    df[id_field_name] = df.apply(func, axis=1)

    return df


def create_clean_dataset(years, replacements=None):
    """Create an appended dataset of terrain prices without duplicates and
    uneuseful cols."""
    df = create_unique_dataset(years)
    df = remove_duplicates(df)
    df = keep_useful_columns(df)
    # df = intersect_data_with_shps(df, get_division_path("radios_censo_2010"))
    # df = intersect_data_with_shps(
    # df, get_division_path("fracciones_caba_censo_2010"))

    if replacements:
        for correct_name in replacements:
            df = df.replace(replacements[correct_name], correct_name)

    return df


def remove_scarce_data(pivot_tbl, df_data, div_name, count_min=3):
    print(div_name, "start with ", pivot_tbl.count().sum(), "values")
    group = df_data.groupby([div_name, "YEAR"])[div_name]
    group_count = group.count()

    for row in pivot_tbl.iterrows():
        div = row[0]
        for year in pivot_tbl.columns:
            index = (div, year)
            if index in group_count.index:
                count = group_count.ix[index]
                if count < count_min:
                    pivot_tbl.loc[div, year] = np.nan
            else:
                pivot_tbl.loc[div, year] = np.nan

    print(div_name, "end with", pivot_tbl.count().sum(), "values", "\n")


def get_data(years=range(2001, 2015), replacements={}, recalculate=False):
    path = os.path.join(get_data_dir("terrenos"), "terrenos_completo.csv")

    if not os.path.isfile(path) or recalculate:
        df = create_clean_dataset(years, replacements)
        intersect_data_with_shps(
            df, get_division_path("fracciones_caba_censo_2010"))
        intersect_data_with_shps(df, get_division_path("radios_censo_2010"))

        df.to_csv(path, encoding="utf-8")
        return df

    else:
        df = pd.read_csv(path, encoding="utf-8")
        return df.drop("Unnamed: 0", 1)

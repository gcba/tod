#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
utils.py

Helper methods.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import with_statement
import os
import contextlib
import shutil
import sys


@contextlib.contextmanager
def cd(path):
    print('initially inside {0}'.format(os.getcwd()))
    CWD = os.getcwd()

    os.chdir(path)
    print('inside {0}'.format(os.getcwd()))
    try:
        yield
    except:
        print('Exception caught: ', sys.exc_info()[0])
    finally:
        print('finally inside {0}'.format(os.getcwd()))
        os.chdir(CWD)


def copy_prj(shp_path, buffer_shp_path):
    if shp_path[-4:] != ".prj":
        src = shp_path + ".prj"
    else:
        src = shp_path

    if buffer_shp_path[-4:] != ".prj":
        dst = buffer_shp_path + ".prj"
    else:
        dst = buffer_shp_path

    if not os.path.isdir(os.path.dirname(dst)):
        os.makedirs(os.path.dirname(dst))
    shutil.copy(src, dst)

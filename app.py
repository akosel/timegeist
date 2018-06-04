#----------------------------------------------------------------------------#
# Imports
#----------------------------------------------------------------------------#

from flask import Flask, render_template, request
import logging
from logging import Formatter, FileHandler
import json
import os
import random

#----------------------------------------------------------------------------#
# App Config.
#----------------------------------------------------------------------------#

app = Flask(__name__)


#----------------------------------------------------------------------------#
# Controllers.
#----------------------------------------------------------------------------#

START_YEAR = 1900
END_YEAR   = 2015

songs = []
with open('static/data/songs/songs.json') as f:
    songs = json.loads(f.read())

@app.route('/')
def home():
    return render_template('pages/home.html')

@app.route('/api/v1.0/songs/<year>')
def get_year_songs(year):
    if songs:
        return json.dumps([song for song in songs if song.get('year') == int(year)])
    return json.dumps({ 'status': 'empty' })

if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')

#----------------------------------------------------------------------------#
# Launch.
#----------------------------------------------------------------------------#

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

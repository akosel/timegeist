#----------------------------------------------------------------------------#
# Imports
#----------------------------------------------------------------------------#

from flask import Flask, render_template, request
# from flask.ext.sqlalchemy import SQLAlchemy
import logging
from logging import Formatter, FileHandler
import json
import os
import random
import redis

#----------------------------------------------------------------------------#
# App Config.
#----------------------------------------------------------------------------#

app = Flask(__name__)
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
try:
    r = redis.from_url(redis_url)
    r.ping()
    print 'Connected to redis'
except redis.ConnectionError as e:
    print 'ERROR', e
    r = None 


#db = SQLAlchemy(app)

# Automatically tear down SQLAlchemy.
'''
@app.teardown_request
def shutdown_session(exception=None):
    db_session.remove()
'''

# Login required decorator.
'''
def login_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return test(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('login'))
    return wrap
'''
#----------------------------------------------------------------------------#
# Controllers.
#----------------------------------------------------------------------------#

START_YEAR = 1900
END_YEAR   = 2015

@app.route('/')
def home():
    return render_template('pages/home.html')

@app.route('/api/v1.0/events')
def get_all_events():
    if not r:
        return json.dumps({})

    # Check random year, and reload if empty
    if not r.get('events.1947'):
        print 'Cache miss. Reloading events'
        for year in xrange(START_YEAR, END_YEAR):
            with open('static/data/tidbits/tidbits_{0}.json'.format(year)) as f:
                r.set('events.{0}'.format(year), f.read())

    pipe = r.pipeline(transaction=False)
    for year in xrange(START_YEAR, END_YEAR):
        key = 'events.{0}'.format(year)
        pipe.get(key)

    all_years = {} 
    years = pipe.execute()
    for idx, year in enumerate(years):
        all_years[START_YEAR + idx] = json.loads(year)

    return json.dumps(all_years)

@app.route('/api/v1.0/eventsno')
def get_all_eventsno():
    all_years = {} 
    for year in xrange(START_YEAR, END_YEAR):
        path = 'static/data/tidbits/tidbits_{0}.json'.format(year)
        with open(path, 'r') as f:
            all_years[year] =  json.loads(f.read()) 

    return json.dumps(all_years)

@app.route('/api/v1.0/events/<year>')
def get_year_events(year):
    path = 'static/data/tidbits/tidbits_{0}.json'.format(year)
    key  = 'events.{0}'.format(year)
    if r and r.get(key):
        return r.get(key) 
    elif os.path.isfile(path):
        with open(path, 'r') as f:
            return f.read() 
    return json.dumps({ 'status': 'empty' })

@app.route('/api/v1.0/songs')
def get_all_songs():
    if not r:
        return json.dumps({})

    # Check random year, and reload if empty
    if not r.get('songs.1947'):
        print 'Cache miss. Reloading songs'
        for year in xrange(START_YEAR, END_YEAR):
            with open('static/data/songs/charts_{0}.json'.format(year)) as f:
                r.set('songs.{0}'.format(year), f.read())

    pipe = r.pipeline(transaction=False)
    for year in xrange(START_YEAR, END_YEAR):
        key = 'songs.{0}'.format(year)
        pipe.get(key)

    all_years = {} 
    years = pipe.execute()
    for idx, year in enumerate(years):
        all_years[START_YEAR + idx] = json.loads(year)

    return json.dumps(all_years)

@app.route('/api/v1.0/songsno')
def get_all_songsno():
    all_years = {} 
    for year in xrange(START_YEAR, END_YEAR):
        path = 'static/data/songs/charts_{0}.json'.format(year)
        with open(path, 'r') as f:
            all_years[year] =  json.loads(f.read()) 

    return json.dumps(all_years)

@app.route('/api/v1.0/songs/<year>')
def get_year_songs(year):
    path = 'static/data/songs/charts_{0}.json'.format(year)
    key  = 'songs.{0}'.format(year)
    if r and r.get(key):
        print key
        return r.get(key) 
    elif os.path.isfile(path):
        with open(path, 'r') as f:
            return f.read() 
    return json.dumps({ 'status': 'empty' })


# Error handlers.


#@app.errorhandler(500)
#def internal_error(error):
#    #db_session.rollback()
#    return {}#render_template('errors/500.html'), 500
#
#
#@app.errorhandler(404)
#def not_found_error(error):
#    return {}#render_template('errors/404.html'), 404

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

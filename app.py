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

#----------------------------------------------------------------------------#
# App Config.
#----------------------------------------------------------------------------#

app = Flask(__name__)
app.config.from_object('config')
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


@app.route('/')
def home():
    return render_template('pages/home.html')

@app.route('/api/v1.0/events/<year>')
def get_year_events(year):
    # TODO break this up by year, or even better, use an actual database. Or redis!
    path = 'static/data/tidbits/tidbits_{0}.json'.format(year)
    if os.path.isfile(path):
        with open(path, 'r') as f:
            year_data = json.load(f)
            year_data = [x for x in year_data if len(x[1]) > 100]
            return json.dumps(year_data)
    else:
        return json.dumps({ 'status': 'empty' })

@app.route('/api/v1.0/songs/<year>')
def get_year_songs(year):
    # TODO get hits by year
    path = 'static/data/songs/charts_{0}.json'.format(year)
    if os.path.isfile(path):
        with open(path, 'r') as f:
            all_data = json.load(f)
            random.shuffle(all_data)
            return json.dumps(all_data[:30])
    else:
        return json.dumps({ 'status': 'empty' })


# Error handlers.


@app.errorhandler(500)
def internal_error(error):
    #db_session.rollback()
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

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

# Default port:
if __name__ == '__main__':
    app.run(debug=True)

# Or specify port manually:
'''
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
'''

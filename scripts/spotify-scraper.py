import argparse
import base64
import json
import re
import requests
import os
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

def authorize(credentials):
    headers = {
        'Authorization': 'Basic {}'.format(credentials)
    }
    data = {
        'grant_type': 'client_credentials'
    }
    req = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)
    return req.json()


def get_url(ts):
    return 'http://www.umdmusic.com/default.asp?Lang=English&Chart=D&ChDate={}'.format(ts)

def monthdelta(date, delta):
    m, y = (date.month+delta) % 12, date.year + ((date.month)+delta-1) // 12
    if not m: m = 12
    d = min(date.day, [31,
        29 if y%4==0 and not y%400==0 else 28,31,30,31,30,31,31,30,31,30,31][m-1])
    return date.replace(day=d,month=m, year=y)

def get_formatted_string(dt):
    return datetime.strftime(dt, '%Y%m%d')

def parse_date(ts):
    return datetime.strptime(ts, '%Y-%m-%d')

def fetch(url, *args, **kwargs):
    return requests.get(url, *args, **kwargs)

def fetch_track(artist, track, retries=3):
    SLEEP_SECONDS = 60
    if retries <= 0:
        raise Exception('Retries exceeded. Abandoning request.')
    global credentials
    url = 'https://api.spotify.com/v1/search?q=artist:{}+track:{}&type=track'.format(artist, track)
    headers = {
        'Authorization': '{token_type} {access_token}'.format(**credentials)
    }
    try:
        res = fetch(url, headers=headers)
    except requests.exceptions.RequestException as e:
        print(e)
        return fetch_track(artist, track, retries=retries - 1)

    if res.status_code == 401:
        print('unauthorized...')
        credentials = authorize(get_token())
        return fetch_track(artist, track, retries=retries - 1)
    elif res.status_code == 429:
        print('rate limited...sleeping for {} seconds'.format(SLEEP_SECONDS))
        time.sleep(SLEEP_SECONDS)
        return fetch_track(artist, track, retries=retries - 1)

    return res

def find_matching_track(results, name, artist):
    items = results.get('tracks', {}).get('items', [])
    for item in items:
        if item['name'].lower() == name.lower():
            return item
    return None

def get_token():
    CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID') # get from spotify
    CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET') # get from spotify

    s = '{}:{}'.format(CLIENT_ID, CLIENT_SECRET)
    token = base64.b64encode(bytes(s, 'utf-8'))
    return token.decode()

def get_key(name, artist, entry_date):
    return '{}-{}-{}'.format(name, artist, entry_date.isoformat())

def my_join(l):
    x = len(l)
    if x > 2:
        s = ', & '.join([', '.join(l[:-1]), l[-1]])
    elif x == 2:
        s = ' & '.join(l)
    elif x == 1:
        s = l[0]
    else:
        s = ''
    return s

def extract_row_metadata(tr, year, already_matched):
    SONG_NAME_AND_ARTIST_IDX = 4
    SONG_ENTRY_DATE = 5

    tds = tr.findAll('td')
    raw_name_and_artist = tds[SONG_NAME_AND_ARTIST_IDX].text.lower().strip()
    breaks = re.sub(r'\s\s+', '::', raw_name_and_artist, re.UNICODE)
    print(breaks)
    name, artist = breaks.split('::')
    print(name, artist)
    raw_entry_date = tds[SONG_ENTRY_DATE].text.strip()
    entry_date = parse_date(raw_entry_date)
    key = get_key(name, artist, entry_date)
    if key not in already_matched:
        try:
            res = fetch_track(artist, name, retries=3)
            match = find_matching_track(res.json(), name, artist)

            if match:
                artists = match.get('artists', [])
                artist_names = [artist['name'] for artist in artists]
                new_track = {
                    'year': year,
                    'name': match.get('name'),
                    'url': match.get('preview_url'),
                    'artist': my_join(artist_names),
                    'artists': artists,
                }
                print(new_track)
                already_matched.add(key)
                return new_track
        except Exception as e:
            print(e)
            print('Unable to process for track', artist, name)
    else:
        print('already matched', artist, name)
    return None

def extract_new_rows_metadata(trs, year, already_matched):
    rows = []

    for tr in trs:
        try:
            row = extract_row_metadata(tr, year, already_matched)
        except Exception as e:
            print(e)
            print('unable to process row')
        if row:
            rows.append(row)

    return rows

def valid_date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except ValueError:
        msg = "Not a valid date: '{0}'.".format(s)
        raise argparse.ArgumentTypeError(msg)

def load_existing_songs():
    SONGS_PATH = './static/data/songs/songs.json'
    if os.path.exists(SONGS_PATH):
        with open(SONGS_PATH, 'r') as f:
            return json.loads(f.read())
    return {}

def get_already_seen(songs):
    return set([get_key(song['name'], song['artist'], datetime.now()) for song in songs])

def merge(old_rows, new_rows):
    merged_list = []
    keys = set()

    for row in old_rows + new_rows:
        key = get_key(row['name'], row['artist'], datetime.now())
        if key not in keys:
            merged_list.append(row)

    len(merged_list)

    with open('./static/data/songs/songs.json', 'w') as f:
        f.write(json.dumps(merged_list))

credentials = authorize(get_token())

def main(LB):
    dt = datetime.now()
    rows = []
    existing_songs = load_existing_songs()
    already_matched = get_already_seen(existing_songs)

    while dt > LB:
        ts = datetime.strftime(dt, '%Y%m%d')
        url = get_url(ts)
        print(url)
        req = requests.get(url)
        if req.status_code == 200:
            soup = BeautifulSoup(req.text, 'html5lib')

        table = soup.findAll('table')[-1]
        trs = table.findAll('tr')[2:]

        rows.extend(extract_new_rows_metadata(trs, dt.year, already_matched))
        dt = monthdelta(dt, -1)
        with open('/tmp/songs.json', 'w') as f:
            f.write(json.dumps(rows))

    merge(existing_songs, rows)



if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument("-s",
                        "--startdate",
                        help="The Start Date - format YYYY-MM-DD",
                        required=True,
                        type=valid_date)
    args = parser.parse_args()
    main(args.startdate)

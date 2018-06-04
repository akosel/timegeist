from bs4 import BeautifulSoup
import json
import requests

def fetch(url):
    return requests.get(url)

def fetch_track(artist, track):
    url = 'https://api.spotify.com/v1/search?q=artist:{0}+track:{1}&type=track'.format(artist, track)
    return fetch(url)

#filtered_df.to_json('data/charts.json', orient='records')
for year in xrange(1993, 1995):
    print year

    path = 'data/charts_{0}.json'.format(year)

    with open(path, 'r') as f:
        d = json.load(f)
        for row in d:
            try:
                req = fetch_track(row['artist'], row['track'])
                results = json.load(req)
                if results.get('tracks') and results['tracks'].get('items') and len(results['tracks']['items']):
                    #row['preview_url'] = results['tracks']['items'][0]['preview_url']
                    for item in results['tracks']['items']:
                        if item['name'] == row['name']:
                            row.update(item)
                            break
            except UnicodeEncodeError as e:
                print 'Exception {0}'.format(e)


    with open(path, 'w') as f:
        json.dump(d, f)

import pandas as pd
import numpy as np
import time
import json
import urllib

df = pd.read_csv('data/charts.csv')
sorted_df = df.sort(['year', 'score', 'songyear_pos'], ascending=[1,0,1])
sorted_df[]
for year, grp in sorted_df.groupby('year'):
    grp = grp[grp['type'] == 'song']
    grp[:100].to_json('data/charts_{0}.json'.format(year), orient='records')

#filtered_df.to_json('data/charts.json', orient='records')
for year in xrange(1993, 1995):
    print year

    path = 'data/charts_{0}.json'.format(year)

    with open(path, 'r') as f:
        d = json.load(f)
        for row in d:
            try:
                url = 'https://api.spotify.com/v1/search?q=artist:{0}+track:{1}&type=track'.format(row['artist'], row['name'])
                req = urllib.urlopen(url)
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

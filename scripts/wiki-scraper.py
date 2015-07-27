from bs4 import BeautifulSoup
import datetime
import time
import urlparse
import urllib
import json
import argparse
import dateutil.parser


def get(url):
    response = urllib.urlopen(url)
    data = json.loads(response.read())
    return data

def get_year_info(year):
    query_params = {
            'prop': 'extracts',
            'titles':  year,
            'format': 'json',
            'action': 'query'
          }
    query_string = urllib.urlencode(query_params)
    wiki_url = 'https://en.wikipedia.org/w/api.php?{0}'.format(query_string)
    d = get(wiki_url)
    print 'Retrieved data for {0}'.format(year)
    return d

def get_year_range(start, end):
    big_data = {}
    for year in xrange(start, end):
        tmp = get_year_info(year)
        # XXX Should only be one key. Wiki API does not allow for multiple extracts at one time
        page_ids = tmp['query']['pages'].keys()
        for page_id in page_ids:
            title, extract = str(year), tmp['query']['pages'][page_id]['extract']
            year_data = get_tidbits(title, extract)

        with open('tidbits/tidbits_{0}.json'.format(year), 'wb') as f:
            json.dump(year_data, f)

        big_data[year] = year_data
        time.sleep(4)
    return big_data


def get_tidbits(title, extract):
    soup = BeautifulSoup(extract.strip(), 'html.parser')
    tidbits = []
    for ul in soup.find_all('ul'):
        for li in ul.find_all('li'):
            if li.find('ul'):
                #print li.contents
                try:
                    active_date = li.contents[0].strip()
                except:
                    continue
                for nested_li in li.find_all('li'):
                    nested_li_text = " - ".join([active_date, nested_li.text])
                    try:
                        tidbits.append(text_to_tuple(nested_li_text, title))
                        if len(tidbits) > 1 and dateutil.parser.parse(tidbits[-1][0]) < dateutil.parser.parse(tidbits[-2][0]):
                            print li.text, dateutil.parser.parse(tidbits[-1][0])
                            return tidbits[:-1]
                    except Exception as e:
                        continue
                continue

            try:
                tidbits.append(text_to_tuple(li.text, title))
            except Exception as e:
                continue
            if len(tidbits) > 1 and dateutil.parser.parse(tidbits[-1][0]) < dateutil.parser.parse(tidbits[-2][0]):
                print li.text, dateutil.parser.parse(tidbits[-1][0])
                return tidbits[:-1]
    return tidbits


def text_to_tuple(li_text, year):
    split = li_text.replace(u'\u2013', '-').split(' - ', 1)
    if len(split) != 2:
        raise Exception('Bad text')
    date_string = ' '.join([split[0], year])
    try:
        datetime_obj = datetime.datetime.strptime(date_string,'%B %d %Y')
        return (datetime_obj.isoformat(), split[1])
    except UnicodeEncodeError as e:
        raise Exception('Unicode error. Probably weirdly formatted html.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Dump a JSON file for selected year range.')
    parser.add_argument('--start', type=int, help='start year')
    parser.add_argument('--end', type=int, help='end year')
    parser.add_argument('--verbose', '-v', action='count')
    parser.add_argument('--dry-run', '-N',action='store_true')

    args = parser.parse_args()
    if args.verbose:
        print args
    if args.dry_run:
        print 'Will run on range {0} to {1}'.format(args.start, args.end)
    else:
        get_year_range(args.start, args.end)

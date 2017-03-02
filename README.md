# timegeist

### What is this?

TimeGeist immerses you in the spirit of a year with music, typography, and notable events.

After watching Boyhood, I was impressed with how well that movie managed to represent certain years. TimeGeist is designed to do this for a much wider range of years. You can listen to top songs from a year while reading a steady stream of one- to two-sentence descriptions of important events happening. 

### How was this made?

The core data is derived from the Spotify Web API and the Wikipedia API. Additionally, information about top songs was taken from tsort.info, an impressive source of historical data for music. This is information is occasionally updated with scraping programs I wrote specifically for wrangling the data into an ingestable format (not included in this repository).

Beyond that, on the frontend I was able to try out the [AudioContext Web API](https://www.google.com/search?q=audiocontext&ie=utf-8&oe=utf-8). Much of the code was based off examples from [this article](http://www.html5rocks.com/en/tutorials/webaudio/intro/). This Web API is relatively new, so it does have limited browser support. Even so, I can safely say it works on Firefox 38, Chrome 43, Chrome for iOS, and Safari for iOS (the iOS support requires a tiny hack, but it does work). Everything else is vanilla Javascript. I actually like jQuery quite a bit and think it looks nicer than vanilla  JS, but I think it would be overkill for this project. I considered including a framework like React, but again, it seemed like overkill to load a whole JS library for a relatively simple view. One thing I would like to use is a simple publish/subscribe pattern for driving the interface. While I think "callback hell" would be a bit dramatic here, the coupling between the buffer, the Playlist load function, and the main UI components (the track information, mainly) is limiting. If more components were added, this would become harder to maintain. Thus, a pub/sub system would allow for components to listen intently for the playlist to send them a message, without requiring that each component have logic within the playlist load function. 

On the backend, this uses Flask. There isn't a lot going on here. I made a basic (GET only) REST API for accessing songs and events. I would like to incorporate an actual database for loading data (I just use JSON for now). Also, playing with Redis is a goal of mine, so I might see if that makes sense here too. At this point, I believe all of the data used could be stored in memory, which would speed up the page's responsiveness.

### TODO
* Faster initial song loading (i.e. load the first song, AND THEN load the remaining songs from that year).
* Use a real database (currently, the API loads JSON files saved on disk).
* Incorporate images into the notable events stream

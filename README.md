# Podcast Feed Scraper

This is some (fairly trivial) JavaScript code I wrote to fetch the
rss feed for a podcast and download all of the episodes. I intend to
use this to archive podcasts I like that are in danger of going away
or being overrun with ads.

## Setup

   * `npm init`
   * find the url of a podcast feed
   * `fetchAndParseRssFeedToJson.js > feed.json`
   * `downloadEpisodes.js feed.json`
 
This will download the podcast feed and convert it to JSON, saving it in a file called feed.json, then loop over each episode entry and downloadit to a default directory called downloads.

## Notes

My favorite podcast is the Last Podcast on the Left. Its rss feed lives
at http://lpotl.libsyn.com/rss


 

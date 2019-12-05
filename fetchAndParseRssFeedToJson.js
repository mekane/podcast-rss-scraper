#! /usr/bin/node

const fetch = require('node-fetch');
const parser = require('fast-xml-parser');

const userArgs = process.argv.slice(2);

let rssUrl = '';
if (userArgs.length) {
  rssUrl = userArgs[0];
}
else {
  console.log(`Usage: ${process.argv[1]} <feed url>`);
  process.exit(0);
}

const options = {
  ignoreAttributes : false,
  attributeNamePrefix : ""
};


fetch(rssUrl)
    .then(res => res.text())
    .then(xml => parser.parse(xml, options))
    .then(json => processRss(json));


function processRss(json) {
    const episodes = json.rss.channel.item;

    //console.log(`Found ${episodes.length} episodes`);
    //console.log(episodes[0])

    console.log(JSON.stringify(episodes))
}

#! /usr/bin/node

const fs = require('fs');
const request = require('request');

const downloadDir = 'downloads/';
if (!fs.existsSync(downloadDir)){
    fs.mkdirSync(downloadDir);
}

const userArgs = process.argv.slice(2);

let jsonFile = './episodes.json'; 
if ( userArgs.length ) {
    console.log(`using command line file ${userArgs[0]}`)
    jsonFile = userArgs[0]
}
else
    console.log('using default json file')

const episodeList = require(jsonFile);

//showAllEpisodeInformation(episodeList);
//showTotalDownloadSize(episodeList);

//episodeList.forEach(tryDownload);
result = tryDownload(episodeList[1]);
console.log(result ? 'OK' : 'Fail');

/*========== Utilities ==========*/

function showAllEpisodeInformation(list) {
  list.forEach(e => console.log(showInfo(e)));
}

function showTotalDownloadSize(list) {
  const sizes = episodeList.map(getDownloadSize);
  const total = sizes.reduce((total, next) => total + next, 0)
  //console.log(total)
  console.log('Total download size: ' + (total / 1024).toFixed(2) + 'Gb')
}

function tryDownload(ep) {
  const url = getDownloadLink(ep);
  const filename = getFilename(ep);
  const path = downloadDir + filename;

  if (fs.existsSync(path)) {
    console.log(`Skipping ${path} - file exists`);
    return true;
  }
 
  let success = true;
  console.log(`Downloading ${url} to ${path}`);

  request
    .get(url)
    .on('error', function(err) {
      console.error('Error', err);
      success = false;
    })
    .pipe(fs.createWriteStream(path));

  return success;
}


function showInfo(ep) {
  const filename = getFilename(ep);
  const size = getDownloadSize(ep).toFixed(1);
  const url = getDownloadLink(ep);

  return `${filename} (${size}Mb)`;
}

function getFilename(episode) {
  const title = episode.title;
  const pubDate = episode.pubDate;

  const jsDate = new Date(pubDate);
  const year = jsDate.getFullYear();
  const month = jsDate.getMonth() + 1;
  const day = jsDate.getDate();

  const displayYear = year;
  const displayMonth = (month < 10 ? '0'+month : month);
  const displayDay = (day < 10 ? '0'+day : day);

  const filenameDate = `${displayYear}-${displayMonth}-${displayDay}`;

  return `${filenameDate} - ${title}.mp3`;
}

function getDownloadLink(episode) {
  const data = episode.enclosure || {};
  return (data.url || 'missing');
}

function getDownloadSize(episode) {
  const data = episode.enclosure || {};

  const sizeInBytes = data['length'] || 1;
  const sizeInMb = sizeInBytes / 1024 / 1024;

  return sizeInMb;
}

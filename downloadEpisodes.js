#! /usr/bin/node

const fs = require('fs');
const path = require('path');
const request = require('request');
const nodeProcess = require('child_process');
const execSync = nodeProcess.execSync;

const downloadDir = './';
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
    console.log(`using default json file ${jsonFile}`)

const episodeList = require(jsonFile);

//showAllEpisodeInformation(episodeList);
//showTotalDownloadSize(episodeList);

const max = episodeList.length;
let alreadyDownloaded = 0;

for ( let i = 0 ; i < max ; i++ ) {
  let success = tryDownload(episodeList[i]);

  const randomTime = Math.floor(Math.random() * 5000);

  if (success)
    msleep(randomTime);

  if(alreadyDownloaded > 3) {
    console.log(`Found ${alreadyDownloaded} episodes already downloaded - aborting downloads`);
    break;
  }
}

/*========== Utilities ==========*/
function msleep(n) {
  console.log(`sleep ${n}`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

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
  const filePath = path.normalize(downloadDir + filename);

  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file exists`);
    alreadyDownloaded++;
    return true;
  }

  //return downloadWithRequest(url, filePath);
  return downloadWithWget(url, filePath); 
}

function downloadWithRequest(url, filePath) {
  let result = true;
  console.log(`Downloading ${url} to ${filePath}`);
  request
    .get(url)
    .on('error', function(err) {
      console.error('Error', err);
      success = false;
    })
    .pipe(fs.createWriteStream(filePath));

  return result;
}

function downloadWithWget(url, filePath) {
  const wgetCommand = `wget ${url} -O "${filePath}"`;
  console.log(wgetCommand);
  try {
    const processOut = execSync(wgetCommand, {stdio: 'inherit'});
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

function showInfo(ep) {
  const filename = getFilename(ep);
  const size = getDownloadSize(ep).toFixed(1);
  const url = getDownloadLink(ep);

  return `${filename} (${size}Mb)`;
}

function getFilename(episode) {
  const titleRaw = episode.title;
  const title = titleRaw.replace(/[/\\?%*:|"<>]/g, '');
	
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

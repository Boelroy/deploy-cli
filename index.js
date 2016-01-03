#!/usr/bin/env node
'use strict'

var fs = require("fs");
var path = require('path');
var donwloader = require("./lib/donwloader");
var Github = require("./lib/github");
var util = require("util");
var Qiniu = require("./lib/qiniu")

var config = {
  optionPath: "./.bugtagsrc",
  tempPath: "./.tmp"
}

function readOptionsJSON() {
    var data = {};
    try{
      console.log(config.optionPath);
      data = JSON.parse(fs.readFileSync(config.optionPath, {encoding: 'utf-8'}))
    } catch(e) {
      console.log(e);
      console.log("No .bugtagsrc found in directory");
      return null;
    }
    return data;
}

function mkdirSync(dirPath, mode) {
  if (!fs.existsSync(dirPath)) {
    var pathtmp;
    dirPath.split(path.seq).forEach(function(dirname) {
      if (pathtmp) {
        pathtmp = path.join(pathtmp, dirname);
      } else {
        pathtmp = dirname;
      }

      if (!fs.existsSync(pathtmp)) {
        if (!fs.mkdirSync(pathtmp, mode)) {
          return false;
        }
      }
    })
  }
}

function downloadZip(data) {
  mkdirSync(config.tempPath);
  var localfile = util.format("%s/%s-%s.%s", config.tempPath, bugtagsrc.name, bugtagsrc.version, "zip")
  donwloader.download(data.zipball_url, localfile, "zip")
    .then(uploadToQiniu)
}

function uploadToQiniu(localfile) {
  Qiniu.uploadToQiniu(bugtagsrc.qiniu_buckect, 
    localfile, 
    util.format("%s-%s.%s",bugtagsrc.name, bugtagsrc.version, "zip"))
  .then(function(ret){
    console.log(ret);
  })
}

function handleCreateError(err) {
  console.log(err);
}

var bugtagsrc = readOptionsJSON();
if(!bugtagsrc) return;
Github.init(bugtagsrc);
Qiniu.init(bugtagsrc);

bugtagsrc.releases.map(function(branch){
  Github.createRelease({
    tag_name: "v" + bugtagsrc.version,
    target_commitish: branch,
    name: "v" + bugtagsrc.version,
    body: bugtagsrc.description
  }).then(downloadZip, handleCreateError)
});
  
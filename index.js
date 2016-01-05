'use strict'

var fs = require("fs");
var path = require('path');
var donwloader = require("./lib/donwloader");
var Github = require("./lib/github");
var util = require("util");
var Qiniu = require("./lib/qiniu")

var config = {
  tempPath: ".tmp"
}
var bugtagsrc = null;

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

function downloadZip(zipball_url, branch) {
  mkdirSync(path.resolve(__dirname, config.tempPath));
  var localfile = util.format("%s/%s-%s-%s.%s", 
    config.tempPath, 
    bugtagsrc.name,
    branch,
    bugtagsrc.version, 
    "zip");

  donwloader.download(zipball_url, localfile, "zip")
    .then(uploadToQiniu(branch))
}

function uploadToQiniu(branch) {
  return function(localfile){
    Qiniu.uploadToQiniu(bugtagsrc['qiniu-buckect'],
      localfile, 
      util.format("%s-%s-%s.%s",bugtagsrc.name, bugtagsrc.version, branch,"zip"))
    .then(function(ret){
      console.log(ret);
    }, handleCreateError)
  }
}

function handleCreateError(err) {
  console.log(err);
}

module.exports = function (options) {
  bugtagsrc = options;
  if(!bugtagsrc) return;
  Github.init(bugtagsrc);
  Qiniu.init(bugtagsrc);

  bugtagsrc.branches.split(',')
    .map(function(branch){
      branch = branch.trim();
      if (bugtagsrc['release']){
        Github.createRelease({
          tag_name: "v" + bugtagsrc.version,
          target_commitish: branch,
          name: "v" + bugtagsrc.version,
          body: bugtagsrc.desc || " "
        }).then(function(data){
          downloadZip(data.zipball_url, branch);
        }, handleCreateError)
      } else {
        downloadZip(Github.getZipBallUrl(), branch);
      }
  });
}

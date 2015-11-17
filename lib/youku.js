var util = require('util'),
    _    = require('underscore'),
    $    = require('./utils');

var FILEID_BOOK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\\:._-1234567890',
    FILE_URL    = 'http://k.youku.com/player/getFlvPath/sid/%s_00/st/%s/fileid/%s'
                + '?K=%s&token=%s&ep=%s&ctype=12&ev=1&oip=%s',
    ST_BOOK     = { 'flv':'flv', 'hd2':'flv', 'hd3':'flv', '3gp':'flv', 'mp4':'mp4', '3gphd':'mp4'};

// TODO: extract base class
function Youku(){}

Youku.prototype.parse = function(url, cb) {
  // TODO: support more patterns
  var reg = /v_show\/id_([0-9a-zA-Z=\-]+)\.html/,
      res = reg.exec(url);
  if (!res) return cb('unknown URL');

  var self = this;
  var options = {
    hostname: 'v.youku.com',
    path: util.format('/player/getPlayList/VideoIDS/%s/Pf/4/ctype/12/ev/1', res[1])
  };
  $.do_http(options, function(e, body){
    if (e) return cb(e);

    var data = JSON.parse(body).data[0],
        video = self.parse_video(data);
    return cb(null, video);
  });
};

Youku.prototype.parse_video = function(data) {
  var video = _.pick(data, 'title', 'seconds');
  video.id = data.vidEncoded;

  var ep = this.dec_ep(new Buffer(data.ep,'base64'), 'becaf9be').split('_'),
      sid = ep[0], token = ep[1];

  var self = this;
  data.streamtypes.forEach(function(t){
    var fileid = self.dec_fileid(data.streamfileids[t], data.seed);
    video[t] = _.map(data.segs[t], function(seg){
      var no = (seg.no.length < 2 ? '0' : '') + seg.no,
          fileid2 = fileid.substr(0,8) + no + fileid.substr(10),
          ep = self.enc_ep(sid, fileid2, token);

      // TODO: add more attrs? e.g. size
      return util.format(FILE_URL, sid, ST_BOOK[t], fileid2, seg.k, token, ep, data.ip);
    });
  });

  return video;
};

Youku.prototype.dec_fileid = function(cipher, seed) {
  var book1 = FILEID_BOOK.split('');

  var book2 = _.map(_.range(book1.length), function(x){
    seed = (seed * 211 + 30031) % 65536;
    var i = Math.floor(seed / 65536 * book1.length);
    return book1.splice(i, 1);
  });

  return _.map(cipher.split('*'), function(x){
    return book2[parseInt(x)];
  }).join('');
};

Youku.prototype.dec_ep = function(cipher, salt) {
  var i,j,k;

  var book = _.range(256);
  for (i=j=0; i < 256; ++i) {
    j = (j + book[i] + salt.charCodeAt(i % salt.length)) % 256;
    $.swap(book, i, j);
  }

  i=j=k=0;
  var tmp = _.map(_.toArray(cipher), function(x) {
    k = (k+1) % 256;
    j = (j+book[k]) % 256;
    $.swap(book, k, j);

    var c = x ^ book[(book[k]+book[j]) % 256];
    return String.fromCharCode(c);
  });
  return tmp.join('');
};

Youku.prototype.enc_ep = function(sid, fileid, token) {
  var cipher = new Buffer(sid+'_'+fileid+'_'+token);
  var ep = this.dec_ep(cipher, 'bf7e5f01');
  var ep2 = _.map(ep, function(x){ return x.charCodeAt(0); });
  return new Buffer(ep2).toString('base64')
             .replace(/\+/g, '%2B').replace(/=/g, '%3D').replace(/\//g, '%2F');
};

module.exports = Youku;

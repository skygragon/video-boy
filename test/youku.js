var should = require('should');

var Youku = require('../lib/youku');

describe('Youku', function(){
  var youku = new Youku();

  describe('dec_fileid', function(){
    it('should return a valid fileid', function(){
      var cipher = '33*67*33*33*33*42*33*60*33*33*36*67*46*26*42*40*'
                 + '26*60*2*9*6*67*56*60*6*42*17*2*46*2*17*56*36*7*7*'
                 + '60*55*36*29*46*33*55*17*29*55*55*6*9*29*56*46*40*'
                 + '42*29*2*12*26*36*12*33*60*6*12*42*12*42*',
          seed = 2368;

      var fileid = youku.dec_fileid(cipher, seed);
      fileid.should.equal('030008040053F98A94E2631468DEFED15CC475-F07D-7762-1FA8-EB95B046B8B8');
    });
  });

  describe('dec_ep', function(){
    it('should return a valid ep', function(){
      var cipher = new Buffer('NAXQRwkWJbrY0vbA8+JxVdbwuxE71wrKXhc=', 'base64');

      var ep = youku.dec_ep(cipher, 'becaf9be');
      ep.should.equal('3409483123616127f4226_7168');
    });
  });

  describe('parse', function(){
    it('should return error for invalid url', function(done){
      var url = 'http://www.youku.com/';
      youku.parse(url, function(e, video){
        e.should.equal('unknown URL');
        done();
      });
    });

    it('should return parsed video', function(done){
      var url = 'http://v.youku.com/v_show/id_XOTI0MTE4ODg4.html';
      youku.parse(url, function(e, video){
        video.id.should.equal('XOTI0MTE4ODg4');
        //console.log(video);
        done();
      });
    });
  });

});

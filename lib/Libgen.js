var libgen = require("libgen");

exports._getMirror = function() {
  return libgen.mirror();
};

exports._search = function(mirror) {
  return function(query) {
    return function() {
      return libgen.search({
        mirror: mirror,
        query: query,
        count: 10,
        sort_by: "size",
        reverse: true
      });
    };
  };
};

exports._getPreDownloadUrl = function(md5) {
  return function() {
    return libgen.utils.check.canDownload(md5);
  };
};

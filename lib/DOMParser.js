var xmldom = require("xmldom");

exports.makeDOMParser = function() {
  return new xmldom.DOMParser();
};

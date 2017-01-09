// weex h5 laod pages
(function () {
  function getUrlParam(key,searchStr) {
    var reg = new RegExp('[?|&]' + key + '=([^&]+)');
    searchStr = searchStr || location.search;
    var match = searchStr.match(reg)
    return match && match[1]
  }
  var loader = getUrlParam('loader') || 'xhr'
  var page = getUrlParam('page');
  if(!page) {
    if(window.top) {
      page = getUrlParam('page',top.location.search);
    }else{
      return console.warn('Page not loaded!!!'); 
    }
  }
  window.weex.init({
    appId: location.href
    , loader: loader
    , source: page
    , rootId: 'weex'
  })
})();
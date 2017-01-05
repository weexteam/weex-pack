 /**
  * Init weex instance depending on the url params.
  * There are three ways to load weex bundles, depends on the
  * parameter 'loader' in the url:
  *
  *   + xhr: use XMLHttpRequest. Parameter 'page' should be
  *   the bundle's url.
  *   + source: use the transformed code itself. 'page' should
  *   be the transformed weex bundle.
  *
  * @param {String} bundle - It has different meaning depends on
  *   the type of loader.
  */
  

  
 (function () {
   function getUrlParam(key) {
     var reg = new RegExp('[?|&]' + key + '=([^&]+)')
     var match = location.search.match(reg)
     return match && match[1]
   }
   var loader = getUrlParam('loader') || 'xhr';
   var page = getUrlParam('page') || '../dist/index.js';
   window.weex.init({
     appId: location.href
     , loader: loader
     , source: page
     , rootId: 'weex'
   })
 })();


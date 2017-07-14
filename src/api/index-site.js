'use strict';

const SimpleCrawler = require( 'simplecrawler' );
const config = require( '../../util/config.js' ).SiteCrawler;

/**
 * Add site index.
 * @param {string} siteCrawler
 */
function _addSiteIndexEvents( siteCrawler ) {
  let errorCount = 0;

  siteCrawler.on( 'fetchcomplete', ( queueItem, responseBuffer ) => {
    console.log( 'Indexing: ' +  queueItem.url );
  } );

  siteCrawler.on( 'fetcherror', err => {
    console.log( 'fetching' );

    errorCount++
    if( errorCount > config.errorThreshold ) {
      console.log( 'There was a problem creating the index.' );
      process.exit();
    }
  } );

  siteCrawler.on( 'complete', queueItem => {
    siteCrawler.queue.freeze( config.siteIndexFile, () => {
      console.log( 'Index successfully completed.' );
      process.exit();
    } );
  } );

  siteCrawler.addFetchCondition( queueItem => {
    const IGNORE_ITEMS_REGEX =
      /\.(png|jpg|jpeg|gif|ico|css|js|csv|doc|docx|pdf|woff|html|zip|svg)$/i;

    return !queueItem.path.match( IGNORE_ITEMS_REGEX );
     //      !queueItem.path.match( IGNORE_URLS_REGEX );
  } );

  return siteCrawler;
}

/**
 * Add to the queueItem.
 * @param {string} queueItem
 * @param {string} components
 */
function _addToQueueItem( queueItem, components ) {
  let arrayMethod = 'push';

  if ( Array.isArray( queueItem.components ) === false ) {
    queueItem.components = [];
  }

  queueItem.components = queueItem.components.concat( components );

  return queueItem;
}

/**
 * Create site index.
 */
function indexSite( url, options ) {
  const indexArray = [];
  const URL = 'http://' + config.host + ':' + config.port;
  const siteLocation = url || URL;
  const siteCrawler = SimpleCrawler( siteLocation );
  const siteCrawlerDefaults = {
    parseHTMLComments: false,
    parseScriptTags: false,
    stripQuerystring: true
  }

  Object.assign( siteCrawler, siteCrawlerDefaults, options );

  _addSiteIndexEvents( siteCrawler );

  return siteCrawler.start()
}

module.exports = indexSite;

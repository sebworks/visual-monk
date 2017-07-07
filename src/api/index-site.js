'use strict';

const SimpleCrawler = require( 'simplecrawler' );
const config = require( '../../util/config.js' ).SiteCrawler;
const siteCrawlerPromise = require( '../../util/empty-promise' )();

/**
 * Add site index.
 * @param {string} siteCrawler
 */
function _addSiteIndexEvents( siteCrawler ) {
  let errorCount = 0;

  siteCrawler.on( 'fetchcomplete', ( queueItem, responseBuffer ) => {
    consle.log( 'Indexing: ' +  queueItem.url );
  } );

  siteCrawler.on( 'fetcherror', err => {
    errorCount++
    if( errorCount > config.errorThreshold ) {
      console.log( 'There was a problem creating the index.' );
      siteCrawlerPromise.reject();
      process.exit();
    }
  } );

  siteCrawler.on( 'complete', queueItem => {
    siteCrawler.queue.freeze( config.siteIndexFile, () => {
      console.log( 'Index successfully completed.' );
      siteCrawlerPromise.resolve();
      process.exit();
    } );
  } );

  siteCrawler.addFetchCondition( queueItem => {
    const IGNORE_ITEMS_REGEX =
      /\.(png|jpg|jpeg|gif|ico|css|js|csv|doc|docx|pdf|woff|html|zip|svg)$/i;
    const IGNORE_URLS_REGEX = /\/(ask-cfpb|es)\// || /UNDEFINED/;

    return !queueItem.path.match( IGNORE_ITEMS_REGEX ) &&
           !queueItem.path.match( IGNORE_URLS_REGEX );
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
function start( ) {
  const indexArray = [];
  const options = gulpUtil.env;
  const host = options.host || config.host;
  const port = options.port || config.port;
  const SITE_LOCATION = 'http://' + host + ':' + port;
  const siteLocation = options.siteLocation || SITE_LOCATION;
  const siteCrawler = SimpleCrawler( siteLocation );
  const siteCrawlerDefaults = {
    parseHTMLComments: false,
    parseScriptTags: false,
    stripQuerystring: true
  }

  Object.assign( siteCrawler, siteCrawlerDefaults, options );

  _addSiteIndexEvents( siteCrawler );

  siteCrawler.start()

  return siteCrawlerPromise;
}

module.exports = {
  start: start
}

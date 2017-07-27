
'use strict';

const minimist = require( 'minimist' );
const webdriver = require( 'selenium-webdriver' );
const config = require( '../../util/config.js' ).VisualMonk;
const fs = require( 'fs' );

function getBrowser( ) {
  const browser = cliOptions.browser || 'chrome';
  const capabilities = webdriver.Capabilities[browser]();

  if ( cliOptions.headless ) {
    capabilities.set( 'chromeOptions', {
      'args': [ '--headless' ]
    } );
  }

  return new webdriver.Builder()
         .withCapabilities( capabilities )
         .build()
}

function _getBrowserInfo( driver ) {
  function _getBrowserInfoScript() {

    return {
      bodyHeight:      document.body.offsetHeight,
      bodyWidth:       document.body.offsetWidth,
      maxScrollAmount: document.body.offsetHeight - window.innerHeight,
      pixelRatio:      window.devicePixelRatio,
      scrollAmount:    0,
      windowHeight:    window.innerHeight
    };
  }

  return driver.executeScript( _getBrowserInfoScript );
}

function writeScreenshot( data, name ) {
  name = name + '.png';
  var stream = fs.createWriteStream( config.snapShotPath + name );
  stream.write( new Buffer( data, 'base64' ) );
  stream.end();

  return
};

function takeSnapShots( url, options ) {

  return getBrowser()
         .then( driver => {
            return driver.get( url )
            .then( _ => driver.sleep( 3 ) )
            .then( _ => driver.takeScreenshot() )
            .then( data => {
              return writeScreenshot( data, 'test' );
            } )
            .then( _ => driver.quit() );
         } );
}

module.exports = takeSnapShots;

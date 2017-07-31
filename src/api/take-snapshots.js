
'use strict';

const config = require( '../util/config' ).VisualMonk;
const fs = require( 'fs' );
const getDriverPaths = require( '../util/get-driver-paths' );
const minimist = require( 'minimist' );
const webdriver = require( 'selenium-webdriver' );

function getBrowser( options={} ) {
  const driverPath = getDriverPaths().chrome.last;
  const browser = options.browser || 'chrome';
  const capabilities = webdriver.Capabilities[browser]();

  if ( options.headless ) {
    capabilities.set( 'chromeOptions', {
      'args': [ '--headless']
    } );
  }

  return new webdriver.Builder()
  .withCapabilities( capabilities )
  .build();
}

function getBrowserInfo( driver ) {
  function _getBrowserInfoScript() {

    return {
      clientWidth:     document.querySelector( 'div' ).offsetWidth,
      bodyHeight:      document.body.offsetHeight,
      bodyWidth:       document.body.offsetWidth,
      maxScrollAmount: document.body.offsetHeight - window.innerHeight,
      pixelRatio:      window.devicePixelRatio
    };
  }

  return driver.executeScript( _getBrowserInfoScript );
}

function writeScreenshot( data, name = 'screenshot' ) {
  name = name + '.png';
  var stream = fs.createWriteStream( config.snapShotPath + name );
  stream.write( new Buffer( data, 'base64' ) );
  stream.end();

  return
};

async function takeSnapShots( url, options={} ) {
  let driver;
  try {
    driver = await getBrowser( options );
    url = url || config.baseUrl;
    await driver.get( url );
    const browserInfo = await getBrowserInfo( driver );

    console.log( browserInfo );

    await driver.manage().window().setSize( 1440, browserInfo.maxScrollAmount );
    const data = await driver.takeScreenshot();
    await writeScreenshot( data );
  } finally {
    if ( driver ) driver.quit();
  }
}

module.exports = takeSnapShots;

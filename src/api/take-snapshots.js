
'use strict';

const config = require( '../util/config' ).VisualMonk;
const fs = require( 'fs' );
const getDriverPaths = require( '../util/get-driver-paths' );
const template = require( '../util/template' );
const Jimp = require( 'jimp' );
const minimist = require( 'minimist' );
const webdriver = require( 'selenium-webdriver' );
const By = webdriver.By;

async function getBrowserDriver( options = {} ) {
 // const driverPath = getDriverPaths().chrome.last;
  const browser = options.browser || 'chrome';
  const capabilities = webdriver.Capabilities[browser]();

  if ( options.headless && browser === 'chrome' ) {
    capabilities.set( 'chromeOptions', {
      'args': [ '--headless' ]
    } );
  }

  return new webdriver.Builder()
         .withCapabilities( capabilities )
         .build();
}

async function getBrowserInfo( driver ) {
  function getBrowserInfoScript() {

    return {
      height:     document.body.offsetHeight,
      width:      document.body.offsetWidth,
      pixelRatio: window.devicePixelRatio || 0
    };
  }

  return driver.executeScript( getBrowserInfoScript );
}

async function getElementInfo( driver, selector, browserInfo ) {
  const element = await driver.findElement( By.css( selector ) );
  const location = await element.getLocation();
  const size = await element.getSize();
  const elementInfo = { pixelRatio: browserInfo.pixelRatio };

  return Object.assign( elementInfo, size, location );
}

function writeScreenshot( data, imageMetadata, name = 'screenshot' ) {
  const imageBuffer = new Buffer( data, 'base64' );
  const imagePath = config.snapshotPath + name + '.png';
  const cropMetadata = {};

  if ( imageMetadata ) {
    if( imageMetadata.pixelRatio ) {
      Object.keys( imageMetadata ).forEach( key => {
        cropMetadata[key] = imageMetadata[key] * imageMetadata.pixelRatio;
      } );
    }

    Jimp.read( imageBuffer, ( err, image ) => {
      image.crop( cropMetadata.x,
                  cropMetadata.y,
                  cropMetadata.width,
                  cropMetadata.height,
                  ( err, image ) => image.write( imagePath ) );
    } );
  } else {
    const stream = fs.createWriteStream( imagePath );
    stream.write( new Buffer( data, 'base64' ) );
    stream.end();
  }

  return
};

async function setWindowSize( driver, width, height ) {

  return driver.manage().window().setSize( width, height );
};

function getWindowSizes( windowSizes, browserInfo ) {
  const defaultWindowSize = config.windowSizes.desktop;
  let sizes = [];

  function getSize( width, height ) {

    return { width:  parseInt( width ),
             height: parseInt( height || browserInfo.height )
           };
  }

  if( windowSizes === 'all' ) {
    const allWindowSizes = config.windowSizes;

    Object.keys( allWindowSizes ).forEach( key => {
      sizes.push( getSize( allWindowSizes[key], allWindowSizes.width ) );
    } );

  } else if ( windowSizes ) {
    let windowSizeList = windowSizes.split( ',' );

    windowSizeList.forEach( windowSize => {
      if ( /^\d*x\d*/.test( windowSize ) ) {
        let widthXheight = windowSize.split( 'x' );
        sizes.push( getSize( widthXheight[0], widthXheight[1] ) );
      } else {
        throw new Error( 'Window size param is incorrect' );
      }
    } );
  } else {
    sizes.push( getSize( defaultWindowSize.width ) );
  }

  return sizes;
};

function getSnapshotName( snapshotName ) {
  if( typeof snapshotName === 'object' ) {
    return template( config.snapshotNameTpl )( snapshotName );
  }

  return snapshotName;
}

async function takeSnapShots( url, options = {} ) {
  let driver;
  let elementInfo;

  try {
    driver = await getBrowserDriver( options );
    url = url || config.baseUrl;
    await driver.get( url );

    let browserInfo = await getBrowserInfo( driver );
    const windowSizes = getWindowSizes( options.windowSizes, browserInfo );

    for ( let len = windowSizes.length, i = 0; i < len; i ++) {
      let windowSize = windowSizes[i];
      let test = await setWindowSize( driver,
                                      windowSize.width,
                                      windowSize.height );

      browserInfo = await getBrowserInfo( driver );

      await setWindowSize( driver,
                           browserInfo.width,
                           browserInfo.height );

      if ( options.selector ) {
        elementInfo = await getElementInfo( driver,
                                            options.selector,
                                            browserInfo );
      }

      const data = await driver.takeScreenshot();
      writeScreenshot( data, elementInfo, getSnapshotName( windowSize.width + windowSize.height ) );
    };
  } finally {
    if ( driver ) driver.quit();
  }
}

module.exports = takeSnapShots;

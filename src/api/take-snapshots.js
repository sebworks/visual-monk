
'use strict';

const config = require( '../util/config' ).VisualMonk;
const fs = require( 'fs' );
const getDriverPaths = require( '../util/get-driver-paths' );
const Jimp = require( 'jimp' );
const minimist = require( 'minimist' );
const webdriver = require( 'selenium-webdriver' );
const By = webdriver.By;

async function getBrowser( options={} ) {
  const driverPath = getDriverPaths().chrome.last;
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
      height:     document.body.offsetHeight - window.innerHeight,
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
  const imagePath = config.snapShotPath + name + '.png';
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

async function takeSnapShots( url, options={} ) {
  let driver;
  let elementInfo;

  try {
    driver = await getBrowser( options );
    url = url || config.baseUrl;
    await driver.get( url );
    const browserInfo = await getBrowserInfo( driver );
    await setWindowSize( driver,
                         config.windowSizes.default.width,
                         browserInfo.height );

    if( options.selector ) {
      elementInfo = await getElementInfo( driver,
                                          options.selector,
                                          browserInfo );
    }

    const data = await driver.takeScreenshot();
    writeScreenshot( data, elementInfo, options.name );
  } finally {
    if ( driver ) driver.quit();
  }
}

module.exports = takeSnapShots;

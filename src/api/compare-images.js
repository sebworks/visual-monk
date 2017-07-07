
'use strict';

const minimist = require( 'minimist' );
const cliOptions = require( '../../cli/options' );
const webdriver = require( 'selenium-webdriver' );

const BROWSERS = {
  CHROME:  'chrome',
  FIREFOX: 'firefox'
}

function getBrowser( ) {
  const browser = cliOptions.browser || BROWSERS.CHROME;
  const capabilities = webdriver.Capabilities[browser]();

  if ( cliOptions.headless && browser == BROWSERS.CHROME ) {
    capabilities.set( 'chromeOptions', {
      'args': [ '--headless' ]
    } );
  }

  return new webdriver.Builder()
         .withCapabilities( capabilities )
         .build()
}

function create( ) {

  return getBrowser()
         .then( driver => {
            return driver.get( 'http://www.google.com/ncr' )
            .then( _ => driver.quit() );
         } );
}

module.exports = { create: create };

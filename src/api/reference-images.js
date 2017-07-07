
'use strict';

const minimist = require( 'minimist' );
const cliOptions = require( '../../cli/options' );
const webdriver = require( 'selenium-webdriver' );

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

function create( ) {

  return getBrowser()
         .then( driver => {
            return driver.get( 'http://www.google.com/ncr' )
            .then( _ => driver.findElement( By.name('q')).sendKeys('webdriver' ) )
            .then( _ => driver.findElement( By.name('btnG')).click())
            .then( _ => driver.wait( until.titleIs('webdriver - Google Search' ), 1000 ) )
            .then( _ => driver.quit() );
         } );
}

module.exports = { create: create };

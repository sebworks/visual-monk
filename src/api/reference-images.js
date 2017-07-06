
'use strict';

const gulpUtil = require( 'gulp-util' );
const minimist = require( 'minimist' );
const spawn = require( 'child_process' ).spawn;
var path = require( 'path' );

const {Builder, By, until} = require('selenium-webdriver');
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);


/**
 * Add a command-line flag to a list of Protractor parameters, if present.
 * @param {Object} protractorParams Parameters to pass to Protractor binary.
 * @param {Object} commandLineParams Parameters passed
 *   to the command-line as flags.
 * @param {string} value Command-line flag name to lookup.
 * @returns {Array} List of Protractor binary parameters as strings.
 */
function _findProtractor( packageName, binaryName, binaryDir ) {
  binaryName = binaryName || packageName;
  binaryDir = binaryDir || 'bin';
  var pkgPath = require.resolve( packageName );
  binaryDir = path.resolve(
    path.join( path.dirname( pkgPath ), binaryDir, '/' + binaryName )
  );
  return binaryDir;
}

/**
 * Add a command-line flag to a list of Protractor parameters, if present.
 * @param {Object} protractorParams Parameters to pass to Protractor binary.
 * @param {Object} commandLineParams Parameters passed
 *   to the command-line as flags.
 * @param {string} value Command-line flag name to lookup.
 * @returns {Array} List of Protractor binary parameters as strings.
 */
function _addCommandLineFlag( protractorParams, commandLineParams, value ) {
  if ( typeof commandLineParams[value] === 'undefined' ) {
    return protractorParams;
  }

  if ( value === 'tags' ) {
    return protractorParams.concat( [ '--cucumberOpts.tags' +
                                      '=' +
                                      commandLineParams[value] ] );
  }

  return protractorParams.concat( [ '--params.' +
                                    value + '=' +
                                    commandLineParams[value] ] );
}

/**
 * Format and return parameters for Protractor binary.
 * @param {string} suite Name of specific suite or suites to run, if any.
 * @returns {Array} List of Protractor binary parameters as strings.
 */
function _getProtractorParams( suite ) {
  const commandLineParams = minimist( process.argv.slice( 2 ) );

  // Set default configuration command-line parameter.
  let params = [ './protractor/conf.js' ];

  // If --sauce=false flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'sauce' );

  // If --specs=path/to/js flag is added on the command-line,
  // pass the value to protractor to override the default specs to run.
  params = _addCommandLineFlag( params, commandLineParams, 'specs' );

  // If --windowSize=w,h flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'windowSize' );

  // If --browserName=browser flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'browserName' );

  // If --platform=os flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'platform' );

  // If --version=number flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'version' );

  // If --tags=@tagName flag is added on the command-line.
  params = _addCommandLineFlag( params, commandLineParams, 'tags' );

  // If the --suite=suite1,suite2 flag is added on the command-line
  // or, if not, if a suite is passed as part of the gulp task definition.
  const suiteParam = { suite: commandLineParams.suite || suite };
  params = _addCommandLineFlag( params, suiteParam, 'suite' );

  return params;
}

/**
 * Spawn the appropriate acceptance tests.
 * @param {string} args Selenium arguments.
 */
function create( args ) {
  new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build()
    .then(driver => {
      return driver.get('http://www.google.com/ncr')
        .then(_ => driver.findElement(By.name('q')).sendKeys('webdriver'))
        .then(_ => driver.findElement(By.name('btnG')).click())
        .then(_ => driver.wait(until.titleIs('webdriver - Google Search'), 1000))
        .then(_ => driver.quit());
  } );
}

module.exports = { create: create };

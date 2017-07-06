'use strict';

const protractorConfig = require( '../util/config.js' ).Protractor;
const env = require( 'gulp-util' ).env
const minimist = require( 'minimist' );

/**
 * Check whether a parameter value is set.
 * @param {string} param The value of a parameter.
 * @returns {boolean} Whether a parameter value is undefined or not,
 *   meaining whether it has been set on the command-line or not.
 */
function _paramIsSet( param ) {
  return typeof param !== 'undefined';
}

/**
 * Choose the suite based on what command-line flags are passed.
 * @param {Object} params Set of parameters from the command-line.
 * @returns {Array} List of multiCapabilities objects.
 */
function _chooseSuite( params ) {

  const paramsAreNotSet = !_paramIsSet( params.browserName ) &&
                          !_paramIsSet( params.version ) &&
                          !_paramIsSet( params.platform );

  // Set the capabilities to use the essential suite,
  // unless Sauce Labs credentials are set and
  // no browser/platform flags are passed, in which case use the full suite.
  // This will make it so that setting the browser/platform flags
  // won't launch several identical browsers performing the same tests.
  const capabilities = protractorConfig.defaultSuites.headless;
  const cucumberOpts = minimist( process.argv.slice( 2 ) )
                       .cucumberOpts || {};
  const windowSizes = protractorConfig.windowSizes;
  let windowWidthPx = windowSizes.desktop.width;
  let windowHeightPx = windowSizes.desktop.height;

  if ( cucumberOpts.tags === '@mobile' ) {
    windowWidthPx = windowSizes.mobile.width;
    windowHeightPx = windowSizes.mobile.height;
  }
  let windowSize = `--window-size=${windowWidthPx}x${windowHeightPx}`;
  capabilities[0].chromeOptions.args.push( windowSize );

  return capabilities;
}

/**
 * Choose test specs based on passed parameters.
 * @param {Object} params Set of parameters from the command-line.
 * @returns {Array} List of specs or spec patterns to execute.
 */
function _chooseProtractorSpecs( params ) {
  let i;
  let len;
  let specs = [];

  // If one or more suites are specified, use their specs.
  if ( _paramIsSet( params.suite ) ) {
    const suiteNames = params.suite.split( ',' );
    for ( i = 0, len = suiteNames.length; i < len; i++ ) {
      const suiteSpecs = environmentTest.suites[suiteNames[i]];
      if ( suiteSpecs ) {
        specs = specs.concat( suiteSpecs );
      }
    }
  // Otherwise if specs are specified, use them.
  } else if ( _paramIsSet( params.specs ) ) {
    const specPatterns = params.specs.split( ',' );
    for ( i = 0, len = specPatterns.length; i < len; i++ ) {
      specs = specs.concat( environmentTest.specsBasePath + specPatterns[i] );
    }
  // If neither a suite or specs are specified, use the default suite.
  } else {
    specs = specs.concat( protractorConfig.suites.default );
  }

  return specs;
}

/**
 * Params that need to be passed to protractor config.
 * @param {Object} params Set of parameters from the command-line.
 * @returns {Object} Parsed parameters from the command-line,
 *   which are only applicable to protractor.
 */
function _retrieveProtractorParams( params ) { // eslint-disable-line complexity, no-inline-comments, max-len
  const parsedParams = {};

  parsedParams.specs = _chooseProtractorSpecs( params );

  if ( _paramIsSet( params.browserName ) ) {
    parsedParams.browserName = params.browserName;
  }

  if ( _paramIsSet( params.version ) ) {
    parsedParams.version = params.version;
  }

  if ( _paramIsSet( params.platform ) ) {
    parsedParams.platform = params.platform;
  }

  return parsedParams;
}

/**
 * Copy parameters into multiCapabilities array.
 * @param {Object} params Set of parameters from the command-line.
 * @param {Array} capabilities List of multiCapabilities objects.
 * @returns {Array} List of multiCapabilities objects
 *   with injected params from the command-line and a test name field.
 */
function _copyParameters( params, capabilities ) { // eslint-disable-line complexity, no-inline-comments, max-len
  const newCapabilities = [];
  const injectParams = _retrieveProtractorParams( params );
  let capability;

  for ( let i = 0, len = capabilities.length; i < len; i++ ) {
    capability = capabilities[i];
    for ( var p in injectParams ) {
      if ( injectParams.hasOwnProperty( p ) ) {
        capability[p] = injectParams[p];
      }
    }
    capability.name = protractorConfig.testName +
                      ' ' + capability.specs +
                      ', running ' +
                      capability.browserName +
                      ( String( capability.version ).length > 0 ?
                        ' ' + capability.version : '' ) +
                      ' on ' + capability.platform +
                      ' at ' +
                      ( params.windowSize ?
                        params.windowSize :
                        protractorConfig.windowWidthPx + ',' +
                        protractorConfig.windowHeightPx ) + 'px';
    newCapabilities.push( capability );
  }

  return newCapabilities;
}

/**
 * The getMultiCapabilities method for Protractor's workflow.
 * See https://github.com/angular/protractor/blob/master/lib/config.ts#L336
 * @returns {Object} Selenium configuration object.
 */
function _getMultiCapabilities() {
  const params = this.params;
  const suite = _chooseSuite( params );
  const capabilities = _copyParameters( params, suite );

  return capabilities;
}

/**
 * The onPrepare method for Protractor's workflow.
 * See https://github.com/angular/protractor/blob/master/docs/system-setup.md
 */
function _onPrepare() {
  // Ignore Selenium allowances for non-angular sites.
  browser.ignoreSynchronization = true;

  return;
}

const config = {
  baseUrl:              protractorConfig.baseUrl,
  cucumberOpts: {
    'require':   'cucumber/step_definitions/*.js',
    'format':    'pretty',
    'profile':   false,
    'no-source': true
  },
  unknownFlags_:        [ 'cucumberOpts' ],
  directConnect:        true,
  framework:            'custom',
  frameworkPath:        require.resolve( 'protractor-cucumber-framework' ),
  getMultiCapabilities: _getMultiCapabilities,
  onPrepare:            _onPrepare
};


exports.config = config;
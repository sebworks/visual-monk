const fs = require( 'fs' );
const path = require( 'path' );
const { Config } = require( 'webdriver-manager/built/lib/config' );

function getDriverPaths() {
	let driverPaths;
	const seleniumDir = Config.getSeleniumDir();

  try {
  	const configFile = fs.readFileSync(
  		path.resolve( seleniumDir, 'update-config.json' )
  	);
  	driverPaths = JSON.parse( configFile.toString() );
  } catch ( err ) {
  	driverPaths = {};
  }

  return driverPaths;
}

module.exports = getDriverPaths;

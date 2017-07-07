
'use strict';

var commander = require('commander');

module.exports = commander
                 .version( '0.1.0' )
                 .option( '-b,  --browser [type]', '( Chrome or Firefox )' )
                 .option( '-h,  --headless', 'Run in headless mode' )
                 .option( '-w,  --width', '( int )' )
                 .option( '-s,  --specs', 'List of features to run, example: --specs=header.feature' )
                 .option( '-su, --suite', 'List of features to run, example: --specs=header.feature' )
                 .option( 'compare [imageA] [imageB]', 'Compare two images' )
                 .parse( process.argv );

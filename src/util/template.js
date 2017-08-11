
module.exports = ( templateString ) => {

 	return function( data ) {

 					return templateString
 								 .replace( /\$\{\{\s?(.*?)\s?\}\}/g,
 								   ( match, token ) => data[token]
 								 );
 				}
}

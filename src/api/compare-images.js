
'use strict';

const Jimp = require( 'jimp' );


function compareImages( imageA, imageB, options={} ) {

  return Promise.all( [ Jimp.read( imageA ), Jimp.read( imageB ) ] )
         .then( ( [ JimpImageA, JimpImageB ] ) => {
            const diffImage = Jimp.diff( JimpImageA, JimpImageB, 0.1 );
            diffImage.image.write( 'diff.jpg' );
         } );
}

module.exports = compareImages;
`
#!/usr/bin/env node

var commander = require( 'commander' );

'use strict';

commander.version( '0.1.0' );

//snapshot localhost:8000 --name=index.image --breakpoints=all
// compare imageA imageB

commander
.command( 'compare <image> <image>' )
.description( 'Execute the given remote cmd' )
.action( ( imageA, imageB ) => {
	console.log(  imageA, imageB )
} ).on( '--help', _ => {
	console.log( 'Examples:' );
	console.log();
	console.log();
} );

commander
.command( 'reference' )
.description( 'execute the given remote cmd' )
.option( '-e, --enter-site <mode>', '' )
.option( '-e, --enter-site <mode>', 'Create reference images for the entire site.' )
.action( ( cmd, options ) => {
	console.log(  );
} ).on( '--help', _ => {
	console.log( 'Examples:' );
	console.log();
	console.log();
} );

commander
.command( 'snapshot [url]' )
.description( 'Take a snapshot of a url' )
.option( '-n, --name [name]', 'Name of the snapshot. It will default to the url' )
.option( '-w, --widths [widths]', 'List of breakpoints' )
.action( ( url , options ) => {
	console.log( url );
} ).on( '--help', _ => {
	console.log( 'Examples:' );
	console.log();
	console.log();
} );

commander.parse( process.argv );

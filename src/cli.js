#!/usr/bin/env node

'use strict';

const commander = require( 'commander' );
const { execFile } = require('child_process');


commander.version( '0.1.0' )
.name( 'visual-monk' )
.on( '*', _ => {
	console.log('help')
} );

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

commander
.description( 'Update specific webdriver installs' )
.action( () => {
	console.log( commander.help() );
	//execFile( './node_modules/webdriver-manager/bin/webdriver-manager',  );
} )
.on( '--help', _ => {
	require('webdriver-manager');
} );

commander.parse( process.argv );

#!/usr/bin/env node

'use strict';

const commander = require( 'commander' );
const api = require( '../src/api' );
const { execFile } = require( 'child_process' );
const config = require( './util/config' ).VisualMonk;

commander.version( '0.1.0' )
.name( 'visual-monk' )
.on( '*', _ => {
  console.log( 'help' );
} );

commander
.command( 'compare <image> <image>' )
.description( 'Compare two images.' )
.action( ( imageA, imageB ) => {
  api.compareImages( imageA, imageB );
} ).on( '--help', _ => {
  console.log( 'Examples:' );
} );

commander
.command( 'index [url]')
.description( 'Index a site. Defaults to http://localhost:8000.' )
.description( 'See https://github.com/cgiffard/node-simplecrawler#configuration.' )
.option( '-d, --maxDepth [maxDepth]'  )
.action( ( url, options ) => {
  api.indexSite( url, options );
} ).on( '--help', _ => {
  console.log( 'Examples:' );
} );

commander
.command( 'snapshot [url]' )
.description( 'Take a snapshot of a URL' )
.option( '-e, --enter-site', 'Take snapshots of the entire site.' )
.option( '-n, --name [name]', 'Name of the snapshot. It will default to the url' )
.option( '-w, --windowSizes [windowSizes]', 'List of window sizes' )
.option( '-b, --browser [browser]', 'Web browser driver to use.' )
.option( '-h, --headless [headless]', 'Should the browser be headless.' )
.option( '-s, --selector [selector]', 'Selector to use to retreive element.' )
.action( ( url, options ) => {
  api.takeSnapShots( url, options );
} ).on( '--help', _ => {
  console.log( 'Examples:' );
} );

commander
.description( 'Update specific webdriver installs' )
.action( () => {
  console.log( commander.help() );
  //execFile( './node_modules/webdriver-manager/bin/webdriver-manager',  );
} )
.on( '--help', _ => {
  require( 'webdriver-manager' );
} );

commander.parse( process.argv );

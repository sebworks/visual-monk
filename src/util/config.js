
'use strict';

const nodeYaml = require( 'node-yaml' );

module.exports = nodeYaml.readSync( '../config.yaml' );

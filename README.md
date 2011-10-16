# diretto Task Service

The Task API is an additional service API that provides support for advanced task management between different platform users while reporting, but also thereafter. It represents an optional service API that does not belong to the core platform, although deployments will be beneficial in most scenarios.

## API

Please refer to the API documentation: http://diretto.github.com/diretto-api-doc/v2/diretto-ext/task.html

## Installation Guide

The setup of the task service implementation is similar to the setup of the main platform services. It requires: 

 - latest node.js 0.4.x
 - no NPM (self-contained dependencies)
 - CouchDB with CouchDB-Lucene extension

Before running the task node, it is necessary to push the CouchApp to the database. Please don't forget to set config params before deploying. 
The config file in `diretto-task-couchapp/vendor/diretto/config.js` requires valid endpoints URIs, otherwise service responses will contain invalid URIs later.

The node application itself must be configured using the `diretto-task-node/conf/task.json` file. It is especially important to set the `direttoMainServices.core.uri` to the valid base URI of the core API service of the instance this task service should work with.


tbd.

## License

	Copyright (c) 2011 Benjamin Erb

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

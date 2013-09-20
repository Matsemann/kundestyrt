var restify = require('restify');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var crypto = require('crypto');
var util = require('util');
var http = require('http');
var less = require('less');

var port = process.env.PORT || 9000;

var server = restify.createServer();
server.use(restify.bodyParser());

var root = path.resolve('app');

var WError = require('verror').WError;
var slice = Function.prototype.call.bind(Array.prototype.slice);

function codeToErrorName(code) {
    code = parseInt(code, 10);
    var status = http.STATUS_CODES[code];
    if (!status)
            return (false);


    var pieces = status.split(/\s+/);
    var str = '';
    pieces.forEach(function (s) {
            str += s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    });

    str = str.replace(/\W+/g, '');
    if (!/\w+Error$/.test(str))
            str += 'Error';

    return (str);
}

function HttpError(options) {
        options.constructorOpt = options.constructorOpt || HttpError;
        WError.apply(this, arguments);

        var self = this;
        var code = parseInt((options.statusCode || 500), 10);
        this.statusCode = code;
        this.body = options.body || {
                code: codeToErrorName(code),
                message: options.message || self.message
        };
        this.message = options.message || self.message;
}
util.inherits(HttpError, WError);

function RestError(options) {
        options.constructorOpt = options.constructorOpt || RestError;
        HttpError.apply(this, arguments);

        var self = this;
        this.restCode = options.restCode || 'Error';
        this.body = options.body || {
                code: self.restCode,
                message: options.message || self.message
        };
}
util.inherits(RestError, HttpError);

function ResourceNotFoundError(cause, message) {
    var index = 1;
    var opts = {
        restCode: 'ResourceNotFound',
        statusCode: 404
    };

    opts.constructorOpt = arguments.callee;

    if(cause && cause instanceof Error) {
        opts.cause = cause;
    } else if(typeof cause === 'object') {
        opts.body = cause.body;
        opts.cause = cause.cause;
        opts.message = cause.message;
        opts.statusCode = cause.statusCode || opts.statusCode;
    } else {
        index = 0;
    }

    var args = slice(arguments, index);
    args.unshift(opts);
    RestError.apply(this, args);
}
util.inherits(ResourceNotFoundError, RestError);

function LessResourceError(cause, message) {
    var index = 1;
    var opts = {
        restCode: 'LessResourceError',
        statusCode: 500
    };

    opts.constructorOpt = arguments.callee;

    if(cause && cause instanceof Error) {
        opts.cause = cause;
    } else if(typeof cause === 'object') {
        opts.body = cause.body;
        opts.cause = cause.cause;
        opts.message = cause.message;
        opts.statusCode = cause.statusCode || opts.statusCode;
    } else {
        index = 0;
    }

    var args = slice(arguments, index);
    args.unshift(opts);
    RestError.apply(this, args);
}

function serveNormal(file, request, response, next) {
    fs.stat(file, function(err, stats) {
        serveFileFromStats(file, err, stats, false, request, response, next);
    });
}

function serveFileFromStats(file, err, stats, isGzip, request, response, next) {
    if(err) {
        next(new ResourceNotFoundError(err, request.path()));
        return;
    } else if(!stats.isFile()) {
        next(new ResourceNotFoundError(request.path()));
        return;
    }

    if (response.handledGzip && isGzip) {
        response.handledGzip();
    }

    var fstream = fs.createReadStream(file + (isGzip ? '.gz' : ''));
    var maxAge = 3600; // 1hr
    fstream.once('open', function(fd) {
        response.cache({maxAge: maxAge});
        response.set('Content-Length', stats.size);
        response.set('Content-Type', mime.lookup(file));
        response.set('Last-Modified', stats.mtime);

        response.writeHead(200);
        fstream.pipe(response);
        fstream.once('end', function() {
            next(false);
        });
    });
}

function serveLess(file, request, response, next) {
    var parser = new less.Parser({
        paths: [root + '/styles'],
        filename: file
    });

    fs.readFile(file, {
        encoding: 'utf8'
    }, function(err, content) {
        if(err) {
            next(new LessResourceError(err, 'Error when reading less file'));
            return;
        }

        fs.stat(file, function(err, stats) {
            parser.parse(content, function(err, tree) {
                if(err) {
                    console.log(err);
                    next(new LessResourceError(err, 'Error when parsing less file'));
                    return;
                }

                var css = tree.toCSS({/*compress: true*/});
                var buffer = new Buffer(css, 'utf8');


                var maxAge = 3600; // 1hr
                response.cache({maxAge: maxAge});
                response.set('Content-Length', buffer.length);
                response.set('Content-Type', 'text/css');
                response.set('Last-Modified', stats.mtime);

                response.writeHead(200);
                response.end(buffer);
            });
        });
    });
}

server.get(/^(?!api\/)/, function(request, response, next) {
    console.log('Request for: ' + request.url);
    var file = root + request.url;
    fs.stat(file, function(err, stats) {
        if(err || !stats.isFile()) {
            file = root + '/index.html';
        }

        if(path.extname(file) == '.less') {
            serveLess(file, request, response, next);
            return;
        }

        if(request.acceptsEncoding('gzip')) {
            fs.stat(file + '.gz', function(err, stats) {
                if(!err) {
                    res.setHeader('Content-Encoding', 'gzip');
                    serveFileFromStats(file, err, stats, true, request, response, next);
                } else {
                    serveNormal(file, request, response, next);
                }
            });
        } else {
            serveNormal(file, request, response, next);
        }
    });
});

server.listen(port, function() {
    console.log('Listening on port ' + port);
});
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var events = _interopDefault(require('events'));
var stream = _interopDefault(require('stream'));
var url = _interopDefault(require('url'));
var util = _interopDefault(require('util'));
var http = _interopDefault(require('http'));
var https = _interopDefault(require('https'));
var dns = _interopDefault(require('dns'));
var os = _interopDefault(require('os'));
var zlib = _interopDefault(require('zlib'));
var tls = _interopDefault(require('tls'));
var net = _interopDefault(require('net'));

/* @flow */
/*::

type DotenvParseOptions = {
  debug?: boolean
}

// keys and values from src
type DotenvParseOutput = { [string]: string }

type DotenvConfigOptions = {
  path?: string, // path to .env file
  encoding?: string, // encoding of .env file
  debug?: string // turn on logging for debugging purposes
}

type DotenvConfigOutput = {
  parsed?: DotenvParseOutput,
  error?: Error
}

*/




function log (message /*: string */) {
  console.log(`[dotenv][DEBUG] ${message}`);
}

const NEWLINE = '\n';
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

// Parses src into an Object
function parse (src /*: string | Buffer */, options /*: ?DotenvParseOptions */) /*: DotenvParseOutput */ {
  const debug = Boolean(options && options.debug);
  const obj = {};

  // convert Buffers before splitting into lines and processing
  src.toString().split(NEWLINES_MATCH).forEach(function (line, idx) {
    // matching "KEY' and 'VAL' in 'KEY=VAL'
    const keyValueArr = line.match(RE_INI_KEY_VAL);
    // matched?
    if (keyValueArr != null) {
      const key = keyValueArr[1];
      // default undefined or missing values to empty string
      let val = (keyValueArr[2] || '');
      const end = val.length - 1;
      const isDoubleQuoted = val[0] === '"' && val[end] === '"';
      const isSingleQuoted = val[0] === "'" && val[end] === "'";

      // if single or double quoted, remove quotes
      if (isSingleQuoted || isDoubleQuoted) {
        val = val.substring(1, end);

        // if double quoted, expand newlines
        if (isDoubleQuoted) {
          val = val.replace(RE_NEWLINES, NEWLINE);
        }
      } else {
        // remove surrounding whitespace
        val = val.trim();
      }

      obj[key] = val;
    } else if (debug) {
      log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
    }
  });

  return obj
}

// Populates process.env from .env file
function config (options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
  let dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding /*: string */ = 'utf8';
  let debug = false;

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path;
    }
    if (options.encoding != null) {
      encoding = options.encoding;
    }
    if (options.debug != null) {
      debug = true;
    }
  }

  try {
    // specifying an encoding returns a string instead of a buffer
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

    Object.keys(parsed).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key];
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
      }
    });

    return { parsed }
  } catch (e) {
    return { error: e }
  }
}

var config_1 = config;
var parse_1 = parse;

var main = {
	config: config_1,
	parse: parse_1
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
var wrappy_1 = wrappy;
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length-1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret
  }
}

var once_1 = wrappy_1(once);
var strict = wrappy_1(onceStrict);

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  });
});

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  f.called = false;
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f
}
once_1.strict = strict;

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once_1(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream = eos;

// we only need fs to get the ReadStream and WriteStream prototypes

var noop$1 = function () {};
var ancient = /^v?\.0/.test(process.version);

var isFn = function (fn) {
  return typeof fn === 'function'
};

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop$1) || stream instanceof (fs.WriteStream || noop$1)) && isFn(stream.close)
};

var isRequest$1 = function (stream) {
  return stream.setHeader && isFn(stream.abort)
};

var destroyer = function (stream, reading, writing, callback) {
  callback = once_1(callback);

  var closed = false;
  stream.on('close', function () {
    closed = true;
  });

  endOfStream(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true;
    callback();
  });

  var destroyed = false;
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true;

    if (isFS(stream)) return stream.close(noop$1) // use close for fs streams to avoid fd leaks
    if (isRequest$1(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'));
  }
};

var call = function (fn) {
  fn();
};

var pipe = function (from, to) {
  return from.pipe(to)
};

var pump = function () {
  var streams = Array.prototype.slice.call(arguments);
  var callback = isFn(streams[streams.length - 1] || noop$1) && streams.pop() || noop$1;

  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return
      destroys.forEach(call);
      callback(error);
    })
  });

  return streams.reduce(pipe)
};

var pump_1 = pump;

const {PassThrough: PassThroughStream} = stream;

var bufferStream = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	let stream;
	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		stream = pump_1(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

var getStream_1 = getStream;
// TODO: Remove this for the next major release
var default_1 = getStream;
var buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
var array = (stream, options) => getStream(stream, {...options, array: true});
var MaxBufferError_1 = MaxBufferError;
getStream_1.default = default_1;
getStream_1.buffer = buffer;
getStream_1.array = array;
getStream_1.MaxBufferError = MaxBufferError_1;

class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...arguments_) => {
			return new PCancelable((resolve, reject, onCancel) => {
				arguments_.push(onCancel);
				// eslint-disable-next-line promise/prefer-await-to-then
				userFn(...arguments_).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.');
				}

				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: boolean => {
						this._rejectOnCancel = boolean;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		// eslint-disable-next-line promise/prefer-await-to-then
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

var pCancelable = PCancelable;
var CancelError_1 = CancelError;
pCancelable.CancelError = CancelError_1;

var dist = createCommonjsModule(function (module, exports) {
/// <reference lib="esnext"/>
/// <reference lib="dom"/>
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Use the `URL` global when targeting Node.js 10
const URLGlobal = typeof URL === 'undefined' ? url.URL : URL;
const { toString } = Object.prototype;
const isOfType = (type) => (value) => typeof value === type;
const getObjectType = (value) => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return undefined;
};
const isObjectOfType = (type) => (value) => getObjectType(value) === type;
function is(value) {
    switch (value) {
        case null:
            return "null" /* null */;
        case true:
        case false:
            return "boolean" /* boolean */;
    }
    switch (typeof value) {
        case 'undefined':
            return "undefined" /* undefined */;
        case 'string':
            return "string" /* string */;
        case 'number':
            return "number" /* number */;
        case 'bigint':
            return "bigint" /* bigint */;
        case 'symbol':
            return "symbol" /* symbol */;
    }
    if (is.function_(value)) {
        return "Function" /* Function */;
    }
    if (is.observable(value)) {
        return "Observable" /* Observable */;
    }
    if (is.array(value)) {
        return "Array" /* Array */;
    }
    if (is.buffer(value)) {
        return "Buffer" /* Buffer */;
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return "Object" /* Object */;
}
is.undefined = isOfType('undefined');
is.string = isOfType('string');
const isNumberType = isOfType('number');
is.number = (value) => isNumberType(value) && !is.nan(value);
is.bigint = isOfType('bigint');
// eslint-disable-next-line @typescript-eslint/ban-types
is.function_ = isOfType('function');
is.null_ = (value) => value === null;
is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
is.boolean = (value) => value === true || value === false;
is.symbol = isOfType('symbol');
is.numericString = (value) => is.string(value) && value.length > 0 && !Number.isNaN(Number(value));
is.array = Array.isArray;
is.buffer = (value) => !is.nullOrUndefined(value) && !is.nullOrUndefined(value.constructor) && is.function_(value.constructor.isBuffer) && value.constructor.isBuffer(value);
is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
is.object = (value) => !is.null_(value) && (typeof value === 'object' || is.function_(value));
is.iterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.iterator]);
is.asyncIterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.asyncIterator]);
is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
is.nativePromise = (value) => isObjectOfType("Promise" /* Promise */)(value);
const hasPromiseAPI = (value) => is.object(value) &&
    is.function_(value.then) && // eslint-disable-line promise/prefer-await-to-then
    is.function_(value.catch);
is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
is.generatorFunction = isObjectOfType("GeneratorFunction" /* GeneratorFunction */);
// eslint-disable-next-line @typescript-eslint/ban-types
is.asyncFunction = isObjectOfType("AsyncFunction" /* AsyncFunction */);
// eslint-disable-next-line no-prototype-builtins, @typescript-eslint/ban-types
is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
is.regExp = isObjectOfType("RegExp" /* RegExp */);
is.date = isObjectOfType("Date" /* Date */);
is.error = isObjectOfType("Error" /* Error */);
is.map = (value) => isObjectOfType("Map" /* Map */)(value);
is.set = (value) => isObjectOfType("Set" /* Set */)(value);
is.weakMap = (value) => isObjectOfType("WeakMap" /* WeakMap */)(value);
is.weakSet = (value) => isObjectOfType("WeakSet" /* WeakSet */)(value);
is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
is.bigInt64Array = isObjectOfType("BigInt64Array" /* BigInt64Array */);
is.bigUint64Array = isObjectOfType("BigUint64Array" /* BigUint64Array */);
is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
is.dataView = isObjectOfType("DataView" /* DataView */);
is.directInstanceOf = (instance, class_) => Object.getPrototypeOf(instance) === class_.prototype;
is.urlInstance = (value) => isObjectOfType("URL" /* URL */)(value);
is.urlString = (value) => {
    if (!is.string(value)) {
        return false;
    }
    try {
        new URLGlobal(value); // eslint-disable-line no-new
        return true;
    }
    catch (_a) {
        return false;
    }
};
// TODO: Use the `not` operator with a type guard here when it's available.
// Example: `is.truthy = (value: unknown): value is (not false | not 0 | not '' | not undefined | not null) => Boolean(value);`
is.truthy = (value) => Boolean(value);
// Example: `is.falsy = (value: unknown): value is (not true | 0 | '' | undefined | null) => Boolean(value);`
is.falsy = (value) => !value;
is.nan = (value) => Number.isNaN(value);
const primitiveTypeOfTypes = new Set([
    'undefined',
    'string',
    'number',
    'bigint',
    'boolean',
    'symbol'
]);
is.primitive = (value) => is.null_(value) || primitiveTypeOfTypes.has(typeof value);
is.integer = (value) => Number.isInteger(value);
is.safeInteger = (value) => Number.isSafeInteger(value);
is.plainObject = (value) => {
    // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
    if (getObjectType(value) !== "Object" /* Object */) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
};
const typedArrayTypes = new Set([
    "Int8Array" /* Int8Array */,
    "Uint8Array" /* Uint8Array */,
    "Uint8ClampedArray" /* Uint8ClampedArray */,
    "Int16Array" /* Int16Array */,
    "Uint16Array" /* Uint16Array */,
    "Int32Array" /* Int32Array */,
    "Uint32Array" /* Uint32Array */,
    "Float32Array" /* Float32Array */,
    "Float64Array" /* Float64Array */,
    "BigInt64Array" /* BigInt64Array */,
    "BigUint64Array" /* BigUint64Array */
]);
is.typedArray = (value) => {
    const objectType = getObjectType(value);
    if (objectType === undefined) {
        return false;
    }
    return typedArrayTypes.has(objectType);
};
const isValidLength = (value) => is.safeInteger(value) && value >= 0;
is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
is.inRange = (value, range) => {
    if (is.number(range)) {
        return value >= Math.min(0, range) && value <= Math.max(range, 0);
    }
    if (is.array(range) && range.length === 2) {
        return value >= Math.min(...range) && value <= Math.max(...range);
    }
    throw new TypeError(`Invalid range: ${JSON.stringify(range)}`);
};
const NODE_TYPE_ELEMENT = 1;
const DOM_PROPERTIES_TO_CHECK = [
    'innerHTML',
    'ownerDocument',
    'style',
    'attributes',
    'nodeValue'
];
is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
    !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
is.observable = (value) => {
    if (!value) {
        return false;
    }
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native
    if (value[Symbol.observable] && value === value[Symbol.observable]()) {
        return true;
    }
    if (value['@@observable'] && value === value['@@observable']()) {
        return true;
    }
    return false;
};
is.nodeStream = (value) => is.object(value) && is.function_(value.pipe) && !is.observable(value);
is.infinite = (value) => value === Infinity || value === -Infinity;
const isAbsoluteMod2 = (remainder) => (value) => is.integer(value) && Math.abs(value % 2) === remainder;
is.evenInteger = isAbsoluteMod2(0);
is.oddInteger = isAbsoluteMod2(1);
is.emptyArray = (value) => is.array(value) && value.length === 0;
is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
is.emptyString = (value) => is.string(value) && value.length === 0;
// TODO: Use `not ''` when the `not` operator is available.
is.nonEmptyString = (value) => is.string(value) && value.length > 0;
const isWhiteSpaceString = (value) => is.string(value) && /\S/.test(value) === false;
is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
// TODO: Use `not` operator here to remove `Map` and `Set` from type guard:
// - https://github.com/Microsoft/TypeScript/pull/29317
is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
is.emptySet = (value) => is.set(value) && value.size === 0;
is.nonEmptySet = (value) => is.set(value) && value.size > 0;
is.emptyMap = (value) => is.map(value) && value.size === 0;
is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
const predicateOnArray = (method, predicate, values) => {
    if (is.function_(predicate) === false) {
        throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
    }
    if (values.length === 0) {
        throw new TypeError('Invalid number of values');
    }
    return method.call(values, predicate);
};
is.any = (predicate, ...values) => predicateOnArray(Array.prototype.some, predicate, values);
is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
// Some few keywords are reserved, but we'll populate them for Node.js users
// See https://github.com/Microsoft/TypeScript/issues/2536
Object.defineProperties(is, {
    class: {
        value: is.class_
    },
    function: {
        value: is.function_
    },
    null: {
        value: is.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;

});

unwrapExports(dist);

var errors = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class GotError extends Error {
    constructor(message, error, options) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = 'GotError';
        if (!dist.default.undefined(error.code)) {
            this.code = error.code;
        }
        Object.defineProperty(this, 'options', {
            // This fails because of TS 3.7.2 useDefineForClassFields
            // Ref: https://github.com/microsoft/TypeScript/issues/34972
            enumerable: false,
            value: options
        });
        // Recover the original stacktrace
        if (!dist.default.undefined(error.stack)) {
            const indexOfMessage = this.stack.indexOf(this.message) + this.message.length;
            const thisStackTrace = this.stack.slice(indexOfMessage).split('\n').reverse();
            const errorStackTrace = error.stack.slice(error.stack.indexOf(error.message) + error.message.length).split('\n').reverse();
            // Remove duplicated traces
            while (errorStackTrace.length !== 0 && errorStackTrace[0] === thisStackTrace[0]) {
                thisStackTrace.shift();
            }
            this.stack = `${this.stack.slice(0, indexOfMessage)}${thisStackTrace.reverse().join('\n')}${errorStackTrace.reverse().join('\n')}`;
        }
    }
}
exports.GotError = GotError;
class CacheError extends GotError {
    constructor(error, options) {
        super(error.message, error, options);
        this.name = 'CacheError';
    }
}
exports.CacheError = CacheError;
class RequestError extends GotError {
    constructor(error, options) {
        super(error.message, error, options);
        this.name = 'RequestError';
    }
}
exports.RequestError = RequestError;
class ReadError extends GotError {
    constructor(error, options) {
        super(error.message, error, options);
        this.name = 'ReadError';
    }
}
exports.ReadError = ReadError;
class ParseError extends GotError {
    constructor(error, response, options) {
        super(`${error.message} in "${options.url.toString()}"`, error, options);
        this.name = 'ParseError';
        Object.defineProperty(this, 'response', {
            enumerable: false,
            value: response
        });
    }
}
exports.ParseError = ParseError;
class HTTPError extends GotError {
    constructor(response, options) {
        super(`Response code ${response.statusCode} (${response.statusMessage})`, {}, options);
        this.name = 'HTTPError';
        Object.defineProperty(this, 'response', {
            enumerable: false,
            value: response
        });
    }
}
exports.HTTPError = HTTPError;
class MaxRedirectsError extends GotError {
    constructor(response, maxRedirects, options) {
        super(`Redirected ${maxRedirects} times. Aborting.`, {}, options);
        this.name = 'MaxRedirectsError';
        Object.defineProperty(this, 'response', {
            enumerable: false,
            value: response
        });
    }
}
exports.MaxRedirectsError = MaxRedirectsError;
class UnsupportedProtocolError extends GotError {
    constructor(options) {
        super(`Unsupported protocol "${options.url.protocol}"`, {}, options);
        this.name = 'UnsupportedProtocolError';
    }
}
exports.UnsupportedProtocolError = UnsupportedProtocolError;
class TimeoutError extends GotError {
    constructor(error, timings, options) {
        super(error.message, error, options);
        this.name = 'TimeoutError';
        this.event = error.event;
        this.timings = timings;
    }
}
exports.TimeoutError = TimeoutError;

exports.CancelError = pCancelable.CancelError;
});

unwrapExports(errors);
var errors_1 = errors.GotError;
var errors_2 = errors.CacheError;
var errors_3 = errors.RequestError;
var errors_4 = errors.ReadError;
var errors_5 = errors.ParseError;
var errors_6 = errors.HTTPError;
var errors_7 = errors.MaxRedirectsError;
var errors_8 = errors.UnsupportedProtocolError;
var errors_9 = errors.TimeoutError;
var errors_10 = errors.CancelError;

// TODO: Use the `URL` global when targeting Node.js 10
const URLParser = typeof URL === 'undefined' ? url.URL : URL;

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const parts = urlString.match(/^data:(.*?),(.*?)(?:#(.*))?$/);

	if (!parts) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	const mediaType = parts[1].split(';');
	const body = parts[2];
	const hash = stripHash ? '' : parts[3];

	let base64 = false;

	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		base64 = true;
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [
		...attributes
	];

	if (base64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${base64 ? body.trim() : body}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	// TODO: Remove this at some point in the future
	if (Reflect.has(options, 'normalizeHttps')) {
		throw new Error('options.normalizeHttps is renamed to options.forceHttp');
	}

	if (Reflect.has(options, 'normalizeHttp')) {
		throw new Error('options.normalizeHttp is renamed to options.forceHttps');
	}

	if (Reflect.has(options, 'stripFragment')) {
		throw new Error('options.stripFragment is renamed to options.stripHash');
	}

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URLParser(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		urlObj.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = '';
		urlObj.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = '';
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		// TODO: Use the following instead when targeting Node.js 10
		// `urlObj.pathname = urlObj.pathname.replace(/(?<!https?:)\/{2,}/g, '/');`
		urlObj.pathname = urlObj.pathname.replace(/((?!:).|^)\/{2,}/g, (_, p1) => {
			if (/^(?!\/)/g.test(p1)) {
				return `${p1}/`;
			}

			return '/';
		});
	}

	// Decode URI octets
	if (urlObj.pathname) {
		urlObj.pathname = decodeURI(urlObj.pathname);
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.([a-z\-\d]{2,63})\.([a-z.]{2,5})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 2).
			// The extension should be max 5 at length (min: 2).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key);
			}
		}
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	// Remove ending `/`
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
};

var normalizeUrl_1 = normalizeUrl;
// TODO: Remove this for the next major release
var default_1$1 = normalizeUrl;
normalizeUrl_1.default = default_1$1;

// rfc7231 6.1
const statusCodeCacheableByDefault = [
    200,
    203,
    204,
    206,
    300,
    301,
    404,
    405,
    410,
    414,
    501,
];

// This implementation does not understand partial responses (206)
const understoodStatuses = [
    200,
    203,
    204,
    300,
    301,
    302,
    303,
    307,
    308,
    404,
    405,
    410,
    414,
    501,
];

const hopByHopHeaders = {
    date: true, // included, because we add Age update Date
    connection: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
};
const excludedFromRevalidationUpdate = {
    // Since the old body is reused, it doesn't make sense to change properties of the body
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;

    // TODO: When there is more than one value present for a given directive (e.g., two Expires header fields, multiple Cache-Control: max-age directives),
    // the directive's value is considered invalid. Caches are encouraged to consider responses that have invalid freshness information to be stale
    const parts = header.trim().split(/\s*,\s*/); // TODO: lame parsing
    for (const part of parts) {
        const [k, v] = part.split(/\s*=\s*/, 2);
        cc[k] = v === undefined ? true : v.replace(/^"|"$/g, ''); // TODO: lame unquoting
    }

    return cc;
}

function formatCacheControl(cc) {
    let parts = [];
    for (const k in cc) {
        const v = cc[k];
        parts.push(v === true ? k : k + '=' + v);
    }
    if (!parts.length) {
        return undefined;
    }
    return parts.join(', ');
}

var httpCacheSemantics = class CachePolicy {
    constructor(
        req,
        res,
        {
            shared,
            cacheHeuristic,
            immutableMinTimeToLive,
            ignoreCargoCult,
            trustServerDate,
            _fromObject,
        } = {}
    ) {
        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error('Response headers missing');
        }
        this._assertRequestHasHeaders(req);

        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._trustServerDate =
            undefined !== trustServerDate ? trustServerDate : true;
        this._cacheHeuristic =
            undefined !== cacheHeuristic ? cacheHeuristic : 0.1; // 10% matches IE
        this._immutableMinTtl =
            undefined !== immutableMinTimeToLive
                ? immutableMinTimeToLive
                : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null; // Don't keep all request headers if they won't be used
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        // Assume that if someone uses legacy, non-standard uncecessary options they don't understand caching,
        // so there's no point stricly adhering to the blindly copy&pasted directives.
        if (
            ignoreCargoCult &&
            'pre-check' in this._rescc &&
            'post-check' in this._rescc
        ) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = Object.assign({}, this._resHeaders, {
                'cache-control': formatCacheControl(this._rescc),
            });
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        // When the Cache-Control header field is not present in a request, caches MUST consider the no-cache request pragma-directive
        // as having the same effect as if "Cache-Control: no-cache" were present (see Section 5.2.1).
        if (
            res.headers['cache-control'] == null &&
            /no-cache/.test(res.headers.pragma)
        ) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        // The "no-store" request directive indicates that a cache MUST NOT store any part of either this request or any response to it.
        return !!(
            !this._reqcc['no-store'] &&
            // A cache MUST NOT store a response to any request, unless:
            // The request method is understood by the cache and defined as being cacheable, and
            ('GET' === this._method ||
                'HEAD' === this._method ||
                ('POST' === this._method && this._hasExplicitExpiration())) &&
            // the response status code is understood by the cache, and
            understoodStatuses.indexOf(this._status) !== -1 &&
            // the "no-store" cache directive does not appear in request or response header fields, and
            !this._rescc['no-store'] &&
            // the "private" response directive does not appear in the response, if the cache is shared, and
            (!this._isShared || !this._rescc.private) &&
            // the Authorization header field does not appear in the request, if the cache is shared,
            (!this._isShared ||
                this._noAuthorization ||
                this._allowsStoringAuthenticated()) &&
            // the response either:
            // contains an Expires header field, or
            (this._resHeaders.expires ||
                // contains a max-age response directive, or
                // contains a s-maxage response directive and the cache is shared, or
                // contains a public response directive.
                this._rescc.public ||
                this._rescc['max-age'] ||
                this._rescc['s-maxage'] ||
                // has a status code that is defined as cacheable by default
                statusCodeCacheableByDefault.indexOf(this._status) !== -1)
        );
    }

    _hasExplicitExpiration() {
        // 4.2.1 Calculating Freshness Lifetime
        return (
            (this._isShared && this._rescc['s-maxage']) ||
            this._rescc['max-age'] ||
            this._resHeaders.expires
        );
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error('Request headers missing');
        }
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);

        // When presented with a request, a cache MUST NOT reuse a stored response, unless:
        // the presented request does not contain the no-cache pragma (Section 5.4), nor the no-cache cache directive,
        // unless the stored response is successfully validated (Section 4.3), and
        const requestCC = parseCacheControl(req.headers['cache-control']);
        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (
            requestCC['min-fresh'] &&
            this.timeToLive() < 1000 * requestCC['min-fresh']
        ) {
            return false;
        }

        // the stored response is either:
        // fresh, or allowed to be served stale
        if (this.stale()) {
            const allowsStale =
                requestCC['max-stale'] &&
                !this._rescc['must-revalidate'] &&
                (true === requestCC['max-stale'] ||
                    requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        // The presented effective request URI and that of the stored response match, and
        return (
            (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            // the request method associated with the stored response allows it to be used for the presented request, and
            (!req.method ||
                this._method === req.method ||
                (allowHeadMethod && 'HEAD' === req.method)) &&
            // selecting header fields nominated by the stored response (if any) match those presented, and
            this._varyMatches(req)
        );
    }

    _allowsStoringAuthenticated() {
        //  following Cache-Control response directives (Section 5.2.2) have such an effect: must-revalidate, public, and s-maxage.
        return (
            this._rescc['must-revalidate'] ||
            this._rescc.public ||
            this._rescc['s-maxage']
        );
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        // A Vary header field-value of "*" always fails to match
        if (this._resHeaders.vary === '*') {
            return false;
        }

        const fields = this._resHeaders.vary
            .trim()
            .toLowerCase()
            .split(/\s*,\s*/);
        for (const name of fields) {
            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = {};
        for (const name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }
        // 9.1.  Connection
        if (inHeaders.connection) {
            const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (const name of tokens) {
                delete headers[name];
            }
        }
        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => {
                return !/^\s*1[0-9][0-9]/.test(warning);
            });
            if (!warnings.length) {
                delete headers.warning;
            } else {
                headers.warning = warnings.join(',').trim();
            }
        }
        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        // A cache SHOULD generate 113 warning if it heuristically chose a freshness
        // lifetime greater than 24 hours and the response's age is greater than 24 hours.
        if (
            age > 3600 * 24 &&
            !this._hasExplicitExpiration() &&
            this.maxAge() > 3600 * 24
        ) {
            headers.warning =
                (headers.warning ? `${headers.warning}, ` : '') +
                '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        headers.date = new Date(this.now()).toUTCString();
        return headers;
    }

    /**
     * Value of the Date response header or current time if Date was demed invalid
     * @return timestamp
     */
    date() {
        if (this._trustServerDate) {
            return this._serverDate();
        }
        return this._responseTime;
    }

    _serverDate() {
        const dateValue = Date.parse(this._resHeaders.date);
        if (isFinite(dateValue)) {
            const maxClockDrift = 8 * 3600 * 1000;
            const clockDrift = Math.abs(this._responseTime - dateValue);
            if (clockDrift < maxClockDrift) {
                return dateValue;
            }
        }
        return this._responseTime;
    }

    /**
     * Value of the Age header, in seconds, updated for the current time.
     * May be fractional.
     *
     * @return Number
     */
    age() {
        let age = Math.max(0, (this._responseTime - this.date()) / 1000);
        if (this._resHeaders.age) {
            let ageValue = this._ageValue();
            if (ageValue > age) age = ageValue;
        }

        const residentTime = (this.now() - this._responseTime) / 1000;
        return age + residentTime;
    }

    _ageValue() {
        const ageValue = parseInt(this._resHeaders.age);
        return isFinite(ageValue) ? ageValue : 0;
    }

    /**
     * Value of applicable max-age (or heuristic equivalent) in seconds. This counts since response's `Date`.
     *
     * For an up-to-date value, see `timeToLive()`.
     *
     * @return Number
     */
    maxAge() {
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        // Shared responses with cookies are cacheable according to the RFC, but IMHO it'd be unwise to do so by default
        // so this implementation requires explicit opt-in via public header
        if (
            this._isShared &&
            (this._resHeaders['set-cookie'] &&
                !this._rescc.public &&
                !this._rescc.immutable)
        ) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) {
                return 0;
            }
            // if a response includes the s-maxage directive, a shared cache recipient MUST ignore the Expires field.
            if (this._rescc['s-maxage']) {
                return parseInt(this._rescc['s-maxage'], 10);
            }
        }

        // If a response includes a Cache-Control field with the max-age directive, a recipient MUST ignore the Expires field.
        if (this._rescc['max-age']) {
            return parseInt(this._rescc['max-age'], 10);
        }

        const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;

        const dateValue = this._serverDate();
        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            // A cache recipient MUST interpret invalid date formats, especially the value "0", as representing a time in the past (i.e., "already expired").
            if (Number.isNaN(expires) || expires < dateValue) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - dateValue) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && dateValue > lastModified) {
                return Math.max(
                    defaultMinTtl,
                    ((dateValue - lastModified) / 1000) * this._cacheHeuristic
                );
            }
        }

        return defaultMinTtl;
    }

    timeToLive() {
        return Math.max(0, this.maxAge() - this.age()) * 1000;
    }

    stale() {
        return this.maxAge() <= this.age();
    }

    static fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    }

    _fromObject(obj) {
        if (this._responseTime) throw Error('Reinitialized');
        if (!obj || obj.v !== 1) throw Error('Invalid serialization');

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl =
            obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    }

    toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc,
        };
    }

    /**
     * Headers for sending to the origin server to revalidate stale response.
     * Allows server to return 304 to allow reuse of the previous response.
     *
     * Hop by hop headers are always stripped.
     * Revalidation headers may be added or removed, depending on request.
     */
    revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        // This implementation does not understand range requests
        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            // revalidation allowed via HEAD
            // not for the same resource, or wasn't allowed to be cached anyway
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        /* MUST send that entity-tag in any cache validation request (using If-Match or If-None-Match) if an entity-tag has been provided by the origin server. */
        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        // Clients MAY issue simple (non-subrange) GET requests with either weak validators or strong validators. Clients MUST NOT use weak validators in other forms of request.
        const forbidsWeakValidators =
            headers['accept-ranges'] ||
            headers['if-match'] ||
            headers['if-unmodified-since'] ||
            (this._method && this._method != 'GET');

        /* SHOULD send the Last-Modified value in non-subrange cache validation requests (using If-Modified-Since) if only a Last-Modified value has been provided by the origin server.
        Note: This implementation does not understand partial responses (206) */
        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                const etags = headers['if-none-match']
                    .split(/,/)
                    .filter(etag => {
                        return !/^\s*W\//.test(etag);
                    });
                if (!etags.length) {
                    delete headers['if-none-match'];
                } else {
                    headers['if-none-match'] = etags.join(',').trim();
                }
            }
        } else if (
            this._resHeaders['last-modified'] &&
            !headers['if-modified-since']
        ) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    /**
     * Creates new CachePolicy with information combined from the previews response,
     * and the new revalidation response.
     *
     * Returns {policy, modified} where modified is a boolean indicating
     * whether the response body has been modified, and old cached body can't be used.
     *
     * @return {Object} {policy: CachePolicy, modified: Boolean}
     */
    revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if (!response || !response.headers) {
            throw Error('Response headers missing');
        }

        // These aren't going to be supported exactly, since one CachePolicy object
        // doesn't know about all the other cached objects.
        let matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (
            response.headers.etag &&
            !/^\s*W\//.test(response.headers.etag)
        ) {
            // "All of the stored responses with the same strong validator are selected.
            // If none of the stored responses contain the same strong validator,
            // then the cache MUST NOT use the new response to update any stored responses."
            matches =
                this._resHeaders.etag &&
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                    response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            // "If the new response contains a weak validator and that validator corresponds
            // to one of the cache's stored responses,
            // then the most recent of those matching stored responses is selected for update."
            matches =
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches =
                this._resHeaders['last-modified'] ===
                response.headers['last-modified'];
        } else {
            // If the new response does not include any form of validator (such as in the case where
            // a client generates an If-Modified-Since request from a source other than the Last-Modified
            // response header field), and there is only one stored response, and that stored response also
            // lacks a validator, then that stored response is selected for update.
            if (
                !this._resHeaders.etag &&
                !this._resHeaders['last-modified'] &&
                !response.headers.etag &&
                !response.headers['last-modified']
            ) {
                matches = true;
            }
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                // Client receiving 304 without body, even if it's invalid/mismatched has no option
                // but to reuse a cached body. We don't have a good way to tell clients to do
                // error recovery in such case.
                modified: response.status != 304,
                matches: false,
            };
        }

        // use other header fields provided in the 304 (Not Modified) response to replace all instances
        // of the corresponding header fields in the stored response.
        const headers = {};
        for (const k in this._resHeaders) {
            headers[k] =
                k in response.headers && !excludedFromRevalidationUpdate[k]
                    ? response.headers[k]
                    : this._resHeaders[k];
        }

        const newResponse = Object.assign({}, response, {
            status: this._status,
            method: this._method,
            headers,
        });
        return {
            policy: new this.constructor(request, newResponse, {
                shared: this._isShared,
                cacheHeuristic: this._cacheHeuristic,
                immutableMinTimeToLive: this._immutableMinTtl,
                trustServerDate: this._trustServerDate,
            }),
            modified: false,
            matches: true,
        };
    }
};

var lowercaseKeys = object => {
	const result = {};

	for (const [key, value] of Object.entries(object)) {
		result[key.toLowerCase()] = value;
	}

	return result;
};

const Readable = stream.Readable;


class Response extends Readable {
	constructor(statusCode, headers, body, url) {
		if (typeof statusCode !== 'number') {
			throw new TypeError('Argument `statusCode` should be a number');
		}
		if (typeof headers !== 'object') {
			throw new TypeError('Argument `headers` should be an object');
		}
		if (!(body instanceof Buffer)) {
			throw new TypeError('Argument `body` should be a buffer');
		}
		if (typeof url !== 'string') {
			throw new TypeError('Argument `url` should be a string');
		}

		super();
		this.statusCode = statusCode;
		this.headers = lowercaseKeys(headers);
		this.body = body;
		this.url = url;
	}

	_read() {
		this.push(this.body);
		this.push(null);
	}
}

var src = Response;

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

var mimicResponse = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};

const PassThrough = stream.PassThrough;


const cloneResponse = response => {
	if (!(response && response.pipe)) {
		throw new TypeError('Parameter `response` must be a response stream.');
	}

	const clone = new PassThrough();
	mimicResponse(response, clone);

	return response.pipe(clone);
};

var src$1 = cloneResponse;

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

var stringify = function stringify (o) {
  if('undefined' == typeof o) return o

  if(o && Buffer.isBuffer(o))
    return JSON.stringify(':base64:' + o.toString('base64'))

  if(o && o.toJSON)
    o =  o.toJSON();

  if(o && 'object' === typeof o) {
    var s = '';
    var array = Array.isArray(o);
    s = array ? '[' : '{';
    var first = true;

    for(var k in o) {
      var ignore = 'function' == typeof o[k] || (!array && 'undefined' === typeof o[k]);
      if(Object.hasOwnProperty.call(o, k) && !ignore) {
        if(!first)
          s += ',';
        first = false;
        if (array) {
          if(o[k] == undefined)
            s += 'null';
          else
            s += stringify(o[k]);
        } else if (o[k] !== void(0)) {
          s += stringify(k) + ':' + stringify(o[k]);
        }
      }
    }

    s += array ? ']' : '}';

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else if ('undefined' === typeof o) {
    return 'null';
  } else
    return JSON.stringify(o)
};

var parse$1 = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return new Buffer(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
};

var jsonBuffer = {
	stringify: stringify,
	parse: parse$1
};

const loadStore = opts => {
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (commonjsRequire())(opts);
	}
	return new Map();
};

class Keyv extends events {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{
				namespace: 'keyv',
				serialize: jsonBuffer.stringify,
				deserialize: jsonBuffer.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	get(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.get(key))
			.then(data => {
				data = (typeof data === 'string') ? this.opts.deserialize(data) : data;
				if (data === undefined) {
					return undefined;
				}
				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}
				return data.value;
			});
	}

	set(key, value, ttl) {
		key = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}
		if (ttl === 0) {
			ttl = undefined;
		}
		const store = this.opts.store;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return store.set(key, this.opts.serialize(value), ttl);
			})
			.then(() => true);
	}

	delete(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.delete(key));
	}

	clear() {
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.clear());
	}
}

var src$2 = Keyv;

class CacheableRequest {
	constructor(request, cacheAdapter) {
		if (typeof request !== 'function') {
			throw new TypeError('Parameter `request` must be a function');
		}

		this.cache = new src$2({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cacheable-request'
		});

		return this.createCacheableRequest(request);
	}

	createCacheableRequest(request) {
		return (opts, cb) => {
			let url$1;
			if (typeof opts === 'string') {
				url$1 = normalizeUrlObject(url.parse(opts));
				opts = {};
			} else if (opts instanceof url.URL) {
				url$1 = normalizeUrlObject(url.parse(opts.toString()));
				opts = {};
			} else {
				const [pathname, ...searchParts] = (opts.path || '').split('?');
				const search = searchParts.length > 0 ?
					`?${searchParts.join('?')}` :
					'';
				url$1 = normalizeUrlObject({ ...opts, pathname, search });
			}

			opts = {
				headers: {},
				method: 'GET',
				cache: true,
				strictTtl: false,
				automaticFailover: false,
				...opts,
				...urlObjectToRequestOptions(url$1)
			};
			opts.headers = lowercaseKeys(opts.headers);

			const ee = new events();
			const normalizedUrlString = normalizeUrl_1(
				url.format(url$1),
				{
					stripWWW: false,
					removeTrailingSlash: false,
					stripAuthentication: false
				}
			);
			const key = `${opts.method}:${normalizedUrlString}`;
			let revalidate = false;
			let madeRequest = false;

			const makeRequest = opts => {
				madeRequest = true;
				let requestErrored = false;
				let requestErrorCallback;

				const requestErrorPromise = new Promise(resolve => {
					requestErrorCallback = () => {
						if (!requestErrored) {
							requestErrored = true;
							resolve();
						}
					};
				});

				const handler = response => {
					if (revalidate && !opts.forceRefresh) {
						response.status = response.statusCode;
						const revalidatedPolicy = httpCacheSemantics.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts, response);
						if (!revalidatedPolicy.modified) {
							const headers = revalidatedPolicy.policy.responseHeaders();
							response = new src(revalidate.statusCode, headers, revalidate.body, revalidate.url);
							response.cachePolicy = revalidatedPolicy.policy;
							response.fromCache = true;
						}
					}

					if (!response.fromCache) {
						response.cachePolicy = new httpCacheSemantics(opts, response, opts);
						response.fromCache = false;
					}

					let clonedResponse;
					if (opts.cache && response.cachePolicy.storable()) {
						clonedResponse = src$1(response);

						(async () => {
							try {
								const bodyPromise = getStream_1.buffer(response);

								await Promise.race([
									requestErrorPromise,
									new Promise(resolve => response.once('end', resolve))
								]);

								if (requestErrored) {
									return;
								}

								const body = await bodyPromise;

								const value = {
									cachePolicy: response.cachePolicy.toObject(),
									url: response.url,
									statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
									body
								};

								let ttl = opts.strictTtl ? response.cachePolicy.timeToLive() : undefined;
								if (opts.maxTtl) {
									ttl = ttl ? Math.min(ttl, opts.maxTtl) : opts.maxTtl;
								}

								await this.cache.set(key, value, ttl);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					} else if (opts.cache && revalidate) {
						(async () => {
							try {
								await this.cache.delete(key);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					}

					ee.emit('response', clonedResponse || response);
					if (typeof cb === 'function') {
						cb(clonedResponse || response);
					}
				};

				try {
					const req = request(opts, handler);
					req.once('error', requestErrorCallback);
					req.once('abort', requestErrorCallback);
					ee.emit('request', req);
				} catch (error) {
					ee.emit('error', new CacheableRequest.RequestError(error));
				}
			};

			(async () => {
				const get = async opts => {
					await Promise.resolve();

					const cacheEntry = opts.cache ? await this.cache.get(key) : undefined;
					if (typeof cacheEntry === 'undefined') {
						return makeRequest(opts);
					}

					const policy = httpCacheSemantics.fromObject(cacheEntry.cachePolicy);
					if (policy.satisfiesWithoutRevalidation(opts) && !opts.forceRefresh) {
						const headers = policy.responseHeaders();
						const response = new src(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
						response.cachePolicy = policy;
						response.fromCache = true;

						ee.emit('response', response);
						if (typeof cb === 'function') {
							cb(response);
						}
					} else {
						revalidate = cacheEntry;
						opts.headers = policy.revalidationHeaders(opts);
						makeRequest(opts);
					}
				};

				const errorHandler = error => ee.emit('error', new CacheableRequest.CacheError(error));
				this.cache.once('error', errorHandler);
				ee.on('response', () => this.cache.removeListener('error', errorHandler));

				try {
					await get(opts);
				} catch (error) {
					if (opts.automaticFailover && !madeRequest) {
						makeRequest(opts);
					}

					ee.emit('error', new CacheableRequest.CacheError(error));
				}
			})();

			return ee;
		};
	}
}

function urlObjectToRequestOptions(url) {
	const options = { ...url };
	options.path = `${url.pathname || '/'}${url.search || ''}`;
	delete options.pathname;
	delete options.search;
	return options;
}

function normalizeUrlObject(url) {
	// If url was parsed by url.parse or new URL:
	// - hostname will be set
	// - host will be hostname[:port]
	// - port will be set if it was explicit in the parsed string
	// Otherwise, url was from request options:
	// - hostname or host may be set
	// - host shall not have port encoded
	return {
		protocol: url.protocol,
		auth: url.auth,
		hostname: url.hostname || url.host || 'localhost',
		port: url.port,
		pathname: url.pathname,
		search: url.search
	};
}

CacheableRequest.RequestError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'RequestError';
		Object.assign(this, error);
	}
};

CacheableRequest.CacheError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'CacheError';
		Object.assign(this, error);
	}
};

var src$3 = CacheableRequest;

const {Readable: ReadableStream} = stream;

const toReadableStream = input => (
	new ReadableStream({
		read() {
			this.push(input);
			this.push(null);
		}
	})
);

var toReadableStream_1 = toReadableStream;
// TODO: Remove this for the next major release
var default_1$2 = toReadableStream;
toReadableStream_1.default = default_1$2;

const {Resolver, V4MAPPED, ADDRCONFIG} = dns;
const {promisify} = util;



const map4to6 = entries => {
	for (const entry of entries) {
		entry.address = `::ffff:${entry.address}`;
		entry.family = 6;
	}
};

const getIfaceInfo = () => {
	let has4 = false;
	let has6 = false;

	for (const device of Object.values(os.networkInterfaces())) {
		for (const iface of device) {
			if (iface.internal) {
				continue;
			}

			if (iface.family === 'IPv6') {
				has6 = true;
			} else {
				has4 = true;
			}

			if (has4 && has6) {
				break;
			}
		}
	}

	return {has4, has6};
};

class CacheableLookup {
	constructor(options = {}) {
		const {cacheAdapter} = options;
		this.cache = new src$2({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cached-lookup'
		});

		this.maxTtl = options.maxTtl === 0 ? 0 : (options.maxTtl || Infinity);

		this._resolver = options.resolver || new Resolver();
		this._resolve4 = promisify(this._resolver.resolve4.bind(this._resolver));
		this._resolve6 = promisify(this._resolver.resolve6.bind(this._resolver));

		this.lookup = this.lookup.bind(this);
		this.lookupAsync = this.lookupAsync.bind(this);
	}

	set servers(servers) {
		this._resolver.setServers(servers);
	}

	get servers() {
		return this._resolver.getServers();
	}

	lookup(hostname, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		this.lookupAsync(hostname, {...options, throwNotFound: true}).then(result => {
			if (options.all) {
				callback(null, result);
			} else {
				callback(null, result.address, result.family);
			}
		}).catch(callback);
	}

	async lookupAsync(hostname, options = {}) {
		let cached;
		if (!options.family && options.all) {
			const [cached4, cached6] = await Promise.all([this.lookupAsync(hostname, {all: true, family: 4, details: true}), this.lookupAsync(hostname, {all: true, family: 6, details: true})]);
			cached = [...cached4, ...cached6];
		} else {
			cached = await this.query(hostname, options.family || 4);

			if (cached.length === 0 && options.family === 6 && options.hints & V4MAPPED) {
				cached = await this.query(hostname, 4);
				map4to6(cached);
			}
		}

		if (options.hints & ADDRCONFIG) {
			const {has4, has6} = getIfaceInfo();
			cached = cached.filter(entry => entry.family === 6 ? has6 : has4);
		}

		if (options.throwNotFound && cached.length === 0) {
			const error = new Error(`ENOTFOUND ${hostname}`);
			error.code = 'ENOTFOUND';
			error.hostname = hostname;

			throw error;
		}

		const now = Date.now();

		cached = cached.filter(entry => !Reflect.has(entry, 'expires') || now < entry.expires);

		if (!options.details) {
			cached = cached.map(entry => {
				return {
					address: entry.address,
					family: entry.family
				};
			});
		}

		if (options.all) {
			return cached;
		}

		if (cached.length === 0) {
			return undefined;
		}

		return this._getEntry(cached);
	}

	async query(hostname, family) {
		let cached = await this.cache.get(`${hostname}:${family}`);
		if (!cached) {
			cached = await this.queryAndCache(hostname, family);
		}

		return cached;
	}

	async queryAndCache(hostname, family) {
		const resolve = family === 4 ? this._resolve4 : this._resolve6;
		const entries = await resolve(hostname, {ttl: true});

		if (entries === undefined) {
			return [];
		}

		const now = Date.now();

		let cacheTtl = 0;
		for (const entry of entries) {
			cacheTtl = Math.max(cacheTtl, entry.ttl);
			entry.family = family;

			if (entry.ttl !== 0) {
				entry.expires = now + (entry.ttl * 1000);
			}
		}

		cacheTtl = Math.min(this.maxTtl, cacheTtl) * 1000;

		if (this.maxTtl !== 0 && cacheTtl !== 0) {
			await this.cache.set(`${hostname}:${family}`, entries, cacheTtl);
		}

		return entries;
	}

	_getEntry(entries) {
		return entries[Math.floor(Math.random() * entries.length)];
	}
}

var cacheableLookup = CacheableLookup;
var default_1$3 = CacheableLookup;
cacheableLookup.default = default_1$3;

var knownHookEvents_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const knownHookEvents = [
    'beforeError',
    'init',
    'beforeRequest',
    'beforeRedirect',
    'beforeRetry',
    'afterResponse'
];
exports.default = knownHookEvents;
});

unwrapExports(knownHookEvents_1);

var dynamicRequire = createCommonjsModule(function (module, exports) {
/* istanbul ignore file: used for webpack */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (moduleObject, moduleId) => moduleObject.require(moduleId);
});

unwrapExports(dynamicRequire);

var isFormData = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = (body) => dist.default.nodeStream(body) && dist.default.function_(body.getBoundary);
});

unwrapExports(isFormData);

var getBodySize = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




const statAsync = util.promisify(fs.stat);
exports.default = async (options) => {
    const { body, headers } = options;
    if (headers && 'content-length' in headers) {
        return Number(headers['content-length']);
    }
    if (!body) {
        return 0;
    }
    if (dist.default.string(body)) {
        return Buffer.byteLength(body);
    }
    if (dist.default.buffer(body)) {
        return body.length;
    }
    if (isFormData.default(body)) {
        return util.promisify(body.getLength.bind(body))();
    }
    if (body instanceof fs.ReadStream) {
        const { size } = await statAsync(body.path);
        return size;
    }
    return undefined;
};
});

unwrapExports(getBodySize);

var merge_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


function merge(target, ...sources) {
    for (const source of sources) {
        for (const [key, sourceValue] of Object.entries(source)) {
            const targetValue = target[key];
            if (dist.default.urlInstance(targetValue) && dist.default.string(sourceValue)) {
                // @ts-ignore TS doesn't recognise Target accepts string keys
                target[key] = new url.URL(sourceValue, targetValue);
            }
            else if (dist.default.plainObject(sourceValue)) {
                if (dist.default.plainObject(targetValue)) {
                    // @ts-ignore TS doesn't recognise Target accepts string keys
                    target[key] = merge({}, targetValue, sourceValue);
                }
                else {
                    // @ts-ignore TS doesn't recognise Target accepts string keys
                    target[key] = merge({}, sourceValue);
                }
            }
            else if (dist.default.array(sourceValue)) {
                // @ts-ignore TS doesn't recognise Target accepts string keys
                target[key] = sourceValue.slice();
            }
            else {
                // @ts-ignore TS doesn't recognise Target accepts string keys
                target[key] = sourceValue;
            }
        }
    }
    return target;
}
exports.default = merge;
});

unwrapExports(merge_1);

var optionsToUrl = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function validateSearchParams(searchParams) {
    for (const value of Object.values(searchParams)) {
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && value !== null) {
            throw new TypeError(`The \`searchParams\` value '${String(value)}' must be a string, number, boolean or null`);
        }
    }
}
const keys = [
    'protocol',
    'username',
    'password',
    'host',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash'
];
exports.default = (options) => {
    var _a, _b;
    let origin;
    if (options.path) {
        if (options.pathname) {
            throw new TypeError('Parameters `path` and `pathname` are mutually exclusive.');
        }
        if (options.search) {
            throw new TypeError('Parameters `path` and `search` are mutually exclusive.');
        }
        if (options.searchParams) {
            throw new TypeError('Parameters `path` and `searchParams` are mutually exclusive.');
        }
    }
    if (Reflect.has(options, 'auth')) {
        throw new TypeError('Parameter `auth` is deprecated. Use `username` / `password` instead.');
    }
    if (options.search && options.searchParams) {
        throw new TypeError('Parameters `search` and `searchParams` are mutually exclusive.');
    }
    if (options.href) {
        return new url.URL(options.href);
    }
    if (options.origin) {
        origin = options.origin;
    }
    else {
        if (!options.protocol) {
            throw new TypeError('No URL protocol specified');
        }
        origin = `${options.protocol}//${_b = (_a = options.hostname, (_a !== null && _a !== void 0 ? _a : options.host)), (_b !== null && _b !== void 0 ? _b : '')}`;
    }
    const url$1 = new url.URL(origin);
    if (options.path) {
        const searchIndex = options.path.indexOf('?');
        if (searchIndex === -1) {
            options.pathname = options.path;
        }
        else {
            options.pathname = options.path.slice(0, searchIndex);
            options.search = options.path.slice(searchIndex + 1);
        }
    }
    if (Reflect.has(options, 'path')) {
        delete options.path;
    }
    for (const key of keys) {
        if (Reflect.has(options, key)) {
            url$1[key] = options[key].toString();
        }
    }
    if (options.searchParams) {
        if (typeof options.searchParams !== 'string' && !(options.searchParams instanceof url.URLSearchParams)) {
            validateSearchParams(options.searchParams);
        }
        (new url.URLSearchParams(options.searchParams)).forEach((value, key) => {
            url$1.searchParams.append(key, value);
        });
    }
    return url$1;
};
});

unwrapExports(optionsToUrl);

var supportsBrotli = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = typeof zlib.createBrotliDecompress === 'function';
});

unwrapExports(supportsBrotli);

var types = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSymbol = Symbol('request');
});

unwrapExports(types);
var types_1 = types.requestSymbol;

var normalizeArguments = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


















const nonEnumerableProperties = [
    'context',
    'body',
    'json',
    'form'
];
const isAgentByProtocol = (agent) => dist.default.object(agent);
// TODO: `preNormalizeArguments` should merge `options` & `defaults`
exports.preNormalizeArguments = (options, defaults) => {
    var _a, _b, _c, _d, _e, _f;
    // `options.headers`
    if (dist.default.undefined(options.headers)) {
        options.headers = {};
    }
    else {
        options.headers = lowercaseKeys(options.headers);
    }
    for (const [key, value] of Object.entries(options.headers)) {
        if (dist.default.null_(value)) {
            throw new TypeError(`Use \`undefined\` instead of \`null\` to delete the \`${key}\` header`);
        }
    }
    // `options.prefixUrl`
    if (dist.default.urlInstance(options.prefixUrl) || dist.default.string(options.prefixUrl)) {
        options.prefixUrl = options.prefixUrl.toString();
        if (options.prefixUrl.length !== 0 && !options.prefixUrl.endsWith('/')) {
            options.prefixUrl += '/';
        }
    }
    else {
        options.prefixUrl = defaults ? defaults.prefixUrl : '';
    }
    // `options.hooks`
    if (dist.default.undefined(options.hooks)) {
        options.hooks = {};
    }
    if (dist.default.object(options.hooks)) {
        for (const event of knownHookEvents_1.default) {
            if (Reflect.has(options.hooks, event)) {
                if (!dist.default.array(options.hooks[event])) {
                    throw new TypeError(`Parameter \`${event}\` must be an Array, not ${dist.default(options.hooks[event])}`);
                }
            }
            else {
                options.hooks[event] = [];
            }
        }
    }
    else {
        throw new TypeError(`Parameter \`hooks\` must be an Object, not ${dist.default(options.hooks)}`);
    }
    if (defaults) {
        for (const event of knownHookEvents_1.default) {
            if (!(Reflect.has(options.hooks, event) && dist.default.undefined(options.hooks[event]))) {
                // @ts-ignore Union type array is not assignable to union array type
                options.hooks[event] = [
                    ...defaults.hooks[event],
                    ...options.hooks[event]
                ];
            }
        }
    }
    // `options.timeout`
    if (dist.default.number(options.timeout)) {
        options.timeout = { request: options.timeout };
    }
    else if (!dist.default.object(options.timeout)) {
        options.timeout = {};
    }
    // `options.retry`
    const { retry } = options;
    if (defaults) {
        options.retry = { ...defaults.retry };
    }
    else {
        options.retry = {
            calculateDelay: retryObject => retryObject.computedValue,
            limit: 0,
            methods: [],
            statusCodes: [],
            errorCodes: [],
            maxRetryAfter: undefined
        };
    }
    if (dist.default.object(retry)) {
        options.retry = {
            ...options.retry,
            ...retry
        };
    }
    else if (dist.default.number(retry)) {
        options.retry.limit = retry;
    }
    if (options.retry.maxRetryAfter === undefined) {
        options.retry.maxRetryAfter = Math.min(...[options.timeout.request, options.timeout.connect].filter((n) => !dist.default.nullOrUndefined(n)));
    }
    options.retry.methods = [...new Set(options.retry.methods.map(method => method.toUpperCase()))];
    options.retry.statusCodes = [...new Set(options.retry.statusCodes)];
    options.retry.errorCodes = [...new Set(options.retry.errorCodes)];
    // `options.dnsCache`
    if (options.dnsCache && !(options.dnsCache instanceof cacheableLookup.default)) {
        options.dnsCache = new cacheableLookup.default({ cacheAdapter: options.dnsCache });
    }
    // `options.method`
    if (dist.default.string(options.method)) {
        options.method = options.method.toUpperCase();
    }
    else {
        options.method = (_b = (_a = defaults) === null || _a === void 0 ? void 0 : _a.method, (_b !== null && _b !== void 0 ? _b : 'GET'));
    }
    // Better memory management, so we don't have to generate a new object every time
    if (options.cache) {
        options.cacheableRequest = new src$3(
        // @ts-ignore Cannot properly type a function with multiple definitions yet
        (requestOptions, handler) => requestOptions[types.requestSymbol](requestOptions, handler), options.cache);
    }
    // `options.cookieJar`
    if (dist.default.object(options.cookieJar)) {
        let { setCookie, getCookieString } = options.cookieJar;
        // Horrible `tough-cookie` check
        if (setCookie.length === 4 && getCookieString.length === 0) {
            if (!Reflect.has(setCookie, util.promisify.custom)) {
                // @ts-ignore TS is dumb.
                setCookie = util.promisify(setCookie.bind(options.cookieJar));
                getCookieString = util.promisify(getCookieString.bind(options.cookieJar));
            }
        }
        else if (setCookie.length !== 2) {
            throw new TypeError('`options.cookieJar.setCookie` needs to be an async function with 2 arguments');
        }
        else if (getCookieString.length !== 1) {
            throw new TypeError('`options.cookieJar.getCookieString` needs to be an async function with 1 argument');
        }
        options.cookieJar = { setCookie, getCookieString };
    }
    // `options.encoding`
    if (dist.default.null_(options.encoding)) {
        throw new TypeError('To get a Buffer, set `options.responseType` to `buffer` instead');
    }
    // `options.maxRedirects`
    if (!Reflect.has(options, 'maxRedirects') && !(defaults && Reflect.has(defaults, 'maxRedirects'))) {
        options.maxRedirects = 0;
    }
    // Merge defaults
    if (defaults) {
        options = merge_1.default({}, defaults, options);
    }
    // Other values
    options.decompress = Boolean(options.decompress);
    options.isStream = Boolean(options.isStream);
    options.throwHttpErrors = Boolean(options.throwHttpErrors);
    options.ignoreInvalidCookies = Boolean(options.ignoreInvalidCookies);
    options.cache = (_c = options.cache, (_c !== null && _c !== void 0 ? _c : false));
    options.responseType = (_d = options.responseType, (_d !== null && _d !== void 0 ? _d : 'text'));
    options.resolveBodyOnly = Boolean(options.resolveBodyOnly);
    options.followRedirect = Boolean(options.followRedirect);
    options.dnsCache = (_e = options.dnsCache, (_e !== null && _e !== void 0 ? _e : false));
    options.useElectronNet = Boolean(options.useElectronNet);
    options.methodRewriting = Boolean(options.methodRewriting);
    options.context = (_f = options.context, (_f !== null && _f !== void 0 ? _f : {}));
    return options;
};
exports.mergeOptions = (...sources) => {
    let mergedOptions = exports.preNormalizeArguments({});
    // Non enumerable properties shall not be merged
    const properties = {};
    for (const source of sources) {
        mergedOptions = exports.preNormalizeArguments(merge_1.default({}, source), mergedOptions);
        for (const name of nonEnumerableProperties) {
            if (!Reflect.has(source, name)) {
                continue;
            }
            properties[name] = {
                writable: true,
                configurable: true,
                enumerable: false,
                value: source[name]
            };
        }
    }
    Object.defineProperties(mergedOptions, properties);
    return mergedOptions;
};
exports.normalizeArguments = (url$1, options, defaults) => {
    var _a, _b, _c, _d;
    // Merge options
    if (typeof url$1 === 'undefined') {
        throw new TypeError('Missing `url` argument');
    }
    if (typeof options === 'undefined') {
        options = {};
    }
    if (dist.default.urlInstance(url$1) || dist.default.string(url$1)) {
        if (Reflect.has(options, 'url')) {
            throw new TypeError('The `url` option cannot be used if the input is a valid URL.');
        }
        // @ts-ignore URL is not URL
        options.url = url$1;
        options = exports.mergeOptions((_b = (_a = defaults) === null || _a === void 0 ? void 0 : _a.options, (_b !== null && _b !== void 0 ? _b : {})), options);
    }
    else {
        if (Reflect.has(url$1, 'resolve')) {
            throw new Error('The legacy `url.Url` is deprecated. Use `URL` instead.');
        }
        options = exports.mergeOptions((_d = (_c = defaults) === null || _c === void 0 ? void 0 : _c.options, (_d !== null && _d !== void 0 ? _d : {})), url$1, options);
    }
    // Normalize URL
    // TODO: drop `optionsToUrl` in Got 12
    if (dist.default.string(options.url)) {
        options.url = options.prefixUrl + options.url;
        options.url = options.url.replace(/^unix:/, 'http://$&');
        if (options.searchParams || options.search) {
            options.url = options.url.split('?')[0];
        }
        // @ts-ignore URL is not URL
        options.url = optionsToUrl.default({
            origin: options.url,
            ...options
        });
    }
    else if (!dist.default.urlInstance(options.url)) {
        // @ts-ignore URL is not URL
        options.url = optionsToUrl.default({ origin: options.prefixUrl, ...options });
    }
    const normalizedOptions = options;
    // Make it possible to change `options.prefixUrl`
    let prefixUrl = options.prefixUrl;
    Object.defineProperty(normalizedOptions, 'prefixUrl', {
        set: (value) => {
            if (!normalizedOptions.url.href.startsWith(value)) {
                throw new Error(`Cannot change \`prefixUrl\` from ${prefixUrl} to ${value}: ${normalizedOptions.url.href}`);
            }
            normalizedOptions.url = new url.URL(value + normalizedOptions.url.href.slice(prefixUrl.length));
            prefixUrl = value;
        },
        get: () => prefixUrl
    });
    // Make it possible to remove default headers
    for (const [key, value] of Object.entries(normalizedOptions.headers)) {
        if (dist.default.undefined(value)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete normalizedOptions.headers[key];
        }
    }
    for (const hook of normalizedOptions.hooks.init) {
        const result = hook(normalizedOptions);
        if (dist.default.promise(result)) {
            throw new TypeError('The `init` hook must be a synchronous function');
        }
    }
    return normalizedOptions;
};
const withoutBody = new Set(['GET', 'HEAD']);
exports.normalizeRequestArguments = async (options) => {
    var _a, _b, _c;
    options = exports.mergeOptions(options);
    // Serialize body
    const { headers } = options;
    const noContentType = dist.default.undefined(headers['content-type']);
    {
        // TODO: these checks should be moved to `preNormalizeArguments`
        const isForm = !dist.default.undefined(options.form);
        const isJSON = !dist.default.undefined(options.json);
        const isBody = !dist.default.undefined(options.body);
        if ((isBody || isForm || isJSON) && withoutBody.has(options.method)) {
            throw new TypeError(`The \`${options.method}\` method cannot be used with a body`);
        }
        if ([isBody, isForm, isJSON].filter(isTrue => isTrue).length > 1) {
            throw new TypeError('The `body`, `json` and `form` options are mutually exclusive');
        }
        if (isBody &&
            !dist.default.nodeStream(options.body) &&
            !dist.default.string(options.body) &&
            !dist.default.buffer(options.body) &&
            !(dist.default.object(options.body) && isFormData.default(options.body))) {
            throw new TypeError('The `body` option must be a stream.Readable, string or Buffer');
        }
        if (isForm && !dist.default.object(options.form)) {
            throw new TypeError('The `form` option must be an Object');
        }
    }
    if (options.body) {
        // Special case for https://github.com/form-data/form-data
        if (dist.default.object(options.body) && isFormData.default(options.body) && noContentType) {
            headers['content-type'] = `multipart/form-data; boundary=${options.body.getBoundary()}`;
        }
    }
    else if (options.form) {
        if (noContentType) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        options.body = (new url.URLSearchParams(options.form)).toString();
    }
    else if (options.json) {
        if (noContentType) {
            headers['content-type'] = 'application/json';
        }
        options.body = JSON.stringify(options.json);
    }
    const uploadBodySize = await getBodySize.default(options);
    if (!dist.default.nodeStream(options.body)) {
        options.body = toReadableStream_1(options.body);
    }
    // See https://tools.ietf.org/html/rfc7230#section-3.3.2
    // A user agent SHOULD send a Content-Length in a request message when
    // no Transfer-Encoding is sent and the request method defines a meaning
    // for an enclosed payload body.  For example, a Content-Length header
    // field is normally sent in a POST request even when the value is 0
    // (indicating an empty payload body).  A user agent SHOULD NOT send a
    // Content-Length header field when the request message does not contain
    // a payload body and the method semantics do not anticipate such a
    // body.
    if (dist.default.undefined(headers['content-length']) && dist.default.undefined(headers['transfer-encoding'])) {
        if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') &&
            !dist.default.undefined(uploadBodySize)) {
            // @ts-ignore We assign if it is undefined, so this IS correct
            headers['content-length'] = String(uploadBodySize);
        }
    }
    if (!options.isStream && options.responseType === 'json' && dist.default.undefined(headers.accept)) {
        headers.accept = 'application/json';
    }
    if (options.decompress && dist.default.undefined(headers['accept-encoding'])) {
        headers['accept-encoding'] = supportsBrotli.default ? 'gzip, deflate, br' : 'gzip, deflate';
    }
    // Validate URL
    if (options.url.protocol !== 'http:' && options.url.protocol !== 'https:') {
        throw new errors.UnsupportedProtocolError(options);
    }
    decodeURI(options.url.toString());
    // Normalize request function
    if (dist.default.function_(options.request)) {
        options[types.requestSymbol] = options.request;
        delete options.request;
    }
    else {
        options[types.requestSymbol] = options.url.protocol === 'https:' ? https.request : http.request;
    }
    // UNIX sockets
    if (options.url.hostname === 'unix') {
        const matches = /(?<socketPath>.+?):(?<path>.+)/.exec(options.url.pathname);
        if ((_a = matches) === null || _a === void 0 ? void 0 : _a.groups) {
            const { socketPath, path } = matches.groups;
            options = {
                ...options,
                socketPath,
                path,
                host: ''
            };
        }
    }
    if (isAgentByProtocol(options.agent)) {
        options.agent = (_b = options.agent[options.url.protocol.slice(0, -1)], (_b !== null && _b !== void 0 ? _b : options.agent));
    }
    if (options.dnsCache) {
        options.lookup = options.dnsCache.lookup;
    }
    /* istanbul ignore next: electron.net is broken */
    // No point in typing process.versions correctly, as
    // `process.version.electron` is used only once, right here.
    if (options.useElectronNet && process.versions.electron) {
        const electron = dynamicRequire.default(module, 'electron'); // Trick webpack
        options.request = util.deprecate((_c = electron.net.request, (_c !== null && _c !== void 0 ? _c : electron.remote.net.request)), 'Electron support has been deprecated and will be removed in Got 11.\n' +
            'See https://github.com/sindresorhus/got/issues/899 for further information.', 'GOT_ELECTRON');
    }
    // Got's `timeout` is an object, http's `timeout` is a number, so they're not compatible.
    delete options.timeout;
    // Set cookies
    if (options.cookieJar) {
        const cookieString = await options.cookieJar.getCookieString(options.url.toString());
        if (dist.default.nonEmptyString(cookieString)) {
            options.headers.cookie = cookieString;
        }
        else {
            delete options.headers.cookie;
        }
    }
    // `http-cache-semantics` checks this
    delete options.url;
    return options;
};
});

unwrapExports(normalizeArguments);
var normalizeArguments_1 = normalizeArguments.preNormalizeArguments;
var normalizeArguments_2 = normalizeArguments.mergeOptions;
var normalizeArguments_3 = normalizeArguments.normalizeArguments;
var normalizeArguments_4 = normalizeArguments.normalizeRequestArguments;

var dist$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

const deferToConnect = (socket, fn) => {
    let listeners;
    if (typeof fn === 'function') {
        const connect = fn;
        listeners = { connect };
    }
    else {
        listeners = fn;
    }
    const hasConnectListener = typeof listeners.connect === 'function';
    const hasSecureConnectListener = typeof listeners.secureConnect === 'function';
    const hasCloseListener = typeof listeners.close === 'function';
    const onConnect = () => {
        if (hasConnectListener) {
            listeners.connect();
        }
        if (socket instanceof tls.TLSSocket && hasSecureConnectListener) {
            if (socket.authorized) {
                listeners.secureConnect();
            }
            else if (!socket.authorizationError) {
                socket.once('secureConnect', listeners.secureConnect);
            }
        }
        if (hasCloseListener) {
            socket.once('close', listeners.close);
        }
    };
    if (socket.writable && !socket.connecting) {
        onConnect();
    }
    else if (socket.connecting) {
        socket.once('connect', onConnect);
    }
    else if (socket.destroyed && hasCloseListener) {
        listeners.close(socket._hadError);
    }
};
exports.default = deferToConnect;
// For CommonJS default export support
module.exports = deferToConnect;
module.exports.default = deferToConnect;
});

unwrapExports(dist$1);

var dist$2 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defer_to_connect_1 = __importDefault(dist$1);
const timer = (request) => {
    const timings = {
        start: Date.now(),
        socket: undefined,
        lookup: undefined,
        connect: undefined,
        secureConnect: undefined,
        upload: undefined,
        response: undefined,
        end: undefined,
        error: undefined,
        abort: undefined,
        phases: {
            wait: undefined,
            dns: undefined,
            tcp: undefined,
            tls: undefined,
            request: undefined,
            firstByte: undefined,
            download: undefined,
            total: undefined
        }
    };
    request.timings = timings;
    const handleError = (origin) => {
        const emit = origin.emit.bind(origin);
        origin.emit = (event, ...args) => {
            // Catches the `error` event
            if (event === 'error') {
                timings.error = Date.now();
                timings.phases.total = timings.error - timings.start;
                origin.emit = emit;
            }
            // Saves the original behavior
            return emit(event, ...args);
        };
    };
    handleError(request);
    request.prependOnceListener('abort', () => {
        timings.abort = Date.now();
        timings.phases.total = Date.now() - timings.start;
    });
    request.prependOnceListener('socket', (socket) => {
        timings.socket = Date.now();
        timings.phases.wait = timings.socket - timings.start;
        const lookupListener = () => {
            timings.lookup = Date.now();
            timings.phases.dns = timings.lookup - timings.socket;
        };
        socket.prependOnceListener('lookup', lookupListener);
        defer_to_connect_1.default(socket, {
            connect: () => {
                timings.connect = Date.now();
                if (timings.lookup === undefined) {
                    socket.removeListener('lookup', lookupListener);
                    timings.lookup = timings.connect;
                    timings.phases.dns = timings.lookup - timings.socket;
                }
                timings.phases.tcp = timings.connect - timings.lookup;
                // This callback is called before flushing any data,
                // so we don't need to set `timings.phases.request` here.
            },
            secureConnect: () => {
                timings.secureConnect = Date.now();
                timings.phases.tls = timings.secureConnect - timings.connect;
            }
        });
    });
    request.prependOnceListener('finish', () => {
        timings.upload = Date.now();
        timings.phases.request = timings.upload - (timings.secureConnect || timings.connect);
    });
    request.prependOnceListener('response', (response) => {
        timings.response = Date.now();
        timings.phases.firstByte = timings.response - timings.upload;
        response.timings = timings;
        handleError(response);
        response.prependOnceListener('end', () => {
            timings.end = Date.now();
            timings.phases.download = timings.end - timings.response;
            timings.phases.total = timings.end - timings.start;
        });
    });
    return timings;
};
exports.default = timer;
// For CommonJS default export support
module.exports = timer;
module.exports.default = timer;

});

unwrapExports(dist$2);

var calculateRetryDelay_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const retryAfterStatusCodes = new Set([413, 429, 503]);
const isErrorWithResponse = (error) => (error instanceof errors.HTTPError || error instanceof errors.ParseError || error instanceof errors.MaxRedirectsError);
const calculateRetryDelay = ({ attemptCount, retryOptions, error }) => {
    if (attemptCount > retryOptions.limit) {
        return 0;
    }
    const hasMethod = retryOptions.methods.includes(error.options.method);
    const hasErrorCode = Reflect.has(error, 'code') && retryOptions.errorCodes.includes(error.code);
    const hasStatusCode = isErrorWithResponse(error) && retryOptions.statusCodes.includes(error.response.statusCode);
    if (!hasMethod || (!hasErrorCode && !hasStatusCode)) {
        return 0;
    }
    if (isErrorWithResponse(error)) {
        const { response } = error;
        if (response && Reflect.has(response.headers, 'retry-after') && retryAfterStatusCodes.has(response.statusCode)) {
            let after = Number(response.headers['retry-after']);
            if (dist.default.nan(after)) {
                after = Date.parse(response.headers['retry-after']) - Date.now();
            }
            else {
                after *= 1000;
            }
            if (after > retryOptions.maxRetryAfter) {
                return 0;
            }
            return after;
        }
        if (response.statusCode === 413) {
            return 0;
        }
    }
    const noise = Math.random() * 100;
    return ((2 ** (attemptCount - 1)) * 1000) + noise;
};
exports.default = calculateRetryDelay;
});

unwrapExports(calculateRetryDelay_1);

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProperties = [
	'aborted',
	'complete',
	'destroy',
	'headers',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'method',
	'rawHeaders',
	'rawTrailers',
	'setTimeout',
	'socket',
	'statusCode',
	'statusMessage',
	'trailers',
	'url'
];

var mimicResponse$1 = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProperties));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};

const {
	pipeline: streamPipeline,
	PassThrough: PassThroughStream$1
} = stream;



const decompressResponse = response => {
	const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();

	if (!['gzip', 'deflate', 'br'].includes(contentEncoding)) {
		return response;
	}

	// TODO: Remove this when targeting Node.js 12.
	const isBrotli = contentEncoding === 'br';
	if (isBrotli && typeof zlib.createBrotliDecompress !== 'function') {
		return response;
	}

	const decompress = isBrotli ? zlib.createBrotliDecompress() : zlib.createUnzip();
	const stream = new PassThroughStream$1();

	decompress.on('error', error => {
		// Ignore empty response
		if (error.code === 'Z_BUF_ERROR') {
			stream.end();
			return;
		}

		stream.emit('error', error);
	});

	const finalStream = streamPipeline(response, decompress, stream, () => {});

	mimicResponse$1(response, finalStream);

	return finalStream;
};

var decompressResponse_1 = decompressResponse;

var progress = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


function createProgressStream(name, emitter, totalBytes) {
    let transformedBytes = 0;
    if (dist.default.string(totalBytes)) {
        totalBytes = Number(totalBytes);
    }
    const progressStream = new stream.Transform({
        transform(chunk, _encoding, callback) {
            transformedBytes += chunk.length;
            const percent = totalBytes ? transformedBytes / totalBytes : 0;
            // Let `flush()` be responsible for emitting the last event
            if (percent < 1) {
                emitter.emit(name, {
                    percent,
                    transferred: transformedBytes,
                    total: totalBytes
                });
            }
            callback(undefined, chunk);
        },
        flush(callback) {
            emitter.emit(name, {
                percent: 1,
                transferred: transformedBytes,
                total: totalBytes
            });
            callback();
        }
    });
    emitter.emit(name, {
        percent: 0,
        transferred: 0,
        total: totalBytes
    });
    return progressStream;
}
exports.createProgressStream = createProgressStream;
});

unwrapExports(progress);
var progress_1 = progress.createProgressStream;

var getResponse = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });





const pipeline = util.promisify(stream.pipeline);
exports.default = async (response, options, emitter) => {
    var _a;
    const downloadBodySize = Number(response.headers['content-length']) || undefined;
    const progressStream = progress.createProgressStream('downloadProgress', emitter, downloadBodySize);
    mimicResponse$1(response, progressStream);
    const newResponse = (options.decompress &&
        options.method !== 'HEAD' ? decompressResponse_1(progressStream) : progressStream);
    if (!options.decompress && ['gzip', 'deflate', 'br'].includes((_a = newResponse.headers['content-encoding'], (_a !== null && _a !== void 0 ? _a : '')))) {
        options.responseType = 'buffer';
    }
    emitter.emit('response', newResponse);
    return pipeline(response, progressStream).catch(error => {
        if (error.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
            throw error;
        }
    });
};
});

unwrapExports(getResponse);

var unhandle = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// When attaching listeners, it's very easy to forget about them.
// Especially if you do error handling and set timeouts.
// So instead of checking if it's proper to throw an error on every timeout ever,
// use this simple tool which will remove all listeners you have attached.
exports.default = () => {
    const handlers = [];
    return {
        once(origin, event, fn) {
            origin.once(event, fn);
            handlers.push({ origin, event, fn });
        },
        unhandleAll() {
            for (const handler of handlers) {
                const { origin, event, fn } = handler;
                origin.removeListener(event, fn);
            }
            handlers.length = 0;
        }
    };
};
});

unwrapExports(unhandle);

var timedOut = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const reentry = Symbol('reentry');
const noop = () => { };
class TimeoutError extends Error {
    constructor(threshold, event) {
        super(`Timeout awaiting '${event}' for ${threshold}ms`);
        this.event = event;
        this.name = 'TimeoutError';
        this.code = 'ETIMEDOUT';
    }
}
exports.TimeoutError = TimeoutError;
exports.default = (request, delays, options) => {
    if (Reflect.has(request, reentry)) {
        return noop;
    }
    request[reentry] = true;
    const cancelers = [];
    const { once, unhandleAll } = unhandle.default();
    const addTimeout = (delay, callback, event) => {
        var _a, _b;
        const timeout = setTimeout(callback, delay, delay, event);
        (_b = (_a = timeout).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        const cancel = () => {
            clearTimeout(timeout);
        };
        cancelers.push(cancel);
        return cancel;
    };
    const { host, hostname } = options;
    const timeoutHandler = (delay, event) => {
        if (request.socket) {
            // @ts-ignore We do not want the `socket hang up` error
            request.socket._hadError = true;
        }
        request.abort();
        request.emit('error', new TimeoutError(delay, event));
    };
    const cancelTimeouts = () => {
        for (const cancel of cancelers) {
            cancel();
        }
        unhandleAll();
    };
    request.once('error', error => {
        cancelTimeouts();
        // Save original behavior
        if (request.listenerCount('error') === 0) {
            throw error;
        }
    });
    request.once('abort', cancelTimeouts);
    once(request, 'response', (response) => {
        once(response, 'end', cancelTimeouts);
    });
    if (typeof delays.request !== 'undefined') {
        addTimeout(delays.request, timeoutHandler, 'request');
    }
    if (typeof delays.socket !== 'undefined') {
        const socketTimeoutHandler = () => {
            timeoutHandler(delays.socket, 'socket');
        };
        request.setTimeout(delays.socket, socketTimeoutHandler);
        // `request.setTimeout(0)` causes a memory leak.
        // We can just remove the listener and forget about the timer - it's unreffed.
        // See https://github.com/sindresorhus/got/issues/690
        cancelers.push(() => {
            request.removeListener('timeout', socketTimeoutHandler);
        });
    }
    once(request, 'socket', (socket) => {
        var _a;
        // @ts-ignore Node typings doesn't have this property
        const { socketPath } = request;
        /* istanbul ignore next: hard to test */
        if (socket.connecting) {
            const hasPath = Boolean((socketPath !== null && socketPath !== void 0 ? socketPath : net.isIP((_a = (hostname !== null && hostname !== void 0 ? hostname : host), (_a !== null && _a !== void 0 ? _a : ''))) !== 0));
            if (typeof delays.lookup !== 'undefined' && !hasPath && typeof socket.address().address === 'undefined') {
                const cancelTimeout = addTimeout(delays.lookup, timeoutHandler, 'lookup');
                once(socket, 'lookup', cancelTimeout);
            }
            if (typeof delays.connect !== 'undefined') {
                const timeConnect = () => addTimeout(delays.connect, timeoutHandler, 'connect');
                if (hasPath) {
                    once(socket, 'connect', timeConnect());
                }
                else {
                    once(socket, 'lookup', (error) => {
                        if (error === null) {
                            once(socket, 'connect', timeConnect());
                        }
                    });
                }
            }
            if (typeof delays.secureConnect !== 'undefined' && options.protocol === 'https:') {
                once(socket, 'connect', () => {
                    const cancelTimeout = addTimeout(delays.secureConnect, timeoutHandler, 'secureConnect');
                    once(socket, 'secureConnect', cancelTimeout);
                });
            }
        }
        if (typeof delays.send !== 'undefined') {
            const timeRequest = () => addTimeout(delays.send, timeoutHandler, 'send');
            /* istanbul ignore next: hard to test */
            if (socket.connecting) {
                once(socket, 'connect', () => {
                    once(request, 'upload-complete', timeRequest());
                });
            }
            else {
                once(request, 'upload-complete', timeRequest());
            }
        }
    });
    if (typeof delays.response !== 'undefined') {
        once(request, 'upload-complete', () => {
            const cancelTimeout = addTimeout(delays.response, timeoutHandler, 'response');
            once(request, 'response', cancelTimeout);
        });
    }
    return cancelTimeouts;
};
});

unwrapExports(timedOut);
var timedOut_1 = timedOut.TimeoutError;

var urlToOptions = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = (url) => {
    // Cast to URL
    url = url;
    const options = {
        protocol: url.protocol,
        hostname: dist.default.string(url.hostname) && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
        host: url.host,
        hash: url.hash,
        search: url.search,
        pathname: url.pathname,
        href: url.href,
        path: `${url.pathname || ''}${url.search || ''}`
    };
    if (dist.default.string(url.port) && url.port.length !== 0) {
        options.port = Number(url.port);
    }
    if (url.username || url.password) {
        options.auth = `${url.username || ''}:${url.password || ''}`;
    }
    return options;
};
});

unwrapExports(urlToOptions);

var requestAsEventEmitter = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
















const setImmediateAsync = async () => new Promise(resolve => setImmediate(resolve));
const pipeline = util.promisify(stream.pipeline);
const redirectCodes = new Set([300, 301, 302, 303, 304, 307, 308]);
exports.default = (options) => {
    const emitter = new events();
    const requestURL = options.url.toString();
    const redirects = [];
    let retryCount = 0;
    let currentRequest;
    // `request.aborted` is a boolean since v11.0.0: https://github.com/nodejs/node/commit/4b00c4fafaa2ae8c41c1f78823c0feb810ae4723#diff-e3bc37430eb078ccbafe3aa3b570c91a
    const isAborted = () => typeof currentRequest.aborted === 'number' || currentRequest.aborted;
    const emitError = async (error) => {
        try {
            for (const hook of options.hooks.beforeError) {
                // eslint-disable-next-line no-await-in-loop
                error = await hook(error);
            }
            emitter.emit('error', error);
        }
        catch (error_) {
            emitter.emit('error', error_);
        }
    };
    const get = async () => {
        let httpOptions = await normalizeArguments.normalizeRequestArguments(options);
        const handleResponse = async (response) => {
            var _a;
            try {
                /* istanbul ignore next: fixes https://github.com/electron/electron/blob/cbb460d47628a7a146adf4419ed48550a98b2923/lib/browser/api/net.js#L59-L65 */
                if (options.useElectronNet) {
                    response = new Proxy(response, {
                        get: (target, name) => {
                            if (name === 'trailers' || name === 'rawTrailers') {
                                return [];
                            }
                            const value = target[name];
                            return dist.default.function_(value) ? value.bind(target) : value;
                        }
                    });
                }
                const typedResponse = response;
                const { statusCode } = typedResponse;
                typedResponse.statusMessage = dist.default.nonEmptyString(typedResponse.statusMessage) ? typedResponse.statusMessage : http.STATUS_CODES[statusCode];
                typedResponse.url = options.url.toString();
                typedResponse.requestUrl = requestURL;
                typedResponse.retryCount = retryCount;
                typedResponse.redirectUrls = redirects;
                typedResponse.request = { options };
                typedResponse.isFromCache = (_a = typedResponse.fromCache, (_a !== null && _a !== void 0 ? _a : false));
                delete typedResponse.fromCache;
                if (!typedResponse.isFromCache) {
                    typedResponse.ip = response.socket.remoteAddress;
                }
                const rawCookies = typedResponse.headers['set-cookie'];
                if (Reflect.has(options, 'cookieJar') && rawCookies) {
                    let promises = rawCookies.map(async (rawCookie) => options.cookieJar.setCookie(rawCookie, typedResponse.url));
                    if (options.ignoreInvalidCookies) {
                        promises = promises.map(async (p) => p.catch(() => { }));
                    }
                    await Promise.all(promises);
                }
                if (options.followRedirect && Reflect.has(typedResponse.headers, 'location') && redirectCodes.has(statusCode)) {
                    typedResponse.resume(); // We're being redirected, we don't care about the response.
                    if (statusCode === 303 || options.methodRewriting === false) {
                        if (options.method !== 'GET' && options.method !== 'HEAD') {
                            // Server responded with "see other", indicating that the resource exists at another location,
                            // and the client should request it from that location via GET or HEAD.
                            options.method = 'GET';
                        }
                        if (Reflect.has(options, 'body')) {
                            delete options.body;
                        }
                        if (Reflect.has(options, 'json')) {
                            delete options.json;
                        }
                        if (Reflect.has(options, 'form')) {
                            delete options.form;
                        }
                    }
                    if (redirects.length >= options.maxRedirects) {
                        throw new errors.MaxRedirectsError(typedResponse, options.maxRedirects, options);
                    }
                    // Handles invalid URLs. See https://github.com/sindresorhus/got/issues/604
                    const redirectBuffer = Buffer.from(typedResponse.headers.location, 'binary').toString();
                    const redirectURL = new url.URL(redirectBuffer, options.url);
                    // Redirecting to a different site, clear cookies.
                    if (redirectURL.hostname !== options.url.hostname && Reflect.has(options.headers, 'cookie')) {
                        delete options.headers.cookie;
                    }
                    redirects.push(redirectURL.toString());
                    options.url = redirectURL;
                    for (const hook of options.hooks.beforeRedirect) {
                        // eslint-disable-next-line no-await-in-loop
                        await hook(options, typedResponse);
                    }
                    emitter.emit('redirect', response, options);
                    await get();
                    return;
                }
                await getResponse.default(typedResponse, options, emitter);
            }
            catch (error) {
                emitError(error);
            }
        };
        const handleRequest = async (request) => {
            let isPiped = false;
            let isFinished = false;
            // `request.finished` doesn't indicate whether this has been emitted or not
            request.once('finish', () => {
                isFinished = true;
            });
            currentRequest = request;
            const onError = (error) => {
                if (error instanceof timedOut.TimeoutError) {
                    error = new errors.TimeoutError(error, request.timings, options);
                }
                else {
                    error = new errors.RequestError(error, options);
                }
                if (!emitter.retry(error)) {
                    emitError(error);
                }
            };
            request.on('error', error => {
                if (isPiped) {
                    // Check if it's caught by `stream.pipeline(...)`
                    if (!isFinished) {
                        return;
                    }
                    // We need to let `TimedOutTimeoutError` through, because `stream.pipeline(…)` aborts the request automatically.
                    if (isAborted() && !(error instanceof timedOut.TimeoutError)) {
                        return;
                    }
                }
                onError(error);
            });
            try {
                dist$2.default(request);
                timedOut.default(request, options.timeout, options.url);
                emitter.emit('request', request);
                const uploadStream = progress.createProgressStream('uploadProgress', emitter, httpOptions.headers['content-length']);
                isPiped = true;
                await pipeline(httpOptions.body, uploadStream, request);
                request.emit('upload-complete');
            }
            catch (error) {
                if (isAborted() && error.message === 'Premature close') {
                    // The request was aborted on purpose
                    return;
                }
                onError(error);
            }
        };
        if (options.cache) {
            // `cacheable-request` doesn't support Node 10 API, fallback.
            httpOptions = {
                ...httpOptions,
                ...urlToOptions.default(options.url)
            };
            // @ts-ignore `cacheable-request` has got invalid types
            const cacheRequest = options.cacheableRequest(httpOptions, handleResponse);
            cacheRequest.once('error', (error) => {
                if (error instanceof src$3.RequestError) {
                    emitError(new errors.RequestError(error, options));
                }
                else {
                    emitError(new errors.CacheError(error, options));
                }
            });
            cacheRequest.once('request', handleRequest);
        }
        else {
            // Catches errors thrown by calling `requestFn(…)`
            try {
                handleRequest(httpOptions[types.requestSymbol](options.url, httpOptions, handleResponse));
            }
            catch (error) {
                emitError(new errors.RequestError(error, options));
            }
        }
    };
    emitter.retry = error => {
        let backoff;
        retryCount++;
        try {
            backoff = options.retry.calculateDelay({
                attemptCount: retryCount,
                retryOptions: options.retry,
                error,
                computedValue: calculateRetryDelay_1.default({
                    attemptCount: retryCount,
                    retryOptions: options.retry,
                    error,
                    computedValue: 0
                })
            });
        }
        catch (error_) {
            emitError(error_);
            return false;
        }
        if (backoff) {
            const retry = async (options) => {
                try {
                    for (const hook of options.hooks.beforeRetry) {
                        // eslint-disable-next-line no-await-in-loop
                        await hook(options, error, retryCount);
                    }
                    await get();
                }
                catch (error_) {
                    emitError(error_);
                }
            };
            setTimeout(retry, backoff, { ...options, forceRefresh: true });
            return true;
        }
        return false;
    };
    emitter.abort = () => {
        emitter.prependListener('request', (request) => {
            request.abort();
        });
        if (currentRequest) {
            currentRequest.abort();
        }
    };
    (async () => {
        // Promises are executed immediately.
        // If there were no `setImmediate` here,
        // `promise.json()` would have no effect
        // as the request would be sent already.
        await setImmediateAsync();
        try {
            for (const hook of options.hooks.beforeRequest) {
                // eslint-disable-next-line no-await-in-loop
                await hook(options);
            }
            await get();
        }
        catch (error) {
            emitError(error);
        }
    })();
    return emitter;
};
exports.proxyEvents = (proxy, emitter) => {
    const events = [
        'request',
        'redirect',
        'uploadProgress',
        'downloadProgress'
    ];
    for (const event of events) {
        emitter.on(event, (...args) => {
            proxy.emit(event, ...args);
        });
    }
};
});

unwrapExports(requestAsEventEmitter);
var requestAsEventEmitter_1 = requestAsEventEmitter.proxyEvents;

var asPromise_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });







const parseBody = (body, responseType, encoding) => {
    if (responseType === 'json') {
        return body.length === 0 ? '' : JSON.parse(body.toString());
    }
    if (responseType === 'buffer') {
        return Buffer.from(body);
    }
    if (responseType === 'text') {
        return body.toString(encoding);
    }
    throw new TypeError(`Unknown body type '${responseType}'`);
};
function asPromise(options) {
    const proxy = new events();
    let body;
    const promise = new pCancelable((resolve, reject, onCancel) => {
        const emitter = requestAsEventEmitter.default(options);
        onCancel(emitter.abort);
        const emitError = async (error) => {
            try {
                for (const hook of options.hooks.beforeError) {
                    // eslint-disable-next-line no-await-in-loop
                    error = await hook(error);
                }
                reject(error);
            }
            catch (error_) {
                reject(error_);
            }
        };
        emitter.on('response', async (response) => {
            var _a;
            proxy.emit('response', response);
            // Download body
            try {
                body = await getStream_1.buffer(response, { encoding: 'binary' });
            }
            catch (error) {
                emitError(new errors.ReadError(error, options));
                return;
            }
            if ((_a = response.req) === null || _a === void 0 ? void 0 : _a.aborted) {
                // Canceled while downloading - will throw a `CancelError` or `TimeoutError` error
                return;
            }
            const isOk = () => {
                const { statusCode } = response;
                const limitStatusCode = options.followRedirect ? 299 : 399;
                return (statusCode >= 200 && statusCode <= limitStatusCode) || statusCode === 304;
            };
            // Parse body
            try {
                response.body = parseBody(body, options.responseType, options.encoding);
            }
            catch (error) {
                if (isOk()) {
                    const parseError = new errors.ParseError(error, response, options);
                    emitError(parseError);
                    return;
                }
                // Fall back to `utf8`
                response.body = body.toString();
            }
            try {
                for (const [index, hook] of options.hooks.afterResponse.entries()) {
                    // @ts-ignore TS doesn't notice that CancelableRequest is a Promise
                    // eslint-disable-next-line no-await-in-loop
                    response = await hook(response, async (updatedOptions) => {
                        const typedOptions = normalizeArguments.normalizeArguments(normalizeArguments.mergeOptions(options, {
                            ...updatedOptions,
                            retry: {
                                calculateDelay: () => 0
                            },
                            throwHttpErrors: false,
                            resolveBodyOnly: false
                        }));
                        // Remove any further hooks for that request, because we'll call them anyway.
                        // The loop continues. We don't want duplicates (asPromise recursion).
                        typedOptions.hooks.afterResponse = options.hooks.afterResponse.slice(0, index);
                        for (const hook of options.hooks.beforeRetry) {
                            // eslint-disable-next-line no-await-in-loop
                            await hook(typedOptions);
                        }
                        const promise = asPromise(typedOptions);
                        onCancel(() => {
                            promise.catch(() => { });
                            promise.cancel();
                        });
                        return promise;
                    });
                }
            }
            catch (error) {
                emitError(error);
                return;
            }
            // Check for HTTP error codes
            if (!isOk()) {
                const error = new errors.HTTPError(response, options);
                if (emitter.retry(error)) {
                    return;
                }
                if (options.throwHttpErrors) {
                    emitError(error);
                    return;
                }
            }
            resolve(options.resolveBodyOnly ? response.body : response);
        });
        emitter.once('error', reject);
        requestAsEventEmitter.proxyEvents(proxy, emitter);
    });
    promise.on = (name, fn) => {
        proxy.on(name, fn);
        return promise;
    };
    const shortcut = (responseType) => {
        // eslint-disable-next-line promise/prefer-await-to-then
        const newPromise = promise.then(() => parseBody(body, responseType, options.encoding));
        Object.defineProperties(newPromise, Object.getOwnPropertyDescriptors(promise));
        return newPromise;
    };
    promise.json = () => {
        if (dist.default.undefined(body) && dist.default.undefined(options.headers.accept)) {
            options.headers.accept = 'application/json';
        }
        return shortcut('json');
    };
    promise.buffer = () => shortcut('buffer');
    promise.text = () => shortcut('text');
    return promise;
}
exports.default = asPromise;
});

unwrapExports(asPromise_1);

function DuplexWrapper(options, writable, readable) {
  if (typeof readable === "undefined") {
    readable = writable;
    writable = options;
    options = null;
  }

  stream.Duplex.call(this, options);

  if (typeof readable.read !== "function") {
    readable = (new stream.Readable(options)).wrap(readable);
  }

  this._writable = writable;
  this._readable = readable;
  this._waiting = false;

  var self = this;

  writable.once("finish", function() {
    self.end();
  });

  this.once("finish", function() {
    writable.end();
  });

  readable.on("readable", function() {
    if (self._waiting) {
      self._waiting = false;
      self._read();
    }
  });

  readable.once("end", function() {
    self.push(null);
  });

  if (!options || typeof options.bubbleErrors === "undefined" || options.bubbleErrors) {
    writable.on("error", function(err) {
      self.emit("error", err);
    });

    readable.on("error", function(err) {
      self.emit("error", err);
    });
  }
}

DuplexWrapper.prototype = Object.create(stream.Duplex.prototype, {constructor: {value: DuplexWrapper}});

DuplexWrapper.prototype._write = function _write(input, encoding, done) {
  this._writable.write(input, encoding, done);
};

DuplexWrapper.prototype._read = function _read() {
  var buf;
  var reads = 0;
  while ((buf = this._readable.read()) !== null) {
    this.push(buf);
    reads++;
  }
  if (reads === 0) {
    this._waiting = true;
  }
};

var duplexer3 = function duplex2(options, writable, readable) {
  return new DuplexWrapper(options, writable, readable);
};

var DuplexWrapper_1 = DuplexWrapper;
duplexer3.DuplexWrapper = DuplexWrapper_1;

var asStream_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const stream_1 = stream;


class ProxyStream extends stream_1.Duplex {
}
exports.ProxyStream = ProxyStream;
function asStream(options) {
    const input = new stream_1.PassThrough();
    const output = new stream_1.PassThrough();
    const proxy = duplexer3(input, output);
    const piped = new Set();
    let isFinished = false;
    options.retry.calculateDelay = () => 0;
    if (options.body || options.json || options.form) {
        proxy.write = () => {
            proxy.destroy();
            throw new Error('Got\'s stream is not writable when the `body`, `json` or `form` option is used');
        };
    }
    else if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
        options.body = input;
    }
    else {
        proxy.write = () => {
            proxy.destroy();
            throw new TypeError(`The \`${options.method}\` method cannot be used with a body`);
        };
    }
    const emitter = requestAsEventEmitter.default(options);
    const emitError = async (error) => {
        try {
            for (const hook of options.hooks.beforeError) {
                // eslint-disable-next-line no-await-in-loop
                error = await hook(error);
            }
            proxy.emit('error', error);
        }
        catch (error_) {
            proxy.emit('error', error_);
        }
    };
    // Cancels the request
    proxy._destroy = (error, callback) => {
        callback(error);
        emitter.abort();
    };
    emitter.on('response', (response) => {
        const { statusCode, isFromCache } = response;
        proxy.isFromCache = isFromCache;
        if (options.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > 299)) {
            emitError(new errors.HTTPError(response, options));
            return;
        }
        {
            const read = proxy._read;
            proxy._read = (...args) => {
                isFinished = true;
                proxy._read = read;
                return read.apply(proxy, args);
            };
        }
        if (options.encoding) {
            proxy.setEncoding(options.encoding);
        }
        stream.pipeline(response, output, error => {
            if (error && error.message !== 'Premature close') {
                emitError(new errors.ReadError(error, options));
            }
        });
        for (const destination of piped) {
            if (destination.headersSent) {
                continue;
            }
            for (const [key, value] of Object.entries(response.headers)) {
                // Got gives *decompressed* data. Overriding `content-encoding` header would result in an error.
                // It's not possible to decompress already decompressed data, is it?
                const isAllowed = options.decompress ? key !== 'content-encoding' : true;
                if (isAllowed) {
                    destination.setHeader(key, value);
                }
            }
            destination.statusCode = response.statusCode;
        }
        proxy.emit('response', response);
    });
    requestAsEventEmitter.proxyEvents(proxy, emitter);
    emitter.on('error', (error) => proxy.emit('error', error));
    const pipe = proxy.pipe.bind(proxy);
    const unpipe = proxy.unpipe.bind(proxy);
    proxy.pipe = (destination, options) => {
        if (isFinished) {
            throw new Error('Failed to pipe. The response has been emitted already.');
        }
        pipe(destination, options);
        if (destination instanceof http.ServerResponse) {
            piped.add(destination);
        }
        return destination;
    };
    proxy.unpipe = stream => {
        piped.delete(stream);
        return unpipe(stream);
    };
    proxy.on('pipe', source => {
        if (source instanceof http.IncomingMessage) {
            options.headers = {
                ...source.headers,
                ...options.headers
            };
        }
    });
    proxy.isFromCache = undefined;
    return proxy;
}
exports.default = asStream;
});

unwrapExports(asStream_1);
var asStream_2 = asStream_1.ProxyStream;

var deepFreeze_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function deepFreeze(object) {
    for (const value of Object.values(object)) {
        if (dist.default.plainObject(value) || dist.default.array(value)) {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.default = deepFreeze;
});

unwrapExports(deepFreeze_1);

var create_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });





const getPromiseOrStream = (options) => options.isStream ? asStream_1.default(options) : asPromise_1.default(options);
const isGotInstance = (value) => (Reflect.has(value, 'defaults') && Reflect.has(value.defaults, 'options'));
const aliases = [
    'get',
    'post',
    'put',
    'patch',
    'head',
    'delete'
];
exports.defaultHandler = (options, next) => next(options);
const create = (defaults) => {
    // Proxy properties from next handlers
    defaults._rawHandlers = defaults.handlers;
    defaults.handlers = defaults.handlers.map(fn => ((options, next) => {
        // This will be assigned by assigning result
        let root;
        const result = fn(options, newOptions => {
            root = next(newOptions);
            return root;
        });
        if (result !== root && !options.isStream) {
            Object.setPrototypeOf(result, Object.getPrototypeOf(root));
            Object.defineProperties(result, Object.getOwnPropertyDescriptors(root));
        }
        return result;
    }));
    // @ts-ignore Because the for loop handles it for us, as well as the other Object.defines
    const got = (url, options) => {
        var _a;
        let iteration = 0;
        const iterateHandlers = (newOptions) => {
            return defaults.handlers[iteration++](newOptions, iteration === defaults.handlers.length ? getPromiseOrStream : iterateHandlers);
        };
        /* eslint-disable @typescript-eslint/return-await */
        try {
            return iterateHandlers(normalizeArguments.normalizeArguments(url, options, defaults));
        }
        catch (error) {
            if ((_a = options) === null || _a === void 0 ? void 0 : _a.isStream) {
                throw error;
            }
            else {
                // @ts-ignore It's an Error not a response, but TS thinks it's calling .resolve
                return Promise.reject(error);
            }
        }
        /* eslint-enable @typescript-eslint/return-await */
    };
    got.extend = (...instancesOrOptions) => {
        const optionsArray = [defaults.options];
        let handlers = [...defaults._rawHandlers];
        let mutableDefaults;
        for (const value of instancesOrOptions) {
            if (isGotInstance(value)) {
                optionsArray.push(value.defaults.options);
                handlers.push(...value.defaults._rawHandlers);
                mutableDefaults = value.defaults.mutableDefaults;
            }
            else {
                optionsArray.push(value);
                if (Reflect.has(value, 'handlers')) {
                    handlers.push(...value.handlers);
                }
                mutableDefaults = value.mutableDefaults;
            }
        }
        handlers = handlers.filter(handler => handler !== exports.defaultHandler);
        if (handlers.length === 0) {
            handlers.push(exports.defaultHandler);
        }
        return create({
            options: normalizeArguments.mergeOptions(...optionsArray),
            handlers,
            mutableDefaults: Boolean(mutableDefaults)
        });
    };
    // @ts-ignore The missing methods because the for-loop handles it for us
    got.stream = (url, options) => got(url, { ...options, isStream: true });
    for (const method of aliases) {
        // @ts-ignore Cannot properly type a function with multiple definitions yet
        got[method] = (url, options) => got(url, { ...options, method });
        got.stream[method] = (url, options) => got.stream(url, { ...options, method });
    }
    Object.assign(got, { ...errors, mergeOptions: normalizeArguments.mergeOptions });
    Object.defineProperty(got, 'defaults', {
        value: defaults.mutableDefaults ? defaults : deepFreeze_1.default(defaults),
        writable: defaults.mutableDefaults,
        configurable: defaults.mutableDefaults,
        enumerable: true
    });
    return got;
};
exports.default = create;
});

unwrapExports(create_1);
var create_2 = create_1.defaultHandler;

var source = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });

const defaults = {
    options: {
        method: 'GET',
        retry: {
            limit: 2,
            methods: [
                'GET',
                'PUT',
                'HEAD',
                'DELETE',
                'OPTIONS',
                'TRACE'
            ],
            statusCodes: [
                408,
                413,
                429,
                500,
                502,
                503,
                504,
                521,
                522,
                524
            ],
            errorCodes: [
                'ETIMEDOUT',
                'ECONNRESET',
                'EADDRINUSE',
                'ECONNREFUSED',
                'EPIPE',
                'ENOTFOUND',
                'ENETUNREACH',
                'EAI_AGAIN'
            ],
            maxRetryAfter: undefined,
            calculateDelay: ({ computedValue }) => computedValue
        },
        timeout: {},
        headers: {
            'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        hooks: {
            init: [],
            beforeRequest: [],
            beforeRedirect: [],
            beforeRetry: [],
            beforeError: [],
            afterResponse: []
        },
        decompress: true,
        throwHttpErrors: true,
        followRedirect: true,
        isStream: false,
        cache: false,
        dnsCache: false,
        useElectronNet: false,
        responseType: 'text',
        resolveBodyOnly: false,
        maxRedirects: 10,
        prefixUrl: '',
        methodRewriting: true,
        ignoreInvalidCookies: false,
        context: {}
    },
    handlers: [create_1.defaultHandler],
    mutableDefaults: false
};
const got = create_1.default(defaults);
exports.default = got;
// For CommonJS default export support
module.exports = got;
module.exports.default = got;
// Export types
__export(types);

exports.ResponseStream = asStream_1.ProxyStream;

exports.GotError = errors.GotError;
exports.CacheError = errors.CacheError;
exports.RequestError = errors.RequestError;
exports.ParseError = errors.ParseError;
exports.HTTPError = errors.HTTPError;
exports.MaxRedirectsError = errors.MaxRedirectsError;
exports.UnsupportedProtocolError = errors.UnsupportedProtocolError;
exports.TimeoutError = errors.TimeoutError;
exports.CancelError = errors.CancelError;
});

var got = unwrapExports(source);
var source_1 = source.ResponseStream;
var source_2 = source.GotError;
var source_3 = source.CacheError;
var source_4 = source.RequestError;
var source_5 = source.ParseError;
var source_6 = source.HTTPError;
var source_7 = source.MaxRedirectsError;
var source_8 = source.UnsupportedProtocolError;
var source_9 = source.TimeoutError;
var source_10 = source.CancelError;

var available_mirrors = [
  {
    baseUrl: "http://gen.lib.rus.ec",
    canDownloadDirect: false
  },
  {
    baseUrl: "http://libgen.is",
    // if true, '/get.php?md5=' works
    canDownloadDirect: true
  }
];

var speed = {
  mirror: mirror,
  canDownload: canDownload
};

async function timeConnection (url) {
  const start = Date.now();

  try {
    const response = await source.head(url);

    const results = {
      url: url,
      time: Date.now() - start
    };
    return results

  } catch (err) {
    // async.map will fail if any of the timeConnections returns an error, but
    // we only care that at least one succeeds; so fail silently
    console.error(err);
  }
  return false
}

// @param {Array} urls Can be an array of request objects or URL strings
// @param {Function] callback
async function faster (urls) {
  const speedTests = urls.map(async (value, index, array) => {
    return await timeConnection(value)
  });
  const results = await Promise.all(speedTests);

  const noResponses = results.every(value => {
    return !value
  });

  if (noResponses)
    return new Error("Bad response from all mirrors")

  const sorted = results.sort((a, b) => {
    return a.time - b.time
  });

  return sorted[0].url
}

async function mirror () {
  const urls = available_mirrors.map(value => {
    return `${value.baseUrl}/json.php?ids=1&fields=*`
  });

  try {
    const fastest = await faster(urls);
    return available_mirrors.filter(value => {
      return fastest.indexOf(value.baseUrl) === 0
    })[0].baseUrl
  } catch (err) {
    return err
  }
}

// @param {String, JSON} text
// @param {Function} callback
async function canDownload (text) {
  const md5 = text.md5 ? text.md5.toLowerCase() : text.toLowerCase();

  const urls = available_mirrors.filter(value => {
    return value.canDownloadDirect
  }).map(value => {
    return `${value.baseUrl}/get.php?md5=${md5}`
  });

  try {
    return await faster(urls)
  } catch (err) {
    return err
  }
}

// TODO: this is pretty brittle; if libgen changes how they format results it
// will break
const LATEST_ID_REGEX = /<td>[0-9]+<\/td>/g;

var latest = {
  id: async function(mirror) {
    const url = `${mirror}/search.php?mode=last`;

    try {
      const response = await source(url);
      const idsResults = response.body.match(LATEST_ID_REGEX);
      const latestId = idsResults[0].replace(/[^0-9]/g,"");
      if (!parseInt(latestId))
        return new Error(`Failed to return a numeric ID: ${latestId}`)

      // returning the original string rather than an int because once the IDs
      // get higher JS starts mangling them
      return latestId

    } catch (err) {
      //console.dir(err)
      return err
    }
  },
  text: async function(mirror) {
    try {
      const ids = await this.id(mirror);
      const url = `${mirror}/json.php?ids=${ids}&fields=*`;
      const response = await source(url);

      // the API always returns an array of objects, so for functions like this
      // which are mean to return a single text, we pick out the first (only)
      // element in the array automatically
      return JSON.parse(response.body)[0]

    } catch (err) {
      //console.dir(err)
      return err
    }
  }
};

function isIn(elem, array) {
  return array.some((value, index, array) => {
    return elem === value
  });
}

function hasFields(json, fields) {
  if (Array.isArray(fields)) {
    let n = fields.length;
    while (n--)
      for (var l in json)
        if (isIn(l, fields) && /^\s*$/.test(json[l]))
          return false
  }
  else if (typeof fields === "object") {
    for (var key in fields)
      if (json[key] !== undefined && json[key] !== fields[key])
          return false
  }
  else {
    for (var k in json)
      if (k === fields && /^\s*$/.test(json[k]))
        return false
  }
  return json
}

var clean = {
  // removes texts that don"t have the specified fields
  forFields: function(json, fields) {
    if (((typeof json) === "object") && !Array.isArray(json))
      return hasFields(json, fields)
    else if (Array.isArray(json)) {
      var spliced = [];
      var n = json.length;
      while (n--)
        if (hasFields(json[n], fields))
          spliced.push(json[n]);

      if (spliced.length)
        return spliced
      else
        return false
    }
    else
      return console.error(new Error("Bad data passed to clean.forFields()"))
  },
  // removes duplicate texts from an array of libgen json objects
  dups: function(array) {
    let sorted = array.sort((a, b) => {
      return a.id - b.id
    });
    let i = sorted.length - 1;
    while (i--)
      if (sorted[i + 1].id === sorted[i].id)
        sorted.splice(i,1);

    return sorted
  }
};

function rInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

var random = {
  text: async function(options) {
    if (!options.mirror)
      return new Error("No mirror given to random.text()")

    try {
      const data = await latest.id(options.mirror);

      if (!options.count || !parseInt(options.count))
        options.count = 1;

      let texts = [];

      while (texts.length < options.count) {
        let picks = [];
        let n = options.count;

        // if there are required fields, pull the maximum number of texts each
        // time to reduce the number of http requests
        if (options.fields) {
          // The max url length libgen will accept is 8192; subtract the length
          // of rest of the URL string plus the maximum possible length of the
          // next ID we add (len)
          const len = data.length;
          const urlStringLength = `${options.mirror}/json.php?ids=&fields=*`.length;
          while (picks.join(",").length < (urlStringLength - len))
            picks.push(rInt(1, data));
        } else {
          while (n--)
            picks.push(rInt(1, data));
        }

        picks = picks.join(",");

        const url = `${options.mirror}/json.php?ids=${picks}&fields=*`;

        try {
          const response = await source(url);
          const raw = JSON.parse(response.body);

          const filters = options.fields;
          let cleaned;

          if (filters && Array.isArray(filters)) {
            cleaned = raw;
            let f = filters.length;
            while (f--) {
              // with a lot of filters we might have removed everything, so we
              // add this guard clause
              if (cleaned)
                cleaned = clean.forFields(cleaned, filters[f]);
            }
            if (cleaned)
              texts = texts.concat(cleaned);

          } else if (filters) {
            cleaned = clean.forFields(raw, filters);
            if (cleaned)
              texts = texts.concat(cleaned);

          } else
            texts = texts.concat(raw);

          // prevent TypeErrors if nothing has been added to the array
          if (texts.length)
            texts = clean.dups(texts);

        } catch (err) {
           return err
        }
      }

      texts.splice(0, (texts.length) - options.count);
      return texts

    } catch (err) {
      return err
    }
  }
};

const ID_REGEX = /ID\:[^0-9]+[0-9]+[^0-9]/g;
const RESULT_REGEX = /[0-9]+\ files\ found/i;

function extractIds(html) {
  let ids = [];
  const idsResults = html.match(ID_REGEX);
  // reverse the order of the results because we walk through them
  // backwards with while(n--)
  idsResults.reverse();
  let n = idsResults.length;
  while (n--) {
    const id = idsResults[n].replace(/[^0-9]/g,"");

    if (!parseInt(id))
      return false

    ids.push(id);
  }
  return ids
}

async function idFetch(options) {
  if (!options.mirror)
    return new Error("No mirror provided to search function")

  else if (!options.query)
    return new Error("No search query given")

  else if (options.query.length < 4)
    return new Error("Search query must be at least four characters")

  if (!options.count || !parseInt(options.count))
    options.count = 10;

  // sort_by options: "def", "title", "publisher", "year", "pages",
  // "language", "filesize", "extension" (must be lowercase)
  const sort = options.sort_by || "def";

  // search_in options: "def", "title", "author", "series",
  // "periodical", "publisher", "year", "identifier", "md5",
  // "extension"
  const column = options.search_in || "def";

  // boolean
  const sortmode = (options.reverse ? "DESC" : "ASC");

  const query = options.mirror +
        "/search.php?&req=" +
        encodeURIComponent(options.query) +
        // important that view=detailed so we can get the real IDs
        "&view=detailed" +
        "&column=" + column +
        "&sort=" + sort +
        "&sortmode=" + sortmode +
        "&page=1";

  try {
    const response = await source(query);

    let results = response.body.match(RESULT_REGEX);
    if (results === null)
      return new Error("Bad response: could not parse search results")
    else
      results = results[0];

    results = parseInt(results.replace(/^([0-9]*).*/,"$1"));

    if (results === 0)
      return new Error(`No results for "${options.query}"`)

    else if (!results)
      return new Error("Could not determine # of search results")

    let searchIds = extractIds(response.body);
    if (!searchIds)
      return new Error("Failed to parse search results for IDs")

    do {
      const query = options.mirror +
            "/search.php?&req=" +
            encodeURIComponent(options.query) +
            // important that view=detailed so we can get the real IDs
            "&view=detailed" +
            "&column=" + column +
            "&sort=" + sort +
            "&sortmode=" + sortmode +
            "&page=" +
            // parentheses around the whole ensures the plus sign is
            // interpreted as addition and not string concatenation
            (Math.floor((searchIds.length) / 25) + 1);

      try {
        let page = await source(query);

        const newIds = extractIds(page.body);
        if (!newIds)
          return new Error("Failed to parse search results for IDs")
        else
          searchIds = searchIds.concat(newIds);
      } catch (err) {
        return err
      }
      // repeat search if the number of records requested is more than we get on
      // the first query
    } while (searchIds.length < options.count)

    return searchIds
  } catch (err) {
    return err
  }
}

var search = async function(options) {
  try {
    let ids = await idFetch(options);

    if (ids.length > options.count)
      ids = ids.slice(0, options.count);

    const url = `${options.mirror}/json.php?ids=${ids.join(",")}&fields=*`;

    try {
      const response = await source(url);
      //console.dir(response)
      return JSON.parse(response.body)
    } catch (err) {
      return err
    }
  } catch (err) {
    return err
  }
};

var check = function (json, field, value) {
  if (/^\s*$/.test(json[field.toLowerCase()]))
    return false
  else if (value)
    return json[field.toLowerCase()] === value
  else
    return true
};

var libgen = {
  mirror: speed.mirror,
  latest: latest,
  random: random,
  search: search,
  utils: {
    clean: clean,
    check: {
      hasField: check,
      canDownload: speed.canDownload
    }
  }
};

var entityMap = {
       lt: '<',
       gt: '>',
       amp: '&',
       quot: '"',
       apos: "'",
       Agrave: "À",
       Aacute: "Á",
       Acirc: "Â",
       Atilde: "Ã",
       Auml: "Ä",
       Aring: "Å",
       AElig: "Æ",
       Ccedil: "Ç",
       Egrave: "È",
       Eacute: "É",
       Ecirc: "Ê",
       Euml: "Ë",
       Igrave: "Ì",
       Iacute: "Í",
       Icirc: "Î",
       Iuml: "Ï",
       ETH: "Ð",
       Ntilde: "Ñ",
       Ograve: "Ò",
       Oacute: "Ó",
       Ocirc: "Ô",
       Otilde: "Õ",
       Ouml: "Ö",
       Oslash: "Ø",
       Ugrave: "Ù",
       Uacute: "Ú",
       Ucirc: "Û",
       Uuml: "Ü",
       Yacute: "Ý",
       THORN: "Þ",
       szlig: "ß",
       agrave: "à",
       aacute: "á",
       acirc: "â",
       atilde: "ã",
       auml: "ä",
       aring: "å",
       aelig: "æ",
       ccedil: "ç",
       egrave: "è",
       eacute: "é",
       ecirc: "ê",
       euml: "ë",
       igrave: "ì",
       iacute: "í",
       icirc: "î",
       iuml: "ï",
       eth: "ð",
       ntilde: "ñ",
       ograve: "ò",
       oacute: "ó",
       ocirc: "ô",
       otilde: "õ",
       ouml: "ö",
       oslash: "ø",
       ugrave: "ù",
       uacute: "ú",
       ucirc: "û",
       uuml: "ü",
       yacute: "ý",
       thorn: "þ",
       yuml: "ÿ",
       nbsp: " ",
       iexcl: "¡",
       cent: "¢",
       pound: "£",
       curren: "¤",
       yen: "¥",
       brvbar: "¦",
       sect: "§",
       uml: "¨",
       copy: "©",
       ordf: "ª",
       laquo: "«",
       not: "¬",
       shy: "­­",
       reg: "®",
       macr: "¯",
       deg: "°",
       plusmn: "±",
       sup2: "²",
       sup3: "³",
       acute: "´",
       micro: "µ",
       para: "¶",
       middot: "·",
       cedil: "¸",
       sup1: "¹",
       ordm: "º",
       raquo: "»",
       frac14: "¼",
       frac12: "½",
       frac34: "¾",
       iquest: "¿",
       times: "×",
       divide: "÷",
       forall: "∀",
       part: "∂",
       exist: "∃",
       empty: "∅",
       nabla: "∇",
       isin: "∈",
       notin: "∉",
       ni: "∋",
       prod: "∏",
       sum: "∑",
       minus: "−",
       lowast: "∗",
       radic: "√",
       prop: "∝",
       infin: "∞",
       ang: "∠",
       and: "∧",
       or: "∨",
       cap: "∩",
       cup: "∪",
       'int': "∫",
       there4: "∴",
       sim: "∼",
       cong: "≅",
       asymp: "≈",
       ne: "≠",
       equiv: "≡",
       le: "≤",
       ge: "≥",
       sub: "⊂",
       sup: "⊃",
       nsub: "⊄",
       sube: "⊆",
       supe: "⊇",
       oplus: "⊕",
       otimes: "⊗",
       perp: "⊥",
       sdot: "⋅",
       Alpha: "Α",
       Beta: "Β",
       Gamma: "Γ",
       Delta: "Δ",
       Epsilon: "Ε",
       Zeta: "Ζ",
       Eta: "Η",
       Theta: "Θ",
       Iota: "Ι",
       Kappa: "Κ",
       Lambda: "Λ",
       Mu: "Μ",
       Nu: "Ν",
       Xi: "Ξ",
       Omicron: "Ο",
       Pi: "Π",
       Rho: "Ρ",
       Sigma: "Σ",
       Tau: "Τ",
       Upsilon: "Υ",
       Phi: "Φ",
       Chi: "Χ",
       Psi: "Ψ",
       Omega: "Ω",
       alpha: "α",
       beta: "β",
       gamma: "γ",
       delta: "δ",
       epsilon: "ε",
       zeta: "ζ",
       eta: "η",
       theta: "θ",
       iota: "ι",
       kappa: "κ",
       lambda: "λ",
       mu: "μ",
       nu: "ν",
       xi: "ξ",
       omicron: "ο",
       pi: "π",
       rho: "ρ",
       sigmaf: "ς",
       sigma: "σ",
       tau: "τ",
       upsilon: "υ",
       phi: "φ",
       chi: "χ",
       psi: "ψ",
       omega: "ω",
       thetasym: "ϑ",
       upsih: "ϒ",
       piv: "ϖ",
       OElig: "Œ",
       oelig: "œ",
       Scaron: "Š",
       scaron: "š",
       Yuml: "Ÿ",
       fnof: "ƒ",
       circ: "ˆ",
       tilde: "˜",
       ensp: " ",
       emsp: " ",
       thinsp: " ",
       zwnj: "‌",
       zwj: "‍",
       lrm: "‎",
       rlm: "‏",
       ndash: "–",
       mdash: "—",
       lsquo: "‘",
       rsquo: "’",
       sbquo: "‚",
       ldquo: "“",
       rdquo: "”",
       bdquo: "„",
       dagger: "†",
       Dagger: "‡",
       bull: "•",
       hellip: "…",
       permil: "‰",
       prime: "′",
       Prime: "″",
       lsaquo: "‹",
       rsaquo: "›",
       oline: "‾",
       euro: "€",
       trade: "™",
       larr: "←",
       uarr: "↑",
       rarr: "→",
       darr: "↓",
       harr: "↔",
       crarr: "↵",
       lceil: "⌈",
       rceil: "⌉",
       lfloor: "⌊",
       rfloor: "⌋",
       loz: "◊",
       spades: "♠",
       clubs: "♣",
       hearts: "♥",
       diams: "♦"
};
//for(var  n in exports.entityMap){console.log(exports.entityMap[n].charCodeAt())}

var entities = {
	entityMap: entityMap
};

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;//\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {});
		parse$2(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
};
function parse$2(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end;
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g;
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}];
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase();
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config);
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2;
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el);
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el);
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder);
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e);
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="');
					attrName = source.slice(start,p);
				}
				start = p+1;
				p = source.indexOf(c,start);
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END;
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1);
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start);
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!');
					}
					el.add(value,value,start);
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p);
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start);
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!');
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!');
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName;
		}else{
			localName = qName;
			prefix = null;
			nsPrefix = qName === 'xmlns' && '';
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {};
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={});
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/';
			domBuilder.startPrefixMapping(nsPrefix, value); 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || ''];
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix); 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>');
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName);
		}
		closeMap[tagName] =pos;
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n];}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2);
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA(); 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1];
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName;
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset};
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
};



function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

var XMLReader_1 = XMLReader;

var sax = {
	XMLReader: XMLReader_1
};

/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(!(pt instanceof Super)){
		function t(){}		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class);
		}
		pt.constructor = Class;
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {};
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {};
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
}DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException);
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
}NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh;
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
};

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
}
function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1;
		while(i<lastIndex){
			list[i] = list[++i];
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
}
DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
}
Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value;
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:''];
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next;
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		});
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
}Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name);
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
}Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
}CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
};
_extends(CharacterData,Node);
function Text() {
}Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
};
_extends(Text,CharacterData);
function Comment() {
}Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
};
_extends(Comment,CharacterData);

function CDATASection() {
}CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
};
_extends(CDATASection,CharacterData);


function DocumentType() {
}DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
}Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
}Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
}EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
}DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
};
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9 && this.documentElement || this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			];
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length; 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML; 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length;
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value;
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		});
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value;
		};
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	var DOMImplementation_1 = DOMImplementation;
	var XMLSerializer_1 = XMLSerializer;
//}

var dom = {
	DOMImplementation: DOMImplementation_1,
	XMLSerializer: XMLSerializer_1
};

var domParser = createCommonjsModule(function (module, exports) {
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}

DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
  	var entityMap = isHTML?entities.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator);
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(isHTML){
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
};
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {};
	var isCallback = errorImpl instanceof Function;
	locator = locator||{};
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg);}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el);
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr);
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement;
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins);
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments);
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode);
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments);
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm);
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt);
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		//console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
};
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null};
});

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){

var XMLReader = sax.XMLReader;
var DOMImplementation = exports.DOMImplementation = dom.DOMImplementation;
exports.XMLSerializer = dom.XMLSerializer ;
exports.DOMParser = DOMParser;
//}
});
var domParser_1 = domParser.DOMImplementation;
var domParser_2 = domParser.XMLSerializer;
var domParser_3 = domParser.DOMParser;

main.config();

const MAILJET_USER = process.env.MAILJET_USER;

const getMirror = async function() {
  const urlString = await libgen.mirror();
  console.log(`${urlString} is currently fastest`);
  return urlString
};

const search$1 = async function(mirror, query) {
  const options = {
    mirror: mirror,
    query: query,
    count: 10,
    sort_by: 'size',
    reverse: true
  };

  return await libgen.search(options)
};

const downloadBook = async function(mirror, query) {
    const books = await search$1(mirror, query);
    console.log("books found: " + books.length);
    const mobiBooks = books.filter(({extension}) => extension === "mobi");
    console.log("mobi books found: " + mobiBooks.length);
    const preDownloadUrl = await libgen.utils.check.canDownload(mobiBooks[0].md5);
    const preDownloadPageUnescaped = await got(preDownloadUrl);
    const preDownloadPage = preDownloadPageUnescaped.body.replace(/\t|\r|\n/g, "");
    const doc = new domParser_3().parseFromString(preDownloadPage);
    // XPATH: "/body/table/tbody/tr[1]/td[2]/a/@href"
    const downloadUrl = doc.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[1].childNodes[0].attributes[0].value;
    console.log(downloadUrl);

    return await got(downloadUrl, {
      responseType: "buffer",
      resolveBodyOnly: true
    })
};

const sendEmail = async function(from, to, attachmentName, attachmentBuffer) {
  return await got.post("https://"+MAILJET_USER+"@api.mailjet.com/v3.1/send", {
    headers: {
      "Content-Type": "application/json",
    },
    json: {
      "Messages":[
        {
          "From": { "Email": from },
          "To": [ { "Email": to } ],
          "TextPart": "Greetings from Mailjet.",
          "Attachments": [{
            "Filename": attachmentName + ".mobi",
            "ContentType": "text/plain",
            "Base64Content": Buffer.from(attachmentBuffer).toString("base64")
          }]
        }
      ]
    }
  })
};

const handleEvent = async function (event) {
    const { query, from, to } = event.queryStringParameters;
    console.log("query: " + query);
    console.log("from: " + from);
    console.log("to: " + to);
    const mirror = await getMirror();
    const bookBuffer = await downloadBook(mirror, query);
    const result = await sendEmail(from, to, query, bookBuffer);

    return {
      statusCode: 200,
      body: "OK"
    }
};

//const testEvent = {
//  queryStringParameters: {
//    query: "games people play eric berne",
//    from: "test@email.com",
//    to: "test@email.com"//"test@kindle.com"
//  }
//}
//const result = handleEvent(testEvent)

exports.handler = handleEvent;
//# sourceMappingURL=bundle.js.map

(function () {
	'use strict';

	/*! MIT License © Sindre Sorhus */

	const globals = {};

	const getGlobal = property => {
		/* istanbul ignore next */
		if (typeof self !== 'undefined' && self && property in self) {
			return self;
		}

		/* istanbul ignore next */
		if (typeof window !== 'undefined' && window && property in window) {
			return window;
		}

		if (typeof global !== 'undefined' && global && property in global) {
			return global;
		}

		/* istanbul ignore next */
		if (typeof globalThis !== 'undefined' && globalThis) {
			return globalThis;
		}
	};

	const globalProperties = [
		'Headers',
		'Request',
		'Response',
		'ReadableStream',
		'fetch',
		'AbortController',
		'FormData'
	];

	for (const property of globalProperties) {
		Object.defineProperty(globals, property, {
			get() {
				const globalObject = getGlobal(property);
				const value = globalObject && globalObject[property];
				return typeof value === 'function' ? value.bind(globalObject) : value;
			}
		});
	}

	const isObject = value => value !== null && typeof value === 'object';
	const supportsAbortController = typeof globals.AbortController === 'function';
	const supportsStreams = typeof globals.ReadableStream === 'function';

	const deepMerge = (...sources) => {
		let returnValue = {};

		for (const source of sources) {
			if (Array.isArray(source)) {
				if (!(Array.isArray(returnValue))) {
					returnValue = [];
				}

				returnValue = [...returnValue, ...source];
			} else if (isObject(source)) {
				for (let [key, value] of Object.entries(source)) {
					if (isObject(value) && Reflect.has(returnValue, key)) {
						value = deepMerge(returnValue[key], value);
					}

					returnValue = {...returnValue, [key]: value};
				}
			}
		}

		return returnValue;
	};

	const requestMethods = [
		'get',
		'post',
		'put',
		'patch',
		'head',
		'delete'
	];

	const responseTypes = {
		json: 'application/json',
		text: 'text/*',
		formData: 'multipart/form-data',
		arrayBuffer: '*/*',
		blob: '*/*'
	};

	const retryMethods = [
		'get',
		'put',
		'head',
		'delete',
		'options',
		'trace'
	];

	const retryStatusCodes = [
		408,
		413,
		429,
		500,
		502,
		503,
		504
	];

	const retryAfterStatusCodes = [
		413,
		429,
		503
	];

	const stop = Symbol('stop');

	class HTTPError extends Error {
		constructor(response) {
			super(response.statusText);
			this.name = 'HTTPError';
			this.response = response;
		}
	}

	class TimeoutError extends Error {
		constructor() {
			super('Request timed out');
			this.name = 'TimeoutError';
		}
	}

	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	// `Promise.race()` workaround (#91)
	const timeout = (promise, ms, abortController) =>
		new Promise((resolve, reject) => {
			const timeoutID = setTimeout(() => {
				if (abortController) {
					abortController.abort();
				}

				reject(new TimeoutError());
			}, ms);

			/* eslint-disable promise/prefer-await-to-then */
			promise
				.then(resolve)
				.catch(reject)
				.then(() => {
					clearTimeout(timeoutID);
				});
			/* eslint-enable promise/prefer-await-to-then */
		});

	const normalizeRequestMethod = input => requestMethods.includes(input) ? input.toUpperCase() : input;

	const defaultRetryOptions = {
		limit: 2,
		methods: retryMethods,
		statusCodes: retryStatusCodes,
		afterStatusCodes: retryAfterStatusCodes
	};

	const normalizeRetryOptions = (retry = {}) => {
		if (typeof retry === 'number') {
			return {
				...defaultRetryOptions,
				limit: retry
			};
		}

		if (retry.methods && !Array.isArray(retry.methods)) {
			throw new Error('retry.methods must be an array');
		}

		if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
			throw new Error('retry.statusCodes must be an array');
		}

		return {
			...defaultRetryOptions,
			...retry,
			afterStatusCodes: retryAfterStatusCodes
		};
	};

	// The maximum value of a 32bit int (see issue #117)
	const maxSafeTimeout = 2147483647;

	class Ky {
		constructor(input, options = {}) {
			this._retryCount = 0;
			this._input = input;
			this._options = {
				// TODO: credentials can be removed when the spec change is implemented in all browsers. Context: https://www.chromestatus.com/feature/4539473312350208
				credentials: this._input.credentials || 'same-origin',
				...options,
				hooks: deepMerge({
					beforeRequest: [],
					beforeRetry: [],
					afterResponse: []
				}, options.hooks),
				method: normalizeRequestMethod(options.method || this._input.method),
				prefixUrl: String(options.prefixUrl || ''),
				retry: normalizeRetryOptions(options.retry),
				throwHttpErrors: options.throwHttpErrors !== false,
				timeout: typeof options.timeout === 'undefined' ? 10000 : options.timeout
			};

			if (typeof this._input !== 'string' && !(this._input instanceof URL || this._input instanceof globals.Request)) {
				throw new TypeError('`input` must be a string, URL, or Request');
			}

			if (this._options.prefixUrl && typeof this._input === 'string') {
				if (this._input.startsWith('/')) {
					throw new Error('`input` must not begin with a slash when using `prefixUrl`');
				}

				if (!this._options.prefixUrl.endsWith('/')) {
					this._options.prefixUrl += '/';
				}

				this._input = this._options.prefixUrl + this._input;
			}

			if (supportsAbortController) {
				this.abortController = new globals.AbortController();
				if (this._options.signal) {
					this._options.signal.addEventListener('abort', () => {
						this.abortController.abort();
					});
					this._options.signal = this.abortController.signal;
				}
			}

			this.request = new globals.Request(this._input, this._options);

			if (this._options.searchParams) {
				const url = new URL(this.request.url);
				url.search = new URLSearchParams(this._options.searchParams);
				this.request = new globals.Request(new globals.Request(url, this.request), this._options);
			}

			if (this._options.json) {
				this._options.body = JSON.stringify(this._options.json);
				this.request.headers.set('content-type', 'application/json');
				this.request = new globals.Request(this.request, {body: this._options.body});
			}

			const fn = async () => {
				if (this._options.timeout > maxSafeTimeout) {
					throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
				}

				await delay(1);
				let response = await this._fetch();

				for (const hook of this._options.hooks.afterResponse) {
					// eslint-disable-next-line no-await-in-loop
					const modifiedResponse = await hook(
						this.request,
						this._options,
						response.clone()
					);

					if (modifiedResponse instanceof globals.Response) {
						response = modifiedResponse;
					}
				}

				if (!response.ok && this._options.throwHttpErrors) {
					throw new HTTPError(response);
				}

				// If `onDownloadProgress` is passed, it uses the stream API internally
				/* istanbul ignore next */
				if (this._options.onDownloadProgress) {
					if (typeof this._options.onDownloadProgress !== 'function') {
						throw new TypeError('The `onDownloadProgress` option must be a function');
					}

					if (!supportsStreams) {
						throw new Error('Streams are not supported in your environment. `ReadableStream` is missing.');
					}

					return this._stream(response.clone(), this._options.onDownloadProgress);
				}

				return response;
			};

			const isRetriableMethod = this._options.retry.methods.includes(this.request.method.toLowerCase());
			const result = isRetriableMethod ? this._retry(fn) : fn();

			for (const [type, mimeType] of Object.entries(responseTypes)) {
				result[type] = async () => {
					this.request.headers.set('accept', this.request.headers.get('accept') || mimeType);
					const response = (await result).clone();
					return (type === 'json' && response.status === 204) ? '' : response[type]();
				};
			}

			return result;
		}

		_calculateRetryDelay(error) {
			this._retryCount++;

			if (this._retryCount < this._options.retry.limit && !(error instanceof TimeoutError)) {
				if (error instanceof HTTPError) {
					if (!this._options.retry.statusCodes.includes(error.response.status)) {
						return 0;
					}

					const retryAfter = error.response.headers.get('Retry-After');
					if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
						let after = Number(retryAfter);
						if (Number.isNaN(after)) {
							after = Date.parse(retryAfter) - Date.now();
						} else {
							after *= 1000;
						}

						if (typeof this._options.retry.maxRetryAfter !== 'undefined' && after > this._options.retry.maxRetryAfter) {
							return 0;
						}

						return after;
					}

					if (error.response.status === 413) {
						return 0;
					}
				}

				const BACKOFF_FACTOR = 0.3;
				return BACKOFF_FACTOR * (2 ** (this._retryCount - 1)) * 1000;
			}

			return 0;
		}

		async _retry(fn) {
			try {
				return await fn();
			} catch (error) {
				const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
				if (ms !== 0 && this._retryCount > 0) {
					await delay(ms);

					for (const hook of this._options.hooks.beforeRetry) {
						// eslint-disable-next-line no-await-in-loop
						const hookResult = await hook(
							this.request,
							this._options,
							error,
							this._retryCount
						);

						// If `stop` is returned from the hook, the retry process is stopped
						if (hookResult === stop) {
							return;
						}
					}

					return this._retry(fn);
				}

				if (this._options.throwHttpErrors) {
					throw error;
				}
			}
		}

		async _fetch() {
			for (const hook of this._options.hooks.beforeRequest) {
				// eslint-disable-next-line no-await-in-loop
				const result = await hook(this.request, this._options);

				if (result instanceof Request) {
					this.request = result;
					break;
				}

				if (result instanceof Response) {
					return result;
				}
			}

			if (this._options.timeout === false) {
				return globals.fetch(this.request);
			}

			return timeout(globals.fetch(this.request), this._options.timeout, this.abortController);
		}

		/* istanbul ignore next */
		_stream(response, onDownloadProgress) {
			const totalBytes = Number(response.headers.get('content-length')) || 0;
			let transferredBytes = 0;

			return new globals.Response(
				new globals.ReadableStream({
					start(controller) {
						const reader = response.body.getReader();

						if (onDownloadProgress) {
							onDownloadProgress({percent: 0, transferredBytes: 0, totalBytes}, new Uint8Array());
						}

						async function read() {
							const {done, value} = await reader.read();
							if (done) {
								controller.close();
								return;
							}

							if (onDownloadProgress) {
								transferredBytes += value.byteLength;
								const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
								onDownloadProgress({percent, transferredBytes, totalBytes}, value);
							}

							controller.enqueue(value);
							read();
						}

						read();
					}
				})
			);
		}
	}

	const validateAndMerge = (...sources) => {
		for (const source of sources) {
			if ((!isObject(source) || Array.isArray(source)) && typeof source !== 'undefined') {
				throw new TypeError('The `options` argument must be an object');
			}
		}

		return deepMerge({}, ...sources);
	};

	const createInstance = defaults => {
		const ky = (input, options) => new Ky(input, validateAndMerge(defaults, options));

		for (const method of requestMethods) {
			ky[method] = (input, options) => new Ky(input, validateAndMerge(defaults, options, {method}));
		}

		ky.create = newDefaults => createInstance(validateAndMerge(newDefaults));
		ky.extend = newDefaults => createInstance(validateAndMerge(defaults, newDefaults));
		ky.stop = stop;

		return ky;
	};

	var got = createInstance();

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
	    const response = await got.head(url);

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
	      const response = await got(url);
	      const idsResults = response.body.match(LATEST_ID_REGEX);
	      const latestId = idsResults[0].replace(/[^0-9]/g,"");
	      if (!parseInt(latestId))
	        return new Error(`Failed to return a numeric ID: ${latestId}`)

	      // returning the original string rather than an int because once the IDs
	      // get higher JS starts mangling them
	      return latestId

	    } catch (err) {
	      console.dir(err);
	      return err
	    }
	  },
	  text: async function(mirror) {
	    try {
	      const ids = await this.id(mirror);
	      const url = `${mirror}/json.php?ids=${ids}&fields=*`;
	      const response = await got(url);

	      // the API always returns an array of objects, so for functions like this
	      // which are mean to return a single text, we pick out the first (only)
	      // element in the array automatically
	      return JSON.parse(response.body)[0]

	    } catch (err) {
	      console.dir(err);
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
	          const response = await got(url);
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
	    const response = await got(query);

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
	        let page = await got(query);

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
	      const response = await got(url);
	      console.dir(response);
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

	async function getMirror() {
	  const urlString = await libgen.mirror();
	  console.log(`${urlString} is currently fastest`);
	}

	getMirror();

}());

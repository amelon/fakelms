/**
 *  FakeLMS utility
 *  Used this page as reference : http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
 *
 */
const FakeLMS = {}

/**
 * Tells whether FakeLMS is usable here and now
 */
FakeLMS.isAvailable = function() {
  return undefined !== window && 'localStorage' in window
}

FakeLMS.returnBooleanStrings = false

/**
 * Attaches the fake LMS API to the window object so that you can discover it like a genuine one.
 *
 */
FakeLMS.attachLMSAPIToWindow = function(storageKey = 'fkLMS') {
  if (!this.isAvailable()) {
    throw new Error('localStorage not available')
  }

  FakeLMS.storage = {
    set: function(key, value) {
      window.localStorage.setItem(`${storageKey}-${key}`, value)
    },

    get: function(key) {
      return window.localStorage.getItem(`${storageKey}-${key}`)
    },
    remove: function(key) {
      window.localStorage.removeItem(`${storageKey}-${key}`)
    }
  }
  window.API_1484_11 = new FakeLMSAPI()
}

FakeLMS.clearData = function() {
  ['exit', 'success_status', 'completion_status', 'interactions', 'suspend_data', 'location', 'entry'].forEach(
    FakeLMS.storage.remove
  )
  FakeLMS.storage.set('total_time', 0)
}

// error constants
//#region error constants
let a
FakeLMS.STATUS = {
  STARTED: 0,
  INITIALIZED: 1,
  TERMINATED: 2,
}
const ERRCODES = {}
const ERRSTRINGS = []
a = ERRCODES.NO_ERROR = 0
ERRSTRINGS[a] = 'No Error'
a = ERRCODES.GENERAL_INITIALIZATION_FAILURE = 102
ERRSTRINGS[a] = 'General Initialization Failure'
a = ERRCODES.ALREADY_INITIALIZED = 103
ERRSTRINGS[a] = 'Already Initialized'
a = ERRCODES.CONTENT_INSTANCE_TERMINATED = 104
ERRSTRINGS[a] = 'Content Instance Terminated'
a = ERRCODES.GENERAL_TERMINATION_FAILURE = 111
ERRSTRINGS[a] = 'General Termination Failure'
a = ERRCODES.TERMINATION_BEFORE_INITIALIZATION = 112
ERRSTRINGS[a] = 'Termination Before Initialization'
a = ERRCODES.GENERAL_ARGUMENT_ERROR = 201
ERRSTRINGS[a] = 'General Argument Error'
a = ERRCODES.GENERAL_GET_FAILURE = 301
ERRSTRINGS[a] = 'General Get Failure'
a = ERRCODES.GENERAL_SET_FAILURE = 351
ERRSTRINGS[a] = 'General Set Failure'
a = ERRCODES.UNDEFINED_DATA_ELEMENT = 401
ERRSTRINGS[a] = 'Undefined data element'
a = ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT = 402
ERRSTRINGS[a] = 'Unimplemented Data Model Element'
a = ERRCODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED = 403
ERRSTRINGS[a] = 'Data Model Element Value Not Initialized'
a = ERRCODES.DATA_MODEL_ELEMENT_IS_READ_ONLY = 404
ERRSTRINGS[a] = 'Data Model Element Is Read Only'
a = ERRCODES.DATA_MODEL_ELEMENT_IS_WRITE_ONLY = 405
ERRSTRINGS[a] = 'Data Model Element Is Write Only'
a = ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE = 407
ERRSTRINGS[a] = 'Data Model Element Value Out Of Range'

FakeLMS.ERRCODES = ERRCODES
FakeLMS.ERRSTRINGS = ERRSTRINGS

// #endregion error constants


FakeLMS.SUPPORTED_INTERACTIONS_FIELDS = [
  'id',
  'type',
  'learner_response',
  'result',
  '.correct_responses.0.pattern',
  'description',
  'weighting',
  'latency',
  'objectives.0.id',
  'timestamp',
]
FakeLMS.VALID_INTERACTIONS_TYPE_VALUES = [
  'choice',
  'fill-in',
  'likert',
  'long-fill-in',
  'matching',
  'numeric',
  'other',
  'performance',
  'sequencing',
  'true-false',
]

function FakeLMSAPI() {
  this.status = FakeLMS.STATUS.STARTED
  this.lastErrcode = FakeLMS.ERRCODES.NO_ERROR
  this.lastDiagnotic = ''
}

FakeLMSAPI.prototype._result = function(errcode, diagnostic) {
  this.lastErrcode = errcode
  this.lastDiagnotic = undefined === diagnostic ? '' : diagnostic
}

FakeLMSAPI.prototype._fail = function(errcode, diagnostic) {
  this._result(errcode, diagnostic)
  return FakeLMS.returnBooleanStrings ? 'false' : false
}

FakeLMSAPI.prototype._ok = function() {
  this._result(FakeLMS.ERRCODES.NO_ERROR)
  return FakeLMS.returnBooleanStrings ? 'true' : true
}

FakeLMSAPI.prototype.Initialize = function(wtf) {
  if ('string' !== typeof wtf || wtf.length) {
    return this._fail(FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR)
  }
  switch (this.status) {
    case FakeLMS.STATUS.STARTED:
      break // normal case
    case FakeLMS.STATUS.INITIALIZED:
      return this._fail(FakeLMS.ERRCODES.ALREADY_INITIALIZED)
    case FakeLMS.STATUS.TERMINATED:
      return this._fail(FakeLMS.ERRCODES.CONTENT_INSTANCE_TERMINATED)
    default:
      return this._fail(
        FakeLMS.ERRCODES.GENERAL_INITIALIZATION_FAILURE,
        'Unknown status ' + this.status
      )
  }
  this.session_time = 0
  if (null === FakeLMS.storage.get('total_time')) {
    FakeLMS.storage.set('total_time', 0)
  }
  this.status = FakeLMS.STATUS.INITIALIZED
  return this._ok()
}

FakeLMSAPI.prototype.Terminate = function(wtf) {
  if ('string' !== typeof wtf || wtf.length) {
    return this._fail(FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR)
  }
  switch (this.status) {
    case FakeLMS.STATUS.STARTED:
      return this._fail(FakeLMS.ERRCODES.TERMINATION_BEFORE_INITIALIZATION)
    case FakeLMS.STATUS.INITIALIZED:
      break // normal case
    case FakeLMS.STATUS.TERMINATED:
      // no specific error is designed for this
      // maybe not so important, lat just warn
      console.warn('LMS API : Terminate() called after termination')
      break
    default:
      return this._fail(
        FakeLMS.ERRCODES.GENERAL_TERMINATION_FAILURE,
        'Unknown status ' + this.status
      )
  }
  this.status = FakeLMS.STATUS.TERMINATED
  // updating total_time by adding last set session_time
  FakeLMS.storage.set(
    'total_time',
    Number(FakeLMS.storage.get('total_time')) + this.session_time
  )
  return this._ok()
}

/**
 * Return the value for the given key.
 *
 *  For now only cmi.interactions.* paths are supported.
 *
 *  @param {string} path the identifier of the requested value
 */
FakeLMSAPI.prototype.GetValue = function(path) {
  let entryValue
  if ('string' !== typeof path) {
    return this._fail(
      FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR,
      'GetValue takes a string as parameter'
    )
  }

  const parts = path.split('.')
  if (parts.length < 2) {
    return this._fail(FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT)
  }
  if ('cmi' !== parts[0]) {
    return this._fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
  if (-1 !== ['exit', 'session_time'].indexOf(parts[1])) {
    return this._fail(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_IS_WRITE_ONLY)
  }
  switch (parts[1]) {
    case 'entry': // no break
      entryValue = FakeLMS.storage.get('entry')
      return entryValue === null ? 'ab-initio' : entryValue
    case 'completion_status': // no break
    case 'success_status':
      return FakeLMS.storage.get(parts[1])
    case 'total_time':
      return 'PT' + FakeLMS.storage.get('total_time') + 'S'
    case 'suspend_data':
      return FakeLMS.storage.get('suspend_data')
    case 'location':
      return FakeLMS.storage.get('location')
    case 'interactions':
      return handleGetInteractions(path, parts, this._fail.bind(this))
    default:
      return this._fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
}

function handleGetInteractions(path, parts, _fail) {
  if (parts.length < 3) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }
  let interactions
  try {
    interactions = JSON.parse(FakeLMS.storage.get('interactions')) || []
  } catch (e) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_GET_FAILURE,
      'internal : interactions parse error : ' + e.message
    )
  }

  if ('object' !== typeof interactions) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_GET_FAILURE,
      'internal : interactions is not an object'
    )
  }
  if (!Array.isArray(interactions)) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_GET_FAILURE,
      'internal : interactions is not an array'
    )
  }

  switch (parts[2]) {
    case '_count':
      return interactions.length
    case '_children':
      return FakeLMS.SUPPORTED_INTERACTIONS_FIELDS
    default:
      return handleGetInteractionsDefault(path, parts, interactions, _fail)
  }
}

function handleGetInteractionsDefault(path, parts, interactions, _fail) {
  const nbInteractions = interactions.length

  // must be an integer
  if (!parts[2].match(/^[0-9]+$/)) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }
  const n = Number(parts[2])
  if (n >= nbInteractions) {
    return _fail(
      FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED
    )
  }
  const interaction = interactions[n]
  if (parts.length < 4) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }

    const field =
    parts[3] === 'correct_responses'
      ? `${parts[3]}.${parts[4]}.${parts[5]}`
      : parts[3]

  if (-1 === FakeLMS.SUPPORTED_INTERACTIONS_FIELDS.indexOf(field)) {
    return _fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
  if (!(field in interaction)) {
    return _fail(
      FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED,
      'not initialized : ' + path
    )
  }
  return interaction[field]
}

FakeLMSAPI.prototype.SetValue = function(path, value) {
  if ('string' !== typeof path || 'string' !== typeof value) {
    return this._fail(
      FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR,
      'SetValue takes strings as parameters'
    )
  }

  const parts = path.split('.')
  if (parts.length < 2) {
    return this._fail(FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT)
  }
  if ('cmi' !== parts[0]) {
    return this._fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
  if (-1 !== ['total_time'].indexOf(parts[1])) {
    return this._fail(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_IS_READ_ONLY)
  }

  switch (parts[1]) {
    case 'exit':
      if (
        -1 === ['timeout', 'suspend', 'logout', 'normal', ''].indexOf(value)
      ) {
        return this._fail(
          FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE
        )
      }
      FakeLMS.storage.set('exit', value) // not really necessary ? (cms.exit is write-only)
      if (-1 !== ['suspend', 'logout'].indexOf(value)) {
        FakeLMS.storage.set('entry', 'resume') // lms mimic
      } else {
        FakeLMS.storage.set('entry', '') // lms mimic
      }

      break
    case 'completion_status':
      if (
        -1 ===
        ['completed', 'incomplete', 'not attempted', 'unknown'].indexOf(value)
      ) {
        return this._fail(
          FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE
        )
      }
      FakeLMS.storage.set('completion_status', value)
      break
    case 'success_status':
      if (-1 === ['passed', 'failed', 'unknown'].indexOf(value)) {
        return this._fail(
          FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE
        )
      }
      FakeLMS.storage.set('success_status', value)
      break
    case 'session_time':
      /* eslint-disable-next-line no-case-declarations */
      let captured = /PT(\d+)S/.exec(value)
      if (null === captured) {
        return this._fail(
          FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE,
          'set cmi.session_time with value that do not match /PT\\d+S/ (sole pattern recognized so far)'
        )
      }
      this.session_time = Number(captured[1])
      break

    case 'suspend_data':
      if (value.length > 64000) {
        return this._fail(
          FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE,
          `set cmi.suspend_data with value greater than 64k is not allowed - received ${value.length}`
        )
      }
      FakeLMS.storage.set('suspend_data', value)
      break
    case 'location':
      FakeLMS.storage.set('location', value)
      break

    case 'interactions':
      handleSetInteractions(path, value, parts, this._fail.bind(this))
      break

    default:
      return this._fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
  return this._ok()
}

function handleSetInteractions(path, value, parts, _fail) {
  if (parts.length < 3) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }

  let interactions
  try {
    interactions = JSON.parse(FakeLMS.storage.get('interactions')) || []
  } catch (e) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_SET_FAILURE,
      'internal : interactions parse error : ' + e.message
    )
  }

  if ('object' !== typeof interactions) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_SET_FAILURE,
      'internal : interactions is not an object'
    )
  }
  if (!Array.isArray(interactions)) {
    return _fail(
      FakeLMS.ERRCODES.GENERAL_SET_FAILURE,
      'internal : interactions is not an array'
    )
  }

  switch (parts[2]) {
    case '_count':
    case '_children':
      return _fail(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_IS_READ_ONLY)
    default:
      handleSetInteractionsDefault(path, value, parts, interactions, _fail)
      break // normal case
  }
}

function handleSetInteractionsDefault(path, value, parts, interactions, _fail) {
  if (parts.length < 4) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }
  // must be an integer
  if (!parts[2].match(/^[0-9]+$/)) {
    return _fail(
      FakeLMS.ERRCODES.UNDEFINED_DATA_ELEMENT,
      'Unknown data element : ' + path
    )
  }

  const field =
    parts[3] === 'correct_responses'
      ? `${parts[3]}.${parts[4]}.${parts[5]}`
      : parts[3]
  const nbInteractions = interactions.length

  if (-1 === FakeLMS.SUPPORTED_INTERACTIONS_FIELDS.indexOf(field)) {
    return _fail(FakeLMS.ERRCODES.UNIMPLEMENTED_DATA_MODEL_ELEMENT)
  }
  if ('type' === field) {
    if (-1 === FakeLMS.VALID_INTERACTIONS_TYPE_VALUES.indexOf(value)) {
      return _fail(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE)
    }
  }
  const n = Number(parts[2])
  if (n >= nbInteractions) {
    // initializing missing elements with 'blank' interactions
    for (let i = nbInteractions; i <= n; i++) {
      interactions.push({
        id: i,
        type: 'true-false',
        learner_response: 'true',
      })
    }
  }
  interactions[n][field] = value
  FakeLMS.storage.set('interactions', JSON.stringify(interactions))
}

/**
 *  Does nothing ! Should be called on real LMS though.
 */
FakeLMSAPI.prototype.Commit = function(wtf) {
  if ('string' !== typeof wtf || wtf.length) {
    return this._fail(FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR)
  }
  return this._ok()
}

FakeLMSAPI.prototype.GetLastError = function() {
  return this.lastErrcode
}

FakeLMSAPI.prototype.GetErrorString = function(errCode) {
  return FakeLMS.ERRSTRINGS[errCode]
}

FakeLMSAPI.prototype.GetDiagnostic = function() {
  // ignoring errCode to retrieve the precise last diagnostic, if available : perhaps more than a LMS API is supposed to do ?
  return this.lastDiagnotic
}


export default FakeLMS

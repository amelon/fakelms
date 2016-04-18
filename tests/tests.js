var test = window.unitjs;
var FakeLMS;
var LMSAPI;
describe('FakeLMS', function() {
	describe('Fundamental', function() {
		it('FakeLMS object is present', function() {
			test
				.object(window)
				.hasProperty('FakeLMS');
		});
		FakeLMS = window.FakeLMS;
		it('FakeLMS object has method attachLMSAPIToWindow()', function() {
			test.function(FakeLMS.attachLMSAPIToWindow);
		});
		it('LMS API is absent before call to attachLMSAPIToWindow', function() {
			test
				.object(window)
				.hasNotProperty('API_1484_11');
		});
		it('LMS API is present after call to attachLMSAPIToWindow', function() {
			FakeLMS.attachLMSAPIToWindow();
			test
				.object(window)
				.hasProperty('API_1484_11');
			LMSAPI = window.API_1484_11;
		});
		['Initialize','Terminate','GetValue','SetValue','Commit','GetLastError','GetErrorString','GetDiagnostic'].forEach(function(methodName) {
			it('Method '+methodName+' exists', function() {
				test.function(LMSAPI[methodName]);
			});
		});
		it('Reinitialized LMSAPI is a different object', function() {
			var previousLSMAPI = LMSAPI;
			FakeLMS.attachLMSAPIToWindow();
			LMSAPI = window.API_1484_11;
			test
				.object(LMSAPI)
				.isNotIdenticalTo(previousLSMAPI);
		});
	});
	var init = function() {
		delete window.API_1484_11;
		FakeLMS.attachLMSAPIToWindow();
		LMSAPI = window.API_1484_11;
	}
	describe('Initializing/Terminating', function() {
		describe('Standard case', function() {
			it('Initializing LMSAPI correctly returns true', function() {
				init();
				var result = LMSAPI.Initialize("");
				test.bool(result).isTrue();
			});
			it('Terminating LMSAPI correctly returns true', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.Terminate("");
				test.bool(result).isTrue();
			});
		});
		describe('Arguments misuses', function() {
			var f = function(methodName, argDesc, args) {
				it('Calling '+methodName+'() onLMSAPI with '+argDesc+' returns false and set error to "invalid argument"', function() {
					var result,errcode;
					init();
					result = LMSAPI[methodName].apply(LMSAPI, args);
					test.bool(result).isFalse();
					errcode = LMSAPI.GetLastError();
					test.number(errcode).isEqualTo(FakeLMS.ERRCODES.GENERAL_ARGUMENT_ERROR);
				});
			}
			f('Initialize','no argument',[]);
			f('Initialize','null argument',[null]);
			f('Initialize','non-empty string',['non-empty']);
			f('Initialize','number',[1]);
			f('Initialize','object',[{}]);
			f('Initialize','function',[function(){}]);
			f('Terminate','no argument',[]);
			f('Terminate','null argument',[null]);
			f('Terminate','non-empty string',['non-empty']);
			f('Terminate','number',[1]);
			f('Terminate','object',[{}]);
			f('Terminate','function',[function(){}]);
		});
		describe('State errors', function() {
			it('Initializing LMSAPI twice returns false and set error to ALREADY_INITIALIZED', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.Initialize("");
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.ALREADY_INITIALIZED);
			});
			it('Terminating LMSAPI before initialization returns false and set error to TERMINATION_BEFORE_INITIALIZATION', function() {
				init();
				var result = LMSAPI.Terminate("");
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.TERMINATION_BEFORE_INITIALIZATION);
			});
		});
	});
	describe('GetErrorString', function() {
		it('GetErrorString(FakeLMS.ERRCODES.ALREADY_INITIALIZED) returns "Already Initialized"', function() {
			init();
			errstr = LMSAPI.GetErrorString(FakeLMS.ERRCODES.ALREADY_INITIALIZED);
			test.string(errstr).isEqualTo("Already Initialized");
		});
	});
	describe('Setting/Getting values', function() {
		describe('cmi.exit', function() {
			it('setting cmi.exit with expected value', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.exit','suspend');
				test.bool(result).isTrue();
			});
			it('setting cmi.exit with unexpected value fails with DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.exit','whatever');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE);
			});
			it('getting cmi.exit fails with DATA_MODEL_ELEMENT_IS_WRITE_ONLY', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.GetValue('cmi.exit');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_IS_WRITE_ONLY);
			});
		});
		describe('cmi.completion_status', function() {
			it('setting cmi.completion_status with expected value', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.completion_status','completed');
				test.bool(result).isTrue();
			});
			it('setting cmi.completion_status with unexpected value fails with DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.completion_status','whatever');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE);
			});
			it('getting cmi.completion_status returns what was set before', function() {
				init();
				LMSAPI.Initialize("");
				LMSAPI.SetValue('cmi.completion_status','completed');
				var result = LMSAPI.GetValue('cmi.completion_status');
				test.string(result).isEqualTo('completed');
			});
		});
		describe('cmi.success_status', function() {
			it('setting cmi.success_status with expected value', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.success_status','passed');
				test.bool(result).isTrue();
			});
			it('setting cmi.success_status with unexpected value fails with DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE', function() {
				init();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.success_status','whatever');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE);
			});
			it('getting cmi.success_status returns what was set before', function() {
				init();
				LMSAPI.Initialize("");
				LMSAPI.SetValue('cmi.success_status','passed');
				var result = LMSAPI.GetValue('cmi.success_status');
				test.string(result).isEqualTo('passed');
			});
		});
		describe('cmi.interactions', function() {
			it('getting cmi.interactions._children returns a non-empty array of strings', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.GetValue('cmi.interactions._children');
				test.array(result);
				test.number(result.length).isGreaterThan(0);
				result.forEach(test.string);
			});
			it('setting cmi.interactions._children fails with DATA_MODEL_ELEMENT_IS_READ_ONLY', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.interactions._children','whatever');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_IS_READ_ONLY);
			});
			it('getting cmi.interactions._count prior to any set returns 0', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.GetValue('cmi.interactions._count');
				test.number(result).isEqualTo(0);
			});
			it('setting cmi.interactions.0.id to anything returns true', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.interactions.0.id','whatever');
				test.bool(result).isTrue();
			});
			it('setting cmi.interactions.0.type to a legal value returns true, further get() returns the value', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.interactions.0.type','choice');
				test.bool(result).isTrue();
				result = LMSAPI.GetValue('cmi.interactions.0.type');
				test.string(result).isEqualTo('choice');
			});
			it('setting cmi.interactions.0.type to an illegal value returns false', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				var result = LMSAPI.SetValue('cmi.interactions.0.type','whatever');
				test.bool(result).isFalse();
			});
			it('getting cmi.interactions.2.id when cmi.interactions.count == 1 returns false with error code DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED', function() {
				init();
				FakeLMS.clearData();
				LMSAPI.Initialize("");
				LMSAPI.SetValue('cmi.interactions.0.id','whatever');
				var result = LMSAPI.GetValue('cmi.interactions.2.id');
				test.bool(result).isFalse();
				errcode = LMSAPI.GetLastError();
				test.number(errcode).isEqualTo(FakeLMS.ERRCODES.DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED);
			});
		});
	});
	describe('FakeLMS.clearData()', function() {
		it('FakeLMS.clearData() remove all window.localstorage keys owned by FakeLMS', function() {
			init();
			FakeLMS.clearData();
			LMSAPI.Initialize("");
			LMSAPI.SetValue('cmi.exit','suspend');
			LMSAPI.SetValue('cmi.success_status','passed');
			LMSAPI.SetValue('cmi.completion_status','completed');
			LMSAPI.SetValue('cmi.interactions.0.id','whatever');
			LMSAPI.SetValue('cmi.interactions.0.type','choice');
			LMSAPI.SetValue('cmi.interactions.0.learner_response','1');
			FakeLMS.clearData();
			['exit','success_status','completion_status','interactions'].forEach(function(key) {
				test.value(window.localStorage.getItem(key)).isNull();
			});
		});
	});
});
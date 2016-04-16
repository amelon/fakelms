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
	describe('Setting values', function() {
		describe('Standard case', function() {
			//TODO
		});
	});
/*
  var MainClass = require('my-module/lib/main');
  it('load', function() {
    var myModule  = require('my-module');
    test
      .function(myModule)
        .hasName('MyModule')
      .object(myModule())
        .isInstanceOf(MainClass)
    ;
  });
  describe('Main class', function() {
    it('emit() - emit an event', function() {
      var spy  = test.spy();
      var main = new MainClass();
      var listener = function(value) {
        spy();
        // test the value emitted
        test.string(value)
          .isIdenticalTo('value of any event');
      };
      test
        .given('add listener', function() {
          main.on('any.event', listener);
        })
        .when('emit an event', function() {
          main.emit('any.event', 'value of any event');
        })
        .then(function() {
          test
            .function(main.listeners('any.event'))
            .bool(spy.calledOnce)
              .isTrue()
          ;
        })
    });
    it('connection', function(done) {
      // asynchronous test
      main.get('http://localhost/api/show/item', function(err, json, headers) {
        var now = new Date();
        if(err) {
          test.fail(err.message);
        }
        test
          .value(headers)
            .hasHeaderJson()
          .object(json)
            .hasKey('title', 'item title')
            .hasKey('description')
          .date(json.updatedAt)
            .isBefore(now)
        ;
        done();
      });
    });
  });*/
});
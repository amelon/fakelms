# fakelms
Enable to quickly test simple SCORM modules by emulating some LMS clientside

## features
This will emulate an outrageously basic LMS for testing purpose. It poorly reproduces SCORM 2004 LMS API, emulating only what I needed to quickly test my modules without needing to upload a SCORM module on some plateform.


It will try to behave as much as possible like a real LMS, respecting design oddities. For instance calling Initialize with anything but the empty string as parameter will fail.

Altough it will give less than a complete LMS API it will not give more because the client code should not rely on specific functionnalities that would be exposed here.


It will attach an object responding to LMS API calls to the window.API\_1484\_11 property.


If you find this piece of software useful and need it to be enhanced then feel free to propose pulls.

### supported data model
- cmi.exit
- cmi.completion\_status
- cmi.success\_status
- cmi.session\_time (only "PT\<n\>S" format is supported for now)
- cmi.total\_time (only "PT\<n\>S" string will be returned for now)
- cmi.interactions.\_count
- cmi.interactions.\_children (holds `['id','type','learner_response']`)
- cmi.interactions.\<n\>.id
- cmi.interactions.\<n\>.type
- cmi.interactions.\<n\>.learner\_response

## usage

```sh
$ npm install --save-dev fakelms
```

```javascript
var FakeLMS = require('fakelms');

if ( ! FakeLMS.isAvailable()) {
	console.log("Can't use fake LMS with this browser, sorry");
}

// you may want the following line before calling attachLMSAPIToWindow()
// so that functions returning booleans return them as strings, as some LMS APIs do in real life
FakeLMS.returnBooleanStrings = true;


FakeLMS.attachLMSAPIToWindow('myStorageKey'); // in case of multiple module to dev - you could use module name as storagekey
console.log('Now window.API\_1484\_11 is defined and will respond to LMS calls');
// you then can discover it like real LMS (see http://scorm.com/scorm-explained/technical-scorm/run-time/api-discovery-algorithms/)

FakeLMS.clearData(); // if you need to remove all stored data, a fresh restart

```


## implentation details
LMS data is stored in local storage between sessions. If the browser do not support it then FakeLMS.isAvailable returns false;
# fakelms
Enable to quickly test simple SCORM modules by emulating some LMS clientside

version 0.0.1 : not usable yet (testing packaging and npmjs hosting)

## features
This will emulate an outrageously basic LMS for testing purpose. It poorly reproduces SCORM 2004 LMS API, emulating only what I needed to quickly test my modules without needing to upload a SCORM module on some plateform.


It will try to behave as much as possible like a real LMS, respecting design oddities. For instance calling Initialize with anything but the empty string as parameter will fail.

Altough it will give less than a complete LMS API it will not give more because the client code should not rely on specific functionnalities that would be exposed here.


It will attach an object responding to LMS API calls to the window.API_1484_11 property.


If you find this piece of software useful and need it to be enhanced then feel free to propose pushes.

## usage

```
$ npm i --save fakelms
```

```
var FakeLMS = require('fakelms');

if ( ! FakeLMS.isAvailable()) {
	console.log("Can't use fake LMS with this browser, sorry");
}

FakeLMS.attachLMSAPIToWindow();
console.log('Now window.API_1484_11 is defined and will respond to LMS calls');

FakeLMS.clearData(); // if you need to remove all stored data, a fresh restart

```


### clientside storage
LMS data is stored in local storage between sessions.
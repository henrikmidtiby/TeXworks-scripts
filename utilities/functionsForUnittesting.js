var testPassed = 0;

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  testPassed++;
  if (!exp) {
    throw new AssertException(message);
  }
}

function assertEqual(value, expectedValue)
{
	if(value !== expectedValue)
	{
		var temp = {};
		temp.value = value;
		temp.expectedValue = expectedValue;
		showObject(temp, 'Assertion failed');
		showObject(value, "Value");
		showObject(expectedValue, "Expected value");
	}
	assert(value === expectedValue, 'Got "' + value + '" expected "' + expectedValue + '"');
}


function assertEqualLists(value, expectedValue)
{
	len1 = value.length;
	len2 = expectedValue.length;
	assert(len1 === len2, 'List lengths differs');
	for(k = 0; k < len1; k++)
	{
		assert(value[k] === expectedValue[k], 'The ' + k + 'th element differs. Actual value: "' + value[k] + '" expected value "' + expectedValue[k] + '".');
		testPassed--;
	}
}

function assertEqualDicts(value, expectedValue)
{
	for(prop in value)
	{
		assert(expectedValue[prop] !== undefined, 
			'expectedValue["' + prop + '"] is not defined.');
		testPassed--;
		assert(value[prop] == expectedValue[prop], 'Property: "' + prop + '" does not match.' + 
			' value["' + prop + '"] = "' + value[prop] + '" ' + 
			' expectedValue["' + prop + '"] = "' + expectedValue[prop] + '"' );
		testPassed--;
	}

	for(prop in expectedValue)
	{
		assert(value[prop] !== undefined, 
			'value["' + prop + '"] is not defined.');
		testPassed--;
		assert(value[prop] == expectedValue[prop], 'Property: "' + prop + '" does not match.' + 
			' value["' + prop + '"] = "' + value[prop] + '" ' + 
			' expectedValue["' + prop + '"] = "' + expectedValue[prop] + '"' );
		testPassed--;
	}
	testPassed++;
}

function showTestSummary()
{
	var temp = {};
	temp.message = testPassed + ' tests passed';
	showObject(temp);
}


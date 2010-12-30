// TeXworksScript
// Title: Context aware autocomplete
// Description: Autocompletion inspired by vim.
// Author: Henrik Skov Midtiby
// Version: 0.2
// Date: 2010-12-30
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+M

// Helper functions


function isAlphaNumeric(character)
{
	if('a' <= character && character <= 'z') {
		return(true); }
	if('A' <= character && character <= 'Z') {
		return(true); }
	if('0' <= character && character <= '9') {
		return(true); }
	return(false);
}


function isAlphaNumericKommaOrSpace(character)
{
	if('a' <= character && character <= 'z') {
		return(true); }
	if('A' <= character && character <= 'Z') {
		return(true); }
	if('0' <= character && character <= '9') {
		return(true); }
	if(',' == character) {
		return(true); }
	if(' ' == character) {
		return(true); }
	if('\t' == character) {
		return(true); }
	return(false);
}


// Code from http://www.martienus.com/code/javascript-remove-duplicates-from-array.html
function unique(a)
{
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++)
   {
      for(var x = 0, y = r.length; x < y; x++)
      {
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}


function max(a, b)
{
	if(a > b) {
		return(a);
	} else {
		return(b);
	}
}


function locateWordEndingOnCursor()
{
	// Locate word ending at cursor location.
	var wordStart = TW.target.selectionStart;
	var wordEnd = TW.target.selectionStart;

	while(isAlphaNumeric(TW.target.text.charAt(wordStart - 1)))
	{
		wordStart = wordStart - 1;
	}

	var extractedWord = TW.target.text.substr(wordStart, wordEnd - wordStart);
	var markedWord = TW.target.selection;
	var lastGuess = extractedWord + markedWord;

	// Determine if the word is a parameter to a command
	var counter = 100;
	var commandName = "nothing";
	while(counter > 0 && isAlphaNumericKommaOrSpace(TW.target.text.charAt(wordStart - 1)))
	{
		wordStart = wordStart - 1;
		counter = counter - 1;
		commandName = "something";
	}
	if(TW.target.text.charAt(wordStart - 1) == "{")
	{
		commandName = "more";
		var commandEnd = wordStart - 1;
		var commandStart = wordStart - 1;
		while(counter > 0 && isAlphaNumeric(TW.target.text.charAt(commandStart - 1)))
		{
			commandName = commandName + counter;
			commandStart = commandStart - 1;
			counter = counter - 1;
		}
		if(TW.target.text.charAt(commandStart - 1) == '\\')
		{
			commandName = TW.target.text.substr(commandStart, commandEnd - commandStart);
		}
	}

	return {wordStart: wordStart, extractedWord: extractedWord, lastGuess: lastGuess, commandName: commandName};
}


function locateMatchingWordsInString(wordToMatch, parameterText, words)
{
	var searchIndex = 0;
	// TW.target.insertText(parameterText);

	var continueInLoop = true;
	while(continueInLoop)
	{
		continueInLoop = false;
		var tempStart = parameterText.substr(searchIndex).indexOf(wordToMatch);
		if(tempStart > -1)
		{
			var tempEnd = tempStart;
			while(isAlphaNumeric(parameterText.charAt(searchIndex + tempEnd)))
			{
				tempEnd = tempEnd + 1;
			}
			var tempWord = parameterText.substr(searchIndex + tempStart, tempEnd - tempStart);
			if(tempWord.length > wordToMatch.length && !isAlphaNumeric(parameterText.charAt(searchIndex + tempStart - 1)))
			{
				words.push(tempWord);
			}
			searchIndex = searchIndex + tempStart + 1;
			continueInLoop = true;
		}
	}
	return(words);
}


function locateMatchingWords(wordToMatch, commands)
{
	var words = [];
	fullText = TW.target.text;
	if(commands.length == 0)
	{
		// No command names were specified
		words = locateMatchingWordsInString(wordToMatch, fullText, words);
	}
	else
	{
		// One or more command names were specified.
		// Only search for matching words within parameters to these commands.
		for(idx1 = 0; idx1 < commands.length; idx1++)
		{
			var Command = commands[idx1];
			var RegExpString = "\\\\" + Command + "{([^}]*)}";
			var CommandParameters = new RegExp(RegExpString, "g");
			var labelsList = fullText.match(CommandParameters);
			for(idx = 0; idx < labelsList.length; idx++)
			{
				var parameterText = labelsList[idx];
				words = locateMatchingWordsInString(wordToMatch, parameterText, words);
			}
		}
		// TW.target.insertText("xx" + words + "xx");
	}
	// Remove duplicates
	words = unique(words);
	// Ensure that there is at least one word in the words list.
	if(words.length == 0)
	{
		words.push(wordToMatch);
	}
	return(words);
}


function determineLongestCommonInitialSequence(words)
{
	var CommonSequence = words[0];
	var SeqLength = words[0].length;
	if(words.length > 1)
	{
		CommonSequence = words[0];
		for(k = 1; k < words.length; k++)
		{
			for(kk = 0; kk < SeqLength; kk++)
			{
				if(words[0].charAt(kk) != words[k].charAt(kk))
				{
					SeqLength = kk;
					CommonSequence = words[0].substr(0, kk);
				}
			}
		}
	}
	return CommonSequence;
}


function determineNextGuess(words, lastGuess)
{
	// Insert first match after the currently marked section.
	var NextGuess = "";
	if(words.length > 0)
	{
		NextGuess = words[0];
		for(k = 0; k < words.length - 1; k++)
		{
			if(words[k] == lastGuess)
			{
				NextGuess = words[k + 1];
				break;
			}
		}
	}
	return NextGuess;
}


function getEndOfCommonSubstring(CommonSequence, inputWord)
{
	var offset = inputWord.extractedWord.length;
	var seqLength = CommonSequence.length - inputWord.extractedWord.length;
	return CommonSequence.substr(offset, seqLength);
}


function determineMatchingCommandsFromCurrentCommand(currentCommand)
{
	if(currentCommand == "ref" || currentCommand == "pageref")
	{
		return(["label"]);
	}
	if(currentCommand == "label")
	{
		return(["pageref", "ref"]);
	}
	return([]);
}


var inputWord = locateWordEndingOnCursor();
var matchingCommands = determineMatchingCommandsFromCurrentCommand(inputWord.commandName);
var words = locateMatchingWords(inputWord.extractedWord, matchingCommands);
var CommonSequence = determineLongestCommonInitialSequence(words);
var CommonStringInAllMatchingWords = getEndOfCommonSubstring(CommonSequence, inputWord);


// Insert remaining part of the common substring
TW.target.insertText(CommonStringInAllMatchingWords);

var NextGuess = determineNextGuess(words, inputWord.lastGuess);

TW.target.insertText(NextGuess.substr(CommonSequence.length, NextGuess.length));
TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));


// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));

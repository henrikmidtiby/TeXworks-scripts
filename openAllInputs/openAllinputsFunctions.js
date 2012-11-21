//TeXworksScript
//Title: Open All .tex Inputs/Includes (one per line)
//Description: Within A Selection or all Text \inputs \include with .tex in them are opened
//Author: Paul A Norman  paul.a.norman@gmail.com
// with modifications by Henrik Skov Midtiby
//Version: 0.2
//Date: 2011-11-11
//Script-Type: standalone

/* Main Usage Points:

	 1. If the cursor is between the braces of an \include{here.tex} or 
	 \input{there.tex} that document only will be opened

	 2. If you Select some lines of text anywhere (even before or after the 
	 document environment) all \include{my-files.tex} or 
	 \input{my-other-files.tex} will be opened (even for \include{files.tex} 
	 that are not in \includeonly{list.tex,of.tex,files.tex}

	 3. If you Select nothing and the cursor is not between 
	 \something{braces} then all active \input{}-s and include{}-s between 
	 \begin{document and \end{document} will be processed. If an 
	 \includeonly is active in the preamble (not % commented out) it will be 
	 used to check for any \include{file-names.tex} before using them.

	 4. Any %commented out lines will be ignored except when the cursor is 
	 between braces for the opening of one file only.

	 5. All \input{filename.tex} and \include{filename.tex} need to have 
	 .tex as part of their name as for \includeonly{one.tex,two.tex,etc.tex}

	 6. No leading space(s) before \input{} or \include{}, and only one per
	 line. %comments or anything else can follow (ok) e.g. 
	 \input(my-file.tex} % something to say here
	 \input(my-file.tex} \somethingToDoHere

 */


const EXISTS = 0;
const MAYEXIST = 2;
const DOESNTEXIST = 1;

// Make the script work with texworks versions earlier than r961
if (typeof(TW.fileExists) == "undefined") {
    TW.fileExists = function() { return MAYEXIST; };
}

function showObject(inputObject)
{
	var tempText = "";
	for(prop in inputObject){
		tempText += prop + " -> " + inputObject[prop] + "\n";
	}
	TW.information(null, "Hej", tempText);
}
function getCurrentLine()
{
	var wordStart = TW.target.selectionStart;
	var lineStart = wordStart;
	var lineEnd = wordStart;
	txt = TW.target.text;
	while(txt.charAt(lineStart - 1) !== '\n' && lineStart > 0)
	{
		lineStart = lineStart - 1;
	}
	while(txt.charAt(lineEnd + 1) !== '\n' && lineEnd < txt.length)
	{
		lineEnd = lineEnd + 1;
	}
	var currentLine = txt.substr(lineStart, 1 + lineEnd - lineStart);
	return(currentLine);
}
function getTexWorksLines(filecontent)
{
	var res = {};
	lines = filecontent.split("\n");
	for(lineIdx in lines)
	{
		var line = lines[lineIdx];
		var texworksLine = new RegExp("%\\s*!\\s*TEX\\s+(.*?)\\s*=\\s*(.*)", "i");
		m = line.match(texworksLine);
		if(m)
		{
			key = m[1];
			value = m[2];
			res[key] = value;
		}
	}
	return res;
}
function getPathFromFilename(filename)
{
	// Locate the last directory separator
	var counter = 0;
	var lastDirectorySeparator = -1;
	while(counter < filename.length)
	{
		if(filename.charAt(counter) == '/')
		{
			lastDirectorySeparator = counter;
		}
		counter += 1;
	}
	var basepath = filename.substr(0, lastDirectorySeparator);
	return basepath;
}
function getRelPathToRootDocument()
{
	texworkLines = getTexWorksLines(TW.target.text);
	//showObject(texworkLines);
	if(texworkLines['root'] !== undefined)
	{
		rootFilePath = texworkLines['root'];
		relPath = getPathFromFilename(rootFilePath);
		if(relPath === "")
			return "";
		else
			return relPath + '/';
	}
	return "";
}
function writeTexWorksLines(texworksLines)
{
	var str = "";
	for(prop in texworksLines)
	{
		str += "% !TeX " + prop + " = " + texworksLines[prop] + "\n";
	}
	return str;
}
function adjustRootFileLocation(texworksLines, newWindow)
{
	var temp = {};
	temp.curFileDirectory = TW.target.fileName;
	temp.newFileDirectory = newWindow.result.fileName;
	differences = directoryDifferences(temp.newFileDirectory, temp.curFileDirectory);
	tempPath = differences + texworksLines["root"];
	tempPath = tempPath.replace('/[^/]+/\.\./','/'); 
	texworksLines["root"] = tempPath;
	return texworksLines;
}
function directoryDifferences(fileOne, fileTwo)
// How to go from directory of fileOne to the directory of fileTwo
{
	var temp = {};
	temp.fileOne = fileOne;
	temp.fileTwo = fileTwo;
	//showObject(temp);
	dirOne = getPathFromFilename(fileOne);
	dirTwo = getPathFromFilename(fileTwo);
	dirOneParts = dirOne.split("/");
	dirTwoParts = dirTwo.split("/");

	// Remove common parts of path
	var commonPathElements = 0;
	for(k = 0; k < dirOneParts.length; k++)
	{
		if(dirOneParts[k] === dirTwoParts[k])
		{
			commonPathElements = k + 1;
		}
		else
	 	{
			break;
		}
	}

	var str = "";
	for(k = commonPathElements; k < dirOneParts.length; k++)
	{
		str += "../";
	}
	for(k = commonPathElements; k < dirTwoParts.length; k++)
	{
		if(dirTwoParts[k] === "")
			break;
		str += dirTwoParts[k] + "/";
	}
	return str;
}
// Function for removing dublicate element in an array.
// Code from http://www.martienus.com/code/javascript-remove-duplicates-from-array.html
function unique(a)
{
	var r = new Array();
	o:for(var i = 0, n = a.length; i < n; i++)
	{
		for(var x = 0, y = r.length; x < y; x++)
		{
			if(r[x]==a[i])
			{
				continue o;
			}
		}
		r[r.length] = a[i];
	}
	return r;
}
function OpenAllInputFiles()
{
	var obj = {};
	obj.openInputFiles = function()
	{
		this.initializeVariables();
		this.getTextToAnalyze();
		this.detectIncludeOnlyStatements();
		this.searchForInputStatements();
		this.openLocatedFiles();
		if (obj.followThese.length == 1)
		{
			//openedDoc.showNormal()
		} // user has requested only one file, show it
		else
		{
			TW.warning(null,"Look Under Window Menu", "Files Are Available\nUnder the Window Menu");
		}

	}

	obj.initializeVariables = function()
	{
		this.inDocument = false;
		this.explicitSelection = false;
		this.checkForIncludeOnly = false;
		this.buildIncludeOnly='';
		this.followThese = new Array();
		this.includeList = new Array();
		this.includeFound = '';

		var currentFileName  =  TW.target.fileName;
		var currentDirectoryLastDelim  =  currentFileName.lastIndexOf('/');
		this.currentDirectory = currentFileName.substr(0,currentDirectoryLastDelim +1);
		this.texworksLines = getTexWorksLines(TW.target.text);
	}
	obj.getTextToAnalyze = function()
	{
		this.txt = TW.target.selection;
		this.checkForRootFile(getCurrentLine());
		if (this.txt == "")
		{ 
			var selStart =TW.target.selectionStart;
			TW.target.balanceDelimiters(); // check if cursor is in an input or include 
			this.txt = TW.target.selection;
			// protect document form accidental alteration of script 
			// selected area reposition cursor to original position
			TW.target.selectRange(selStart); 

			if (this.txt != "")
			{
				var currentLine = getCurrentLine();
				if (this.doesLineContainInputOrInclude(currentLine) || this.doesLineContainUsepackage(currentLine))
				{
					this.txt = currentLine;
					this.inDocument = true;
					this.explicitSelection = true;
				}
			}		
			else     
			{
				this.txt = TW.target.text;
			}
		}// if (txt == "")
		else  // User has explicitly chosen to open these, no matter where they are
		{
			this.inDocument = true;
			this.explicitSelection = true;
		} 
		this.alLines = this.txt.split("\n");
	}

	obj.checkForRootFile = function(currentLine)
	{
		// % !TEX root = main.tex
		var refersToMainFile = new RegExp("% !TEX root = (.*)", "i");
		matches = currentLine.match(refersToMainFile);
		if(matches)
		{
			fileName = matches[1];
			fileName = this.currentDirectory + fileName; 
			this.followThese.push(fileName); 
		}
	}
	////////////// Premable End \\\\\\\\\\\\\

	obj.detectIncludeOnlyStatements = function()
	{
		if (this.explicitSelection == false) // whole master document is being processed
		{
			var startIncludeOnly = this.txt.indexOf('\\includeonly{'); // there is at least one in document
			if (startIncludeOnly > -1)
			{
				// weed out commented out %\includeonly{}-s
				for (check in this.alLines)
				{
					var tempLine = this.alLines[check];
					this.handleActiveIncludeOnlys(tempLine)

				} // /End. 	for (check in alLines)
			} // /End. if (startIncludeOnly > -1)
		}	 // /End. (explicitSelection == false)
		// TW.warning(null,"Build Include Only:", buildIncludeOnly);		 
	}
	obj.handleActiveIncludeOnlys = function(tempLine)
	{
		if (tempLine.indexOf('\\includeonly{') == 0) 
		{
			// not commented out should only be one \includeonly{ at this position in premable
			this.includeFound = this.alLines[check];
			this.checkForIncludeOnly = true ;
			this.buildIncludeOnly = this.includeFound.substr(13, this.includeFound.length - 12);	
			endIncludeOnly = this.buildIncludeOnly.indexOf("}");	
			this.buildIncludeOnly = this.buildIncludeOnly.substr(0, endIncludeOnly);
			this.includeList = this.buildIncludeOnly.split();
		}
	}
	obj.searchForInputStatements = function()
	{
		for (line in this.alLines)
		{
			if (this.alLines[line].substr(0,1) == '%'){continue;} // ignore commented lines

			// var thisLine = this.alLines[line].toLowerCase();	 
			var thisLine = this.alLines[line];	 

			if (thisLine.indexOf('\\begin{document}') >-1) 
			{
				this.inDocument = true;
			}   // avoid preamble references
			if ( (this.explicitSelection == false) & (thisLine.indexOf('\\end{document}')  >-1) ) 
			{
				// avoid user notes below document proper, but explicitSelection 
				// test can allow a user selection that crosses over the \end{document}.
				this.inDocument = false;
			}  

			obj.handleLinesWithInput(thisLine);
			obj.handleLinesWithInclude(thisLine);
			if(this.explicitSelection)
			{
				obj.handleExplicitSelection(thisLine);
			}
		}// /End. for	(line in alLines)
	}
	obj.handleLinesWithInput = function(thisLine)
	{
		if( this.inDocument && this.doesLineContainInput(thisLine))
		{
			beginInput = thisLine.indexOf('\\input{') + 7;
			endInput  = thisLine.indexOf('}');

			// use original reference to retain letter case of file name for sensative OSes ;) 
			var fileName = this.alLines[line].substr(beginInput,(endInput - beginInput)); 
			fileName = obj.determineFilename(fileName);
			this.followThese.push(fileName); 
		}
	}
	obj.handleLinesWithInclude = function(thisLine)
	{
		// ADVICE: We are looking for only one \input{} per line	
		if ( (this.inDocument == true) & this.doesLineContainInclude(thisLine))
		{
			beginInput = thisLine.indexOf('\\include{') + 9;
			endInput  = thisLine.indexOf('}');

			// use original reference to retain letter case of file name for sensative OSes ;) 
			var fileName = this.alLines[line].substr(beginInput,(endInput - beginInput)); 

			var shouldBeIncluded = true;
			//TW.warning(null,"Filename Check:", fileName);
			if (  (this.checkForIncludeOnly == true) & (this.buildIncludeOnly != "")  )
			{
				if(!this.isFileInIncludeList(fileName, this.includeList))
				{
					shouldBeIncluded = false;
				}
			} 

			fileName = obj.determineFilename(fileName);
			// keeping TW 'opening' in a seperate clause for debugging and any future scripting devlopment
			if(shouldBeIncluded)
			{
				this.followThese.push(fileName); 
			}
		}
	}
	obj.handleExplicitSelection = function(thisLine)
	{
		var temp = {};
		temp.method = 'handleExplicitSelection';
		temp.thisLine = thisLine;

		beginInput = thisLine.indexOf('{') + 1;
		endInput  = thisLine.indexOf('}');
		var fileName = thisLine.substr(beginInput, endInput - beginInput); 
		fileName = obj.determineFilename(fileName);
		this.followThese.push(fileName); 
	}
	obj.doesLineContainInput = function(thisLine)
	{
		var containsInput = thisLine.indexOf('\\input{') > -1;
		return containsInput;
	}
	obj.doesLineContainInclude = function(thisLine)
	{
		var containsInclude = thisLine.indexOf('\\include{') > -1;
		return containsInclude;
	}
	obj.doesLineContainUsepackage = function(thisLine)
	{
		var containsInput = thisLine.indexOf('\\usepackage') > -1;
		return containsInput;
	}
	obj.doesLineContainInputOrInclude = function(thisLine)
	{
		if(obj.doesLineContainInput(thisLine))
			return true;
		if(obj.doesLineContainInclude(thisLine))
			return true;
		return false;
	}
	obj.determineFilename = function(fileName)
	{
		suggestedFilenames = obj.suggestFilenames(fileName);
		fileName = obj.getFirstFilenameThatMayExist(suggestedFilenames);
		relPath = getRelPathToRootDocument();
		fileName = this.currentDirectory + relPath + fileName; 
		fileName = fileName.replace('//','/'); // remove any un-needed user added slash from input lead  
		fileName = fileName.replace('/./','/'); // remove any un-needed user added this-directory slash from input lead 			
		return fileName;
	}
	obj.suggestFilenames = function(inputFilename)
	{
		var generatedFilenames = [];
		if(obj.hasProperFilenameEnding(inputFilename))
		{
			generatedFilenames.push(inputFilename);
			return generatedFilenames;
		}
		else
		{
			generatedFilenames.push(inputFilename + ".tex");
			generatedFilenames.push(inputFilename + ".sty");
			generatedFilenames.push(inputFilename + ".tikz");
			generatedFilenames.push(inputFilename);
			return generatedFilenames;
		}
	}
	obj.getFirstFilenameThatMayExist = function(suggestedFilenames)
	{
		fileName = suggestedFilenames[0];
		for(filenameIdx = 0; filenameIdx < suggestedFilenames.length; filenameIdx++)
		{
			file = suggestedFilenames[filenameIdx];
			var existence = TW.fileExists(this.currentDirectory + file);
			if(existence == EXISTS)
			{
				fileName = file;
				break;
			}
			if(existence == MAYEXIST)
			{
				// Functionality not available and default to the first 
				// element in the list of suggestions.
				fileName = file;
				break;
			}
		}
		return fileName;
	}
	obj.hasProperFilenameEnding = function(filename)
	{
		if(filename.indexOf('.tex') > -1)
			return true;
		if(filename.indexOf('.tikz') > -1)
			return true;
		return false;
	}
	obj.isFileInIncludeList = function(fileName, includeList)
	{
		for (item in includeList)
		{
			if (includeList[item].indexOf(fileName) > -1 )
			{
				return true;
			}
		}	

		// include{fileName} not in \includeonly{}
		return false;
	}
	obj.openLocatedFiles = function()
	{
		// keeping TW 'opening' in a seperate clause for debugging and any future scripting development
		this.followThese = unique(this.followThese);
		for (fileNum in this.followThese)
		{
			fileName = this.followThese[fileNum];					 
			// TODO: Detect if the file allready exists.
			openedDoc = TW.app.openFileFromScript(fileName, TW);
			if(openedDoc.result == null)
			{
				this.createAndOpenFile(fileName);
			}
		}// /End.  for (fileNum in followThese)
	}
	obj.createAndOpenFile = function(fileName)
	{
		// Failed to open document, it might be because the document does not exist.
		// Create the document.
		var resp = TW.writeFile(fileName, "");
		var newWindow = TW.app.openFileFromScript(fileName, TW);
		if(newWindow.status == 0) // SystemAccess_OK
		{
			this.copyTEXOptionsFromCurrentDocumentToNewDocument(newWindow);
		}
	}
	obj.copyTEXOptionsFromCurrentDocumentToNewDocument = function(newWindow)
	{
		// Populate with % !TEX lines from the current document.
		var linesInCurrentDocument = TW.target.text.split("\n");
		for(idx in linesInCurrentDocument)
		{
			curLine = linesInCurrentDocument[idx];
			if(curLine.indexOf('% !TEX') > -1)
			{
//				newWindow.result.insertText(curLine);
//				newWindow.result.insertText("\n");
			}
		}
		modifiedTexworksLines = adjustRootFileLocation(this.texworksLines, newWindow);
		newWindow.result.insertText(writeTexWorksLines(modifiedTexworksLines));
	}
	return(obj);
}




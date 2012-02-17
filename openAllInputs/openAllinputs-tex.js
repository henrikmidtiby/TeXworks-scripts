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


function showObject(inputObject)
{
	var tempText = "";
	for(prop in inputObject){
		tempText += prop + " -> " + inputObject[prop] + "\n";
	}
	TW.information(null, "Hej", tempText);
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
		this.currentDirectory  = currentFileName.substr(0,currentDirectoryLastDelim +1);
	}
	obj.getTextToAnalyze = function()
	{
		this.txt = TW.target.selection;
		if (this.txt == "")
		{ 
			var selStart =TW.target.selectionStart;
			TW.target.balanceDelimiters(); // check if cursor is in an input or include 
			this.txt = TW.target.selection;
			TW.target.selectRange(selStart); /* protect document form accidental alteration of script selected area
												reposition cursor to original position*/

			if (this.txt != "")
			{
				if ( (this.txt.substr(0,1) == "{") & (this.txt.indexOf('.tex') > -1) )
				{
					this.txt = '\\input' + this.txt; // make ready for processing as below to open one file where cursor was between braces {my-file.tex}
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

			var thisLine = this.alLines[line].toLowerCase();	 

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

			// ADVICE: We are looking for only one \input{} per line	
			if ( (this.inDocument == true) & this.doesLineContainInputOrInclude(thisLine))
			{
				var doingInclude = false;

				if  (thisLine.indexOf('\\input{')>-1)
				{
					beginInput = thisLine.indexOf('\\input{') + 7;
				}
				else
				{
					beginInput = thisLine.indexOf('\\include{') + 9;
					doingInclude = true;
				}		 

				endInput  = thisLine.indexOf('.tex}') + 4;

				// use original reference to retain letter case of file name for sensative OSes ;) 
				var fileName = this.alLines[line].substr(beginInput,(endInput - beginInput)); 

				//TW.warning(null,"Filename Check:", fileName);
				if (  (this.checkForIncludeOnly == true) & (doingInclude == true) & (this.buildIncludeOnly != "")  )
				{
					if(this.isFileInIncludeList(fileName, this.includeList))
					{
						break;
					}
					else
					{
						continue;
					}
				} 

				fileName = this.currentDirectory + fileName; 
				fileName = fileName.replace('//','/'); // remove any un-needed user added slash from input lead  
				fileName = fileName.replace('/./','/'); // remove any un-needed user added this-directory slash from input lead 			

				// keeping TW 'opening' in a seperate clause for debugging and any future scripting devlopment
				this.followThese.push(fileName); 
			}
		}// /End. for	(line in alLines)
	}
	obj.doesLineContainInputOrInclude = function(thisLine)
	{
		return ((thisLine.indexOf('\\input{')>-1) | (thisLine.indexOf('\\include{')>-1) )& (thisLine.indexOf('.tex}')>-1) 
	}
	obj.isFileInIncludeList = function(fileName, includeList)
	{
		var usable = false;

		for (item in includeList)
		{
			if (includeList[item].indexOf(fileName) > -1 )
			{
				usable = true;
				break;
			}
		}	
		if (usable == false)					
		{ 
			continue; 
		} // include{fileName} not in \includeonly{}
	}
	obj.openLocatedFiles = function()
	{
		// keeping TW 'opening' in a seperate clause for debugging and any future scripting development
		for (fileNum in this.followThese)
		{
			fileName = followThese[fileNum];					 
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
			copyTEXOptionsFromCurrentDocumentToNewDocument(newWindow);
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
				newWindow.result.insertText(curLine);
				newWindow.result.insertText("\n");
			}
		}
	}
	return(obj);
}



filehandler = OpenAllInputFiles();
filehandler.openInputFiles();



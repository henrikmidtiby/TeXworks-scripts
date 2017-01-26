// TeXworksScript
// Title: Open terminal in the directory of the current file.
// Description: Open terminal.
// Author: Henrik Skov Midtiby
// Version: 0.1
// Date: 2017-01-26
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Shift+T

function openTerminal()
{
	var temp = {};
	temp.currentDirectory = getPathFromFilename(TW.target.fileName);
	temp.command = "gnome-terminal.real --working-directory=\"" + temp.currentDirectory + "\""
	showObject(temp);
	temp.result = TW.system(temp.command);
	if(temp.result["status"] == 2) // SystemAccess_PermissionDenied
	{
		TW.information(null, "System access permission denied", "Cannot open the containing directory, due to insufficient permissions.\n\nEnable \"Enable scripts to run system commands.\" in the preferences menu.");
	}
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
function showObject(inputObject, header)
{
	if(arguments.length == 1)
	{
		header = "Hej";
	}
	var tempText = "";
	for(var prop in inputObject){
		tempText += prop + " -> " + inputObject[prop] + "\n";
	}
	TW.information(null, header, tempText);
}


openTerminal();


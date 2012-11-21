// TeXworksScript
// Title: Context aware autocomplete, unit tests
// Description: Unittests for autocompleter.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2012-06-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Alt+O


// Include functionality from other script
var file = TW.readFile("openAllinputsFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

var file = TW.readFile("../utilities/functionsForUnittesting.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

// showObject
// getCurrentLine
// getTexWorksLines
var res = {};
res["program"] = "pdflatex";
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n\n"), res);
assertEqualDicts(getTexWorksLines("\n%!tex program = pdflatex\n\n"), res);
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n%TEX spell=danish\n"), res);
res["spell"] = "danish";
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n%!TEX spell=danish\n"), res);
assertEqualDicts(getTexWorksLines("\n%! TeX program =         pdflatex\n%!TEX spell=danish\n"), res);
// getPathFromFilename
assertEqual(getPathFromFilename('C:/Users/hemi/Dropbox/Work/2012-06-07PhdDefence/doc/presentation.tex'), 'C:/Users/hemi/Dropbox/Work/2012-06-07PhdDefence/doc');
assertEqual(getPathFromFilename('pic/c'), 'pic');
// getRelPathToRootDocument
// writeTexWorksLines
var res = {};
res["program"] = "pdflatex";
assertEqual(writeTexWorksLines(res), "% !TeX program = pdflatex\n");
// adjustRootFileLocation
// directoryDifferences
assertEqual(directoryDifferences("v2/doc/file.tex", "v2/doc/otherFile.tex"), "");
assertEqual(directoryDifferences("doc/file.tex", "otherFile.tex"), "../");
assertEqual(directoryDifferences("doc/file.tex", "temp/otherFile.tex"), "../temp/");
assertEqual(directoryDifferences("sub1/sub2/file.tex", "../../otherFile.tex"), "../../../../");
// OpenAllInputFiles
filehandler = OpenAllInputFiles();
// obj.openInputFiles
// obj.initializeVariables
// obj.getTextToAnalyze
// obj.checkForRootFile
// obj.detectIncludeOnlyStatements
// obj.handleActiveIncludeOnlys
// obj.searchForInputStatements
// TODO: The method mentioned above is rather large. Extract functionality from it.
// obj.doesLineContainInput
assertEqual(filehandler.doesLineContainInput("\\input{filename.tex}"), true);
assertEqual(filehandler.doesLineContainInput("\\include{filename.tex}"), false);
// obj.doesLineContainInclude
assertEqual(filehandler.doesLineContainInclude("\\input{filename.tex}"), false);
assertEqual(filehandler.doesLineContainInclude("\\include{filename.tex}"), true);
// obj.doesLineContainUsepackage
assertEqual(filehandler.doesLineContainUsepackage("\\include{filename.tex}"), false);
assertEqual(filehandler.doesLineContainUsepackage("\\usepackage{filename.tex}"), true);
assertEqual(filehandler.doesLineContainUsepackage("\\usepackage[options]{hyperref}"), true);
// obj.doesLineContainInputOrInclude
assertEqual(filehandler.doesLineContainInputOrInclude("\\input{filename.tex}"), true);
// obj.suggestFilenames
assertEqualLists(filehandler.suggestFilenames("file.tex"), ["file.tex"]);
assertEqualLists(filehandler.suggestFilenames("file.tikz"), ["file.tikz"]);
assertEqualLists(filehandler.suggestFilenames("file"), ["file.tex", "file.sty", "file.tikz", "file"]);
// obj.hasProperFilenameEnding
assertEqual(filehandler.hasProperFilenameEnding("file.tex"), true);
assertEqual(filehandler.hasProperFilenameEnding("file.tx"), false);
assertEqual(filehandler.hasProperFilenameEnding("file.tikz"), true);
// obj.isFileInIncludeList
assertEqual(filehandler.isFileInIncludeList("a", ["a", "b"]), true);
assertEqual(filehandler.isFileInIncludeList("c", ["a", "b"]), false);
// obj.openLocatedFiles
// obj.createAndOpenFile
// obj.copyTEXOptionsFromCurrentDocumentToNewDocument
// 



showTestSummary();



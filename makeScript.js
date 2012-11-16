// TeXworksScript
// Title:  Make Script
// Description: Creates a New Script
// Author:  Paul A. Norman
// Version: 0.311
// Date:  201-12-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Alt+N, Alt+S

    // Fist Make a New Blank Document manually  
    
    // updated 2011 07 23 around line 230 to include TW.app.updateScriptsList();
    
     // TW.app.newFile();   // doesn't always get the focus, and last active open document is often the target
 
 var  varNames = ["scriptName", "scriptDescription", "scriptAuthor", "scriptVersion", "scriptDate",
                  "scriptType", "scriptContext", "scriptShortcut", "scriptHook"] ;   
 
  var scriptParts = []; // New array to hold our script parts
  
// First create objects

  var availableScriptLanguages = ["QtScript","Python","Lua"];  // <-- Add any new Script languages and specific needs here -->

  var  scriptSpecific = {
  
                        "QtScript" : {
                                       "headerPrefix" : "",
                                         "linePrefix" : "// ",
                                       "headerSuffix" : "",
                                           "fileExt" : ".js"
                                      },

                          "Python" : {
                                       "headerPrefix" : "",
                                         "linePrefix" : "# ",
                                       "headerSuffix" : "",
                                           "fileExt" : ".py"                           
                                      },
                                      
                             "Lua" : { 
                                       "headerPrefix" : "--[[",
                                         "linePrefix" : "",
                                       "headerSuffix" : "\n]]",
                                           "fileExt" : ".lua"                                 
                                      } 
                          }
                          

    for (upto in varNames)
        {
                      
         eval(
              "var " + varNames[upto] 
              + " = {"
              + "  'partName': " +  varNames[upto] // for error debuging
              + ", 'useThis' : 'dont use'" // no script part is used unless it is in the User's decision flow path.
              + ", 'preFixText' :''"
              + "    }"
             );
            
         eval ("scriptParts.push("+varNames[upto]+")"); // Add to array holding our script parts
         
         }


     with (TW) with (TW.app) with (TW.target)
     {
  
      scriptName.useThis =    getText(null, 'Script Name (Title)', 'Script Name (Menu Title)');
        scriptName.preFixText = "Title:  ";

      scriptDescription.useThis = getText(null, 'Script Description', 'Script Description (Shows in Script Manager)');
        scriptDescription.preFixText = "Description: "; 
 
      var fileResult = readFile('authorName.txt'); // retrieve any previously used Author Name
      
           if (fileResult.status == 0)
                { var namePrompt = fileResult.result}
              else     
                { var namePrompt = 'Your Name'}
                
      scriptAuthor.useThis =    getText(null, 'Script Author', 'Script Author (Shows in Script Manager)', namePrompt); 
        scriptAuthor.preFixText = "Author:  "; 
      
         if ((namePrompt != scriptAuthor.useThis) & (scriptAuthor.useThis != undefined)) // Save Author Name 
           {
             	writeFile('authorName.txt', scriptAuthor.useThis);
            }	
 
      scriptVersion.useThis =    getText(null, 'Script Version', 'Script Version (Shows in Script Manager)', '0.1'); 
        scriptVersion.preFixText = "Version: ";
       
      // Altered from: http://www.tizag.com/javascriptT/javascriptdate.php  
      	var currentTime = new Date();
      	var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate() + ''; // force cast for length test
		var year = currentTime.getFullYear();
		
		if (day.length < 2){day = "0" + day;} 
		    month = month + '';  // force cast for length test
		if (month.length < 2){month = "0" + month;}      
      
      scriptDateBuild = year + '-' + month + '-' + day;
      
      scriptDate.useThis =    getText(null, 'Script Date', 'Script Date (Shows in Script Manager)', scriptDateBuild);
        scriptDate.preFixText = "Date: "; 
           
      scriptType.useThis = getItem(null, 'Script Type', 'Choose Script Type - \n\n 1. User initiated - \"standalone\",\n   or\n 2.  Automatic (Event/Signal Driven) - \"hook\"', ['standalone','hook']);     
        scriptType.preFixText = "Script-Type: ";

      
     switch(scriptType.useThis)
     {      
         case 'hook':
       scriptHook.useThis = getItem(null, 'Script Hook Type', 'Script Hook Activated by ...', ['NewFile','NewFromTemplate','LoadFile','AfterTypeset', 'TeXworksLaunched']);
          scriptHook.preFixText = "Hook: ";       
            
               break;
         
         case 'standalone':
                   default: 
           
           nameParts = scriptName.useThis.split(" ");
           var shortCutKeysPrompt = '';
           
           if (nameParts.length > 0)
             {
               for (var xJ in nameParts)
                  {
                   shortCutKeysPrompt += "Alt+" + nameParts[xJ][0].toUpperCase();
                     
                     if (xJ < nameParts.length -1)
                        { shortCutKeysPrompt += ", ";
                        }
                    } 
               }
               else
               {
                shortCutKeysPrompt =  'Alt+X, Alt+X'} // for completion

           
     scriptShortcut.useThis  = getText(null, 'Script Shortcut', 'Script Shortcut Keys (Activates Script) Change the Xs', shortCutKeysPrompt);
       scriptShortcut.preFixText = "Shortcut: ";            
            
            scriptContext.useThis = getItem(null, 'Script Context', 'Script Context (Use in Editor or Pdf Viewer)', ['TeXDocument','PDFDocument']);
             scriptContext.preFixText = "Context: ";            
                  
                    break;
             
      }  // End. switch  scriptType
       
          
       var scriptLanguage = getItem(null, "Please Choose Script Language", "Script Language: \n", availableScriptLanguages); 
       
              if (scriptLanguage == undefined){scriptLanguage = "QtScript"; } // got to be something       
       
                   
           insertText(scriptSpecific[scriptLanguage].headerPrefix + scriptSpecific[scriptLanguage].linePrefix + 'TeXworksScript');
                              // new line added later
       
           for (upto in scriptParts)
           {              
             
              if (scriptParts[upto].useThis == "dont use") // set at object creation, presence here means script part not chosen in User's decision flow path (e.g. see switch(scriptType.useThis) above)
                   {continue;}
              
                               //add new line here so we can add final new line after scriptSpecific[scriptLanguage].headerSuffix below  
                var thisText = "\n" +scriptSpecific[scriptLanguage].linePrefix 
                                  + scriptParts[upto].preFixText; // build Header skeleton whether content added below or not
               
             if (scriptParts[upto].useThis != undefined)  // If undefined, User cancelled input box
                 {
                     thisText += scriptParts[upto].useThis;  // add content User chose/wrote                  
                   }                   
                       insertText(thisText) ;           
            }
            
           insertText(scriptSpecific[scriptLanguage].headerSuffix + "\n");                  
                       
          
         if (scriptLanguage == 'QtScript')
         {  
            
 var use_twPan = false;
            
     if ((scriptAuthor.useThis == "Paul Norman")||( TW.question(null, "Include panTw Module?", "Include panTw Module?", 0x00004000 | 0x00010000, 0x00004000) == 0x00004000      ))
         {
          
          insertText('\n\n\n  eval(TW.app.getGlobal("helper_twPan")); //  Comment if NOT Needed - This includes PhpJs ($P), twConst, msgBox, twPan ($tw), string.toTitleCase() \n');     
              }
           else
            {   
     if ( TW.question(null, "Include PhpJs Module?", "Include PhpJs Module?", 0x00004000 | 0x00010000, 0x00004000) == 0x00004000     )
              {                                          
          insertText('\n\n\n  eval(TW.app.getGlobal("helper_PhpJs")); //Comment if NOT Needed, This only includes PhpJs ($P) \n');   
              }
                    }                 
                                                                 
          } // End. if (scriptLanguage == 'QtScript')
          
          setSyntaxColoringMode(scriptLanguage); /* no error produced if Syntax Type not present in syntax-patterns.txt  - 
                                              could rem out if not using a syntax colouration model for [QtScript] [Python] [Lua]
                                              see /config/configuration  syntax-patterns.txt and
                                              http://twscript.paulanorman.com/docs/html/files/syntaxpatternstxt.html */
           

             statusTip = "Proposed File Name is on Clipboard";   // set first so that it shows in time 
             yield();            
            
                insertText('\n\n');                       

        
         var fileSaveName = scriptName.useThis.replace(/ /g,"") + scriptSpecific[scriptLanguage].fileExt;
         
         fileSaveName = fileSaveName.substr(0,1).toLowerCase() + fileSaveName.substr(1);
   
         var holdClipboard = clipboard;
             clipboard =  fileSaveName;
             
            var doSave =  question(null,"Do You Wish to Save File Now?","Proposed File Name is on Clipboard \n\nChange File Extension to All Files (*)\n\n Do You Wish to Save File Now?", 0x00004000 | 0x00010000, 0x00004000); // Yes | No, prefer to use msgBox in helper_twPan.mod

        if (doSave == 0x00004000) // if Yes
         {
          var fileResult  = saveAs(); // catch return value
          
           if( fileResult == true)
             {
              TW.app.updateScriptsList();
             }
               
                   // dispose of return value - it was appearing in a message box
              
             fileResult  = null; 
          }                                                                              
        
                                                                                                                                                                                                                                            
             } // End. with (TW) with (TW.app) with (TW.target)
           
           clipboard = holdClipboard;    // restore clipboard
           
           null; // stop extra Qt framework generated message box appearing
     
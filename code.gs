/**
 * @OnlyCurrentDoc  Limits the script to only accessing the current document.
 */

var SIDEBAR_TITLE = 'Indenter v0.1';

/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  DocumentApp.getUi()
      .createAddonMenu()
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle(SIDEBAR_TITLE);
  DocumentApp.getUi().showSidebar(ui);
}

/**
 Cursor Stuff
**/

function getCursorInfo() {
  //Find cursor and return parent object
  
  //Global Objects
  var array = new Array();
  var typeText = "";
  var content = "";
  var indent = 0;
  var firstLine = 0;
  
  //Get cursor information
  var cursor = DocumentApp.getActiveDocument().getCursor();
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (cursor) {
    //Find out about cursor target
    var element = cursor.getElement();
    var parent = element.getParent();
    var type = parent.getType();
    typeText = "Cursor(" + type + ")";
    if (type == "PARAGRAPH" || type == "LIST_ITEM") {
      //Get paragraph and list info
      content = parent.getText();
      indent = parent.getIndentStart();
      firstLine = parent.getIndentFirstLine();
    } else if(type == "BODY_SECTION"){
      //Get Body section elements
      content = element.getText();
      indent = element.getIndentStart();
      firstLine = element.getIndentFirstLine();
    } else {
    content = "UNABLE_TO_INDENT";
    }
    //Deal with text preview.
      if (content.length > 30){
        content = content.substr(0,30) + '...';
      }
        content = '\n' + content;
      

  } else if(selection) {
    //Section made get multiple items.
    var elements = selection.getRangeElements();
    var count = elements.length;
    typeText = "Select(" + count +")";
     
    for (var i in elements){
      var target = elements[i].getElement();
      var text = target.getText();
      var type = target.getType()
      
      //Deal with text preview.
      if (text.length > 30){
        text = text.substr(0,30) + '...';
      }
        content = content + '\n' + text;
      
      //Indent check
      var binIndent, binFirstLine, object;
      if (type == "PARAGRAPH") {
        object = target.asParagraph();
      } else if(type == "LIST_ITEM") {
        object = target.asListItem();
      }
      else if(type == "BODY_SECTION"){
        object = target.asParagraph();
      }
      
      //Get values
      if(object){
        binIndent = object.getIndentStart();
        binFirstLine = object.getIndentFirstLine();
        
        if(binIndent > indent){
          indent = binIndent;
        }
        if(binFirstLine > firstLine){
          firstLine = binFirstLine;
        }  
      }  
    }

  } else {
    typeText = "ERROR";
    content = "Nothing to target";
  }
  
  //Push to array
  array.push(typeText);
  array.push(content);
  array.push(indent);    
  array.push(firstLine);
  
  return array;
}

function setIndent(ind,fl){
  var content = "setIndnet Triggered"
  var indent = parseInt(ind);
  var firstLine = parseInt(fl);
  var targetArray = new Array();
  var target, type, object;
  
  //Set indent of object at cursor or selection
  var cursor = DocumentApp.getActiveDocument().getCursor();
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (cursor) {
    var element = cursor.getElement()
    var parent = element.getParent();
    
    //Test for indentable characters
    type = parent.getType();
    if (type == "PARAGRAPH" || type == "LIST_ITEM") {
      target = parent;
    } else if(type == "BODY_SECTION"){
      target = element;  
    } else {
    content = "UNABLE_TO_INDENT";
    }
    
    //Process indent
    if (target) {
      targetArray.push(target);
    }
  } else if (selection){
    var elements = selection.getRangeElements();
    
    for (var i in elements){
      //Get Element Info
      target = elements[i].getElement();
      type = target.getType()
      content = content + type;
      
      //Check for text type and retarget parent
      if (type == "TEXT"){
       target = target.getParent();
       type = target.getType();
      }
      
      //convert target into an actionable obect
      if (type == "PARAGRAPH" || type == "BODY_SECTION") {
        object = target.asParagraph();
      } else if(type == "LIST_ITEM") {
        object = target.asListItem();
      } else {
        content = content + "\n TODO: Error handling";
      }
      
      //Load objects into target array.
      if(object){
        targetArray.push(object);
      }
    }

  } else {
    content = "No Target Available";
  }
  
  //Process target List
  for (var i in targetArray){
  targetArray[i].setIndentStart(indent);
  targetArray[i].setIndentFirstLine(firstLine);
  }
  
  return content;
}
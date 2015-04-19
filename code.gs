/**
 * Indenter v1.0
 * Created by Devin Hunter (Doltknuckle)
 *
 * This Add On is designed to quickly set the indentation values of text in a google doc.
 *
 * There AS-IS software and there is no guarentee that it will work. If you want to use this
 * feel free to do so. There is no claim to the software created here.
**/


//** Global variables
var SIDEBAR_TITLE = 'Indenter v1.0';


//** Initializtion
function onInstall(e) {
  //When you install the script, act as if you just opened the script.
  onOpen(e);
}

function onOpen(e) {
  //Create the menu. This will only work on a google doc.
  DocumentApp.getUi()
      .createAddonMenu()
      .addItem('Open Tool', 'showSidebar')
      .addToUi();
}


//** Menu
function showSidebar() {
  //Create the menu from HTML file.
  var ui = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle(SIDEBAR_TITLE);
  DocumentApp.getUi().showSidebar(ui);
}


//** Get Stuff

function getCursorInfo() {
  //* Gather information about the element that the cursor is in or the items selected.
  //Initalize variables
  var array = new Array();
  var typeText = "something";
  var content = "";
  var indent = 0;
  var firstLine = 0;
  //Get cursor and selection variable
  var cursor = DocumentApp.getActiveDocument().getCursor();
  var selection = DocumentApp.getActiveDocument().getSelection();  
  
  //If Cursor
  if (cursor) {
    var element = cursor.getElement()
    var type = element.getType();
    //If text type, get parent
    if(type != "PARAGRAPH" && type != "LIST_ITEM"){
      element = element.getParent();  
      type = element.getType();
    }
    //Get Data
    typeText = "" + type;
    content = checkText(element.getText(), 30);
    indent = checkIndent(element.getIndentStart(), indent);
    firstLine = checkIndent(element.getIndentFirstLine(), firstLine);

  } else if(selection) {
    //If Selection
    var elements = selection.getRangeElements();
    var count = elements.length;
    
    typeText = "Selection(" + count +")";
    
    //loop through selection
    for (var i in elements){
      var target = elements[i].getElement();
      var type = target.getType();
      
      //If TEXT type, get parent
      if(type != "PARAGRAPH" && type != "LIST_ITEM"){
        target = target.getParent();  
        type = target.getType();
      }
      //Get Data
      content = content + type + ":" + checkText(target.getText(), 30) + '\n';
      indent = checkIndent(target.getIndentStart(), indent);
      firstLine = checkIndent(target.getIndentFirstLine(), firstLine);
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


//** Check Stuff

function checkText(target, length) {
  //Fix long content data
  if (target.length > length){
    target = target.substr(0,length) + '...';
  }  
  return target;
}

function checkIndent(input, current){
  //If no input, return zero, if smaller than curent, use curent.
  if (!input){
    input = 0;
  } else if(input < current){
    input = current;
  }
  return input;
}

//* Set Stuff

function setIndent(ind,fl){
  //- Change the indent of the targeted object.
  var content = "OK"
  var indent = parseInt(ind);
  var firstLine = parseInt(fl);
  var targetArray = new Array();
  var target, type, object;
  
  //Set indent of object at cursor or selection
  var cursor = DocumentApp.getActiveDocument().getCursor();
  var selection = DocumentApp.getActiveDocument().getSelection();
  //If Cursor
  if (cursor) {
    performIndent(cursor.getElement(), indent, firstLine);
  } else if (selection) {
    //If Selection
    var elements = selection.getRangeElements();
    //Loop though elements
    for (var i in elements){
      performIndent(elements[i].getElement(), indent, firstLine);
      }
    }
  return content;
}

function performIndent(target, indent, firstLine){
  //- Do the actual indent change;
  var type = target.getType();
    //If not a type with indent, get parent
    if (type != "PARAGRAPH" && type != "LIST_ITEM" && type != "BODY_SECTION" ) {
      target = target.getParent();
    }
    target.setIndentStart(indent);
    target.setIndentFirstLine(firstLine);
}
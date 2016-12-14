 var port = chrome.extension.connect({
      name: "Sample Communication"
 });
 port.postMessage("I want truth");
 port.onMessage.addListener(function(msg) {
      console.log("message recieved" + msg);
	  document.getElementById("MainText").innerHTML=msg;
 });
 
 console.log("popup");
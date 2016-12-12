var shop_list = 
	[
		"aliexpress.com",
		"dochkisinochki.ru"
		
	];
var good_shops_count=0;
console.log('wow');

function check_tab_domain(tab) {
	var domain='';
	//find & remove protocol (http, ftp, etc.) and get domain
    if (tab.url.indexOf("://") > -1) {
        domain = tab.url.split('/')[2];
    }
    else {
        domain = tab.url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
	domain = domain.match(/(?!=^|[.]|[/]{2})([a-z0-9]+\.[a-z]+)(?=[\/]|$)/i)[0];
	console.log(domain);
	if (shop_list.indexOf(domain) > -1) {
		console.log("Нашёл!");
		//chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
		//good_shops_count++;
		//chrome.browserAction.setBadgeText({text:"!!!"});
		return "Yes";
	}
	else{
		//chrome.browserAction.setBadgeBackgroundColor({color:[100, 100, 100, 230]});
		//chrome.browserAction.setBadgeText({text:"NOPE"});
		return "No";
	}
}


function test(arg1)
{
	console.log(arg1.tabId);
	alert('boooo');
}

	
//chrome.tabs.onActivated.addListener(function(tabId, changeInfo,tab){
	
	//chrome.tabs.onActivated.addListener(test);

	
//chrome.tabs.onActivated.addListener(function(tabId, changeInfo,tab){
chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		chrome.browserAction.setBadgeBackgroundColor({color:[0, 127, 14, 230]});
		chrome.browserAction.setBadgeText({text:activeInfo.tabId.toString()}); 
		
		/*chrome.tabs.get(activeInfo.tabId, function (tab) {
							chrome.browserAction.setBadgeText({text:tab.url});
							}
				)
		*/
		chrome.tabs.get(activeInfo.tabId, function (tab) {
				if (check_tab_domain(tab)=="Yes")	{
					chrome.browserAction.setBadgeText({text:"$$$"});
				}
				else {
					chrome.browserAction.setBadgeText({text:""});
				}
			});
		
		//browser.tabs.get(activeInfo.tabId).url
	});


	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		//chrome.browserAction.setBadgeText({text:tabId.toString()});
		chrome.browserAction.setBadgeBackgroundColor({color:[100, 100, 100, 230]});
		chrome.tabs.get(tabId, function (tab) {
									chrome.browserAction.setBadgeText({text:tab.url});
									}
						)
		
	});
	
console.log('добавил');


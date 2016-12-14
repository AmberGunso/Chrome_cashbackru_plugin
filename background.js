var shop_list = 
	[
		"aliexpress.com",
		"dochkisinochki.ru"
		
	];
var all_shops = [];
all_shops["aliexpress.com"] = {"title":"Aliexpress","max_rate_percent":"8.50","link":"https:\/\/cashback.ru\/Aliexpress"};
all_shops["gearbest.com"]={"title":"GearBest.com","max_rate_percent":"3.00","link":"https:\/\/cashback.ru\/GearBest.com"};
all_shops["ozon.ru"]={"title":"Ozon.ru","max_rate_percent":"9.78","link":"https:\/\/cashback.ru\/Ozon.ru"};
	
console.log(all_shops);
console.log(all_shops["aliexpress.com"].link);
	
var good_shops_count=0;
var current_status="";
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
	if (all_shops[domain]!=undefined) {
		console.log("Нашёл!");
		current_status='Возможен кэшбэк до ' + all_shops[domain].max_rate_percent + '%<br><a href="'+all_shops[domain].link+'">'+all_shops[domain].title+'</a>';
		return "Yes";
	}
	else{
		current_status="На этом сайте нет возможности кэшбэка :(";
		return "No";
	}
	
	/*if (shop_list.indexOf(domain) > -1) {
		console.log("Нашёл!");
		current_status="Возможен кэшбэк до " + ;
		return "Yes";
	}
	else{
		current_status="На этом сайте нет возможности кэшбэка :(";
		return "No";
	}
	*/
}

chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		chrome.tabs.get(activeInfo.tabId, function (tab) {
				if (check_tab_domain(tab)=="Yes")	{
					chrome.browserAction.setBadgeText({text:"$$$"});
					//current_status="Возможен кэшбэк до " + ;
				}
				else {
					chrome.browserAction.setBadgeText({text:""});
					//current_status="-----------";
				}
			});
	});
	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		//Надо проверить, активна ли та вкладка, которая вызвала событие. Если активна, то прогнать тот же код, что сейчас в onActivated
		chrome.tabs.get(tabId, function (tab) {
									chrome.browserAction.setBadgeText({text:tab.url});
									}
						)
		
	});

 chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           console.log("message recieved" + msg);
           port.postMessage(current_status);
      });
 })

console.log('добавил');

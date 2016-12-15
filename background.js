var all_shops = [];
var xhr = new XMLHttpRequest();
var current_status="";
var active_tab_id = -1; //При открытии новой пустой вкладки возникает onActivated, при этом адрес сайта может быть не в списке. 
						//После смены адреса и загрузки страницы возникает onUpdated и в этот момент можно снова проверить сайт на вхождение в список
						//но если пользователь успел сменить вкладку или сидит на какой-нибуть яндексмузыке, то onUpdated возникает не на той вкладке, куда смотрит пользователь.
						//так что лучше в onUpdated проверить id вкладки и действовать только если событие возникло на активной вкладке.

xhr.onload = function() {
    var json = xhr.responseText;                         // Response
    json = JSON.parse(json);                             // Parse JSON
    console.log(json);
	console.log(json.merchants.length);
	for (i=0;i<json.merchants.length;i++){
		console.log(json.merchants[i].website);
		//сохраняем часть информации в объекты с полями title, max_rate_percent и link, которые храним в ассоциативном массиве
		//в качестве ключей массива - адреса сайтов без доменов последнего уровня www. и ru.
		all_shops[json.merchants[i].website.replace("www.","").replace("ru.","")] = 
			{"title":json.merchants[i].title,"max_rate_percent":json.merchants[i].max_rate_percent,"link":json.merchants[i].link};
	}
	// ... enjoy your parsed json...
	console.log ("вот и разобрали:");
	console.log(all_shops);
};

xhr.open('GET', 'https://cashback.ru/api/get_list/c6e5ca115704a78226df853bf8423ee8');
xhr.send();



function check_tab_domain(tab) {
	if (tab.url!=null) {
		var domain=tab.url;
		
		domain = domain.match(/([a-z0-9\.]+\.[a-z]+)(?=[\/]|$)/i);
		if (domain!=null) {
			domain = domain[0];
			//Вытаскиваем доменное имя. Выбрасываем протокол и всё, что за сэшами с обеих сторон, в том числе слэши
			//Из https://developer.chrome.com/extensions/extension#method-getViews получаем developer.chrome.com
			domain = domain.replace("www.","");
			domain = domain.replace("ru.","");
			//выбрасываем начало имени с www. и ru.
			
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
		}
		else {
			return "No";
		}
	}
	else {
		return "No";
	}
}

function check_this_tabId(tabID)
{
	chrome.tabs.get(tabID, function (tab) {
			if (check_tab_domain(tab)=="Yes")	{
				chrome.browserAction.setBadgeText({text:"$$$"});
				//current_status="Возможен кэшбэк до " + ;
			}
			else {
				chrome.browserAction.setBadgeText({text:""});
				//current_status="-----------";
			}
		});
}


chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		active_tab_id=activeInfo.tabId;
		check_this_tabId(activeInfo.tabId);
	});
	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		//Надо проверить, активна ли та вкладка, которая вызвала событие. Если активна, то прогнать тот же код, что сейчас в onActivated
		if (active_tab_id=tabId){
			check_this_tabId(tabId);
		}
	});

 chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           console.log("message recieved" + msg);
           port.postMessage(current_status);
      });
 })



/*all_shops["aliexpress.com"] = {"title":"Aliexpress","max_rate_percent":"8.50","link":"https:\/\/cashback.ru\/Aliexpress"};
all_shops["gearbest.com"]={"title":"GearBest.com","max_rate_percent":"3.00","link":"https:\/\/cashback.ru\/GearBest.com"};
all_shops["ozon.ru"]={"title":"Ozon.ru","max_rate_percent":"9.78","link":"https:\/\/cashback.ru\/Ozon.ru"};*/

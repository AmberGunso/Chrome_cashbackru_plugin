var all_shops = [];
var xhr = new XMLHttpRequest();
var current_status="";
var active_tab_id = -1; //При открытии новой пустой вкладки возникает onActivated, при этом адрес сайта может быть не в списке. 
						//После смены адреса и загрузки страницы возникает onUpdated и в этот момент можно снова проверить сайт на вхождение в список
						//но если пользователь успел сменить вкладку или сидит на какой-нибуть яндексмузыке, то onUpdated возникает не на той вкладке, куда смотрит пользователь.
						//так что лучше в onUpdated проверить id вкладки и действовать только если событие возникло на активной вкладке.


//chrome.storage.local.set({"refresh_date":now});

						
//Взять текущую дату
var now = new Date().getTime();
//проверить refresh_date в localStorage. Если а) в хранилище дата пустая либо б) более чем на сутки меньше текущей либо в) all_shops в хранилище пустой
chrome.storage.local.get(["refresh_date"],function(items) {
	console.log("items.refresh_date="+items.refresh_date);
	console.log(now-items.refresh_date);
	console.log((items.refresh_date==undefined) || (now-items.refresh_date>24*60*60));
	/*	chrome.storage.local.get(["all_shops"],function(all_items) {console.log("all shops:" +all_items.all_shops);all_shops=all_items.all_shops.slice();})
		chrome.storage.local.get(["moar_drama"],function(all_items) {console.log("moar_drama:" +all_items.moar_drama);})
		chrome.storage.local.get(["one_shop"],function(all_items) {console.log("one_shop:" +all_items.one_shop);})
	*/
	if ((items.refresh_date==undefined) || (now-items.refresh_date>1*24*60*60)) {
		//то дёргаем API, забираем данные, сохраняем в хранилище
		get_shops_from_api();
		//get_shops_from_hardcode();
		//console.log("обращаемся к API");
	}
	else {
		console.log("Читаем из хранилища");
		chrome.storage.local.get(["all_shops"],function(all_items) {all_shops=all_items.all_shops.slice();console.log(all_shops)})
	}
	
	 
	});

//если дата "свежая" и all_shops не пустой, то читаем его из хранилища

function get_shops_from_api() {
	console.log("Вход в get_shops_from_api");

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
	};

	xhr.open('GET', 'https://cashback.ru/api/get_list/c6e5ca115704a78226df853bf8423ee8');
	xhr.send();
}

function get_shops_from_storage(all_items) {
	for (i=0;i<all_items.length;i++){
			
			//сохраняем часть информации в объекты с полями title, max_rate_percent и link, которые храним в ассоциативном массиве
			//в качестве ключей массива - поле link_index
			all_shops[all_items[i].link_index] = 
				{"title":all_items.title,"max_rate_percent":all_items.max_rate_percent,"link":all_items.link};
		}

}

function get_shops_from_hardcode() {
	console.log("Вход в get_shops_from_hardcode");
	all_shops["aliexpress.com"] = {"title":"Aliexpress","max_rate_percent":"8.50","link":"https:\/\/cashback.ru\/Aliexpress"};
	all_shops["gearbest.com"]={"title":"GearBest.com","max_rate_percent":"3.00","link":"https:\/\/cashback.ru\/GearBest.com"};
	all_shops["ozon.ru"]={"title":"Ozon.ru","max_rate_percent":"9.78","link":"https:\/\/cashback.ru\/Ozon.ru"};
		//console.log("пытаюсь записать "+all_shops["aliexpress.com"].link);
		//console.log("JSON.stringify(all_shops)"+JSON.stringify(all_shops["ozon.ru"]));
		//chrome.storage.local.set({"all_shops":JSON.stringify(all_shops)}, function(){console.log("OK");console.log(chrome.runtime.lastError);});
		//chrome.storage.local.set({"one_shop":all_shops["aliexpress.com"].link}, function(){console.log("one_shop OK");console.log(chrome.runtime.lastError);});
		chrome.storage.local.set({"refresh_date":now});
		//chrome.storage.local.set({"moar_drama":"some data"});
		
		save_all_shops_to_localStorage(all_shops);
		
}

function save_all_shops_to_localStorage(shops) {
	console.log("Вход в save_all_shops_to_localStorage");
	//В качестве параметра передается массив с магазинами. Он ассоциативный, а значит не пролезает в JSON-сериализацию
	//нам надо его скопировать в нумерованный массив, в котором дополнительное поле будет - индекс
	//shops - входной массив
	//indexes - массив текстовых индексов массива объектов shops
	//shops_to_save - нумерованный массив объектов, который мы сможем сериализовать
	
	var shops_to_save = [];
	var indexes = Object.keys(shops).slice();
	for (var i=0; i<indexes.length;i++) {
		shops_to_save[i]				=shops[indexes[i]];
		shops_to_save[i].link_index			=indexes[i];
	}
	
	console.log(JSON.stringify(shops_to_save));
	chrome.storage.local.set({"all_shops":JSON.stringify(shops_to_save)}, function(){console.log("OK");console.log(chrome.runtime.lastError);});
}

function check_tab_domain(tab) {
	if (tab.url!=null) {
		var domain=tab.url;
		console.log("Вызов check_tab_domain, tab="+tab+" domain="+domain);
		domain = domain.match(/([a-z0-9\.-]+\.[a-z]+)(?=[\/]|$)/i);
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
				chrome.browserAction.setBadgeText({text:"$$$"});
				return "Yes";
			}
			/*else{
				current_status="На этом сайте нет возможности кэшбэка :(";
				chrome.browserAction.setBadgeText({text:""});
				return "No";
			}*/
		}
		/*else {
			current_status="На этом сайте нет возможности кэшбэка :(";
			chrome.browserAction.setBadgeText({text:""});
			return "No";
		}*/
	}
	/*else {
		current_status="На этом сайте нет возможности кэшбэка :(";
		chrome.browserAction.setBadgeText({text:""});
		return "No";
	}*/
	//сюда выполнение попадёт если любой из IF`ов будет неверным. Вместо трёхкратного else
	current_status="На этом сайте нет возможности кэшбэка :(";
	chrome.browserAction.setBadgeText({text:""});
	return "No";
}


chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		active_tab_id=activeInfo.tabId;
		chrome.tabs.get(activeInfo.tabId, check_tab_domain);

	});
	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		//Надо проверить, активна ли та вкладка, которая вызвала событие. Если активна, то прогнать тот же код, что сейчас в onActivated
		if (active_tab_id==tabId){
			//check_this_tabId(tabId);
			chrome.tabs.get(tabId, check_tab_domain);
		}
	});

 chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           console.log("message recieved" + msg);
           port.postMessage(current_status);
      });
 })




var shop_list = 
	[
		"aliexpress.com",
		"dochkisinochki.ru"
		
	];

//console.log('wow');
chrome.tabs.getSelected(null, function(tab){
	//console.log(tab); 
	//console.log(tab.url);
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
	}

	
	
	
});


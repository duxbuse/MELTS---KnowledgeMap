function query (msg){
		  var xmlhttp = new XMLHttpRequest();  
		  xmlhttp.open("POST", "api/map/search");
		  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  xmlhttp.send(JSON.stringify({queryMessage: msg}));
		  xmlhttp.onreadystatechange = ClientSideUpdate;
		  
		  if(msg == ""){
					document.getElementById("query").innerHTML = "Overview";
				}else{
					document.getElementById("query").innerHTML = msg.toUpperCase();
				}
		  
		  function  ClientSideUpdate(){
			if (xmlhttp.readyState == 4) {
				var response = xmlhttp.responseText;
				
				generate(null, response)
			}
		}
	}
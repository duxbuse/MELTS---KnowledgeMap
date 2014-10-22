document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

function readSingleFile(evt) {
	//Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0]; 
	
	if (f) {
	  var r = new FileReader();
	  r.onload = function(e) { 
		  var contents = e.target.result;
	
			var inputs = Papa.parse(contents);
			//console.log(inputs.data);
	
			sendFile(inputs);
			
	  }
	  r.readAsText(f);
	} else { 
	  alert("Failed to load file");
	}
}


function sendFile (file){

var xmlhttp = new XMLHttpRequest();  
		  xmlhttp.open("POST", "api/csv");
		  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  xmlhttp.send(JSON.stringify(file));
		   xmlhttp.onreadystatechange = ClientSideUpdate;
		  
		   function  ClientSideUpdate(){
				if (xmlhttp.readyState == 4) {
					var response = xmlhttp.responseText;
				
					if(response == "uploaded"){
						location.reload();
					}
				}
			}
}
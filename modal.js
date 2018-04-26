function main(){

	//================================================================//=================================================
	window.onload = function(){
		console.log('the page loaded');
		var url = "start.php";
		var req = new XMLHttpRequest();

		req.open("GET", url, true);

		req.responseType = "json";

		req.onreadystatechange = function(){
				if(req.readyState == 4 && req.status == 200){
					var jsonresp = req.response;

					for(var i = 1; i<=jsonresp[0]; i++){
						plant2Garden(jsonresp[i].name, jsonresp[i].file, i);
					}
				}
			};

		req.send();
	};

	
	//================================================================//=================================================
	//take file input and preview files

	var fileCount = 1;	//switched from 0 to 1 to make files start counting on server at 1

	var potentialfiles = document.querySelector('#fileSelectToModal');	//returns 1st element in the doc w/ that id

	potentialfiles.addEventListener('change', function(){

		var files = this.files;					//'this.files' is the FileList object
		for(var i=0; i<files.length; i++){
			previewImage(this.files[i], i);		//pass in index i to give each plant a *unique* submitbtn id
			rem(i);								//if user removes a plant from modal

			upload(this.files[i], i);
		}

	}, false);

	//================================================================//=================================================

	function previewImage(file, btnum){

		var content_space = document.getElementById("modal-content"); 		//this is a 'div' element
		var imageType = /image.*/;

		
		if(!file.type.match(imageType)){						//only allow file inputs to be images
			alert('file must be an image');
			throw "File Type must be an image";
			return;				
		}

		var slot = document.createElement("form");
		slot.classList.add('slot');

		var thumb = document.createElement("div");
		thumb.classList.add('thumbnail');						//make the newly created div part of 'thumbnail' class

		var img = document.createElement("img");
		img.file = file;										//setting img file to the file that was passed into funct

		var descrEl = document.createElement("input");			//make description for user to type
		descrEl.type = "text";
		descrEl.classList.add("description");
		descrEl.placeholder = "Add a description";
		var descrId = "descriptionId"+btnum;					//gives each description a *unique* id
		descrEl.setAttribute("id", descrId);
		descrEl.setAttribute("required", true);

		var bothBtns = document.createElement("div");			//div to hold the plant & remove buttons
		bothBtns.classList.add("bothBtns");

		var upBtn = document.createElement("input");			//make new element input
		upBtn.type = "submit";									//make type submit
		upBtn.value = "Plant this plant!";
		var upBtnId = "uploadBtn"+btnum;						//give unique id by suffixing with file selection index
		upBtn.setAttribute("id", upBtnId);						//give submit id:'uploadBtnX'
		upBtn.classList.add("uploadBtn");


		var delBtn = document.createElement("button");			//make new element button
		delBtn.innerHTML = "Remove";							//this will remove file selection before upload
		delBtn.type = "button";
		var delbtnId = "deleteBtn" + btnum;
		delBtn.setAttribute("id", delbtnId);
		delBtn.classList.add("deleteBtn");
		

		thumb.appendChild(img);									//inject into html
		slot.appendChild(descrEl);
		slot.appendChild(thumb);

		bothBtns.appendChild(upBtn);
		bothBtns.appendChild(delBtn);
		slot.appendChild(bothBtns);
		content_space.appendChild(slot);						//inject into html


		//using FileReader to display the image content
		//the FileReader object lets web apps asynchronously read the contents of files
		var reader = new FileReader();							//instantiate object
		reader.onload = (function(aImg){						//happens after the object reads the data from the file
				return function(e){
						aImg.src = e.target.result;				//content of file is assigned to the image src attribute
				};
		})(img);

		reader.readAsDataURL(file);								//tell object to read data from file

		runModal();
	}

	//================================================================//=================================================
	//makes the modal display not 'none' 
	function runModal(){

		//get modal
		var modal = document.getElementById("myModal");

		modal.style.display = "block";

	}

	//================================================================//=================================================
	//when 'plant this plant' gets clicked in modal
	//function upload(file, filenum_param, el){
	function upload(file, filenum_param){
		var upId = "#uploadBtn" + filenum_param;	//look for submitbtn with unique id "uploadBtnX"

		var userDescr = " ";						//json response will fill this

		$(upId).click(function(event){
			event.preventDefault();

			//getting value of plant description
			var descrId = "descriptionId" + filenum_param;
			console.log('description id is: ' + descrId);
			var sendDescr = document.getElementById(descrId).value;

			//check if user put in plant description 
			//doesn't prevent from just spaces
			if(sendDescr == ""){
				alert('Enter a description');
				return;
			}

			var old_filenum_param = filenum_param;
			filenum_param = fileCount;

			var url = "index.php";
			var xhr = new XMLHttpRequest();
			var fd = new FormData();

			xhr.open("POST", url, true);

			xhr.responseType = "json";

			var cond = true;	//to be used if fail to upload file (status >= 400)

			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4 && xhr.status == 200){
					var jsonresp = xhr.response;

					
					fileCount = jsonresp.nextfilenum;
					
					userDescr = jsonresp.plantdescr;
					filename = jsonresp.filename;
					filenum = jsonresp.filenum;

					plant2Garden(userDescr, filename, filenum);
				}
				else if(xhr.status >= 400 && xhr.readyState == 4){
					console.log('typeof xhr.status ' + xhr.status + ' is ' + typeof xhr.status);
					
					if(cond){
						alert('file failed to upload');
						cond = false;
					}
					return;
				}
			};

			fd.append("upload_file", file);
			fd.append("file_number", fileCount);
			fd.append("file_description", sendDescr);

			xhr.send(fd);

			clearSlot(old_filenum_param);		//had to switch to index 'i' as uploading a plant after a 
												//couple of modal windows and randomly uploading plants
												//got the fileCount and index 'i' out of sync 
		
		});	//end of click()	

	}	//end of upload(file)

	//================================================================//=================================================
	//when 'remove' gets clicked in modal
	function rem(num){
		var delId = "#deleteBtn" + num;
		$(delId).click(function(){
			$(delId).parent().parent().remove();					//clear out remBtn's parent's parent (slot)
		
			var slot = document.getElementsByClassName("slot");		//if there are no slots left
			if(slot.length == 0){
				var modal = document.getElementById("myModal");
				modal.style.display = "none";						//make modal 'go away'
				$("#modal-content").empty();						//deletes all child nodes of '#modal-content' element

				//need to add back the <p> title that was just deleted
				var p = document.createElement("p");
				p.innerHTML = "Describe and Plant! (or don't)";
				var content = document.getElementById("modal-content");
				content.appendChild(p);
			}
		});	//end of click 
	}

	//================================================================//=================================================

	function clearSlot(num){
		var upId = "#uploadBtn" + num;
		console.log('upId: ' + upId);
		$(upId).parent().parent().remove();

		var slot = document.getElementsByClassName("slot");
		console.log('slot: ' + slot);
		if(slot.length == 0){
			var modal = document.getElementById("myModal");
			modal.style.display = "none";
			$("#modal-content").empty();	//deletes all child nodes of '#modal-content' element
			
			//need to add back the <p> title that was just deleted
			var p = document.createElement("p");
			p.innerHTML = "Describe and Plant! (or don't)";
			var content = document.getElementById("modal-content");
			content.appendChild(p);
		}
		
	}

	//================================================================//=================================================

	function plant2Garden(description, filename, filenum){
		var garden = document.getElementById("garden");

		var rdioBtn = document.createElement("input");
		rdioBtn.type = "radio";
		rdioBtn.name = "gardengroup";

		var label = document.createElement("label");
		label.innerHTML = description;

		var pEl = document.createElement("p");

		garden.appendChild(pEl);
		pEl.appendChild(rdioBtn);
		pEl.appendChild(label);

		$(rdioBtn).change(function(){
			imgSpace = document.getElementById("imgSpaceimg");
			imgSpace.setAttribute("src", "datas/"+filenum+"-"+filename);
			document.getElementById("imgSpace").style.display="block";
		});
	}



}	//end of main()


main();
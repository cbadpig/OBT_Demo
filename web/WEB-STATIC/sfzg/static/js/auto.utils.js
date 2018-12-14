
function mouseEvent(element){
	try{
		var dom = document.creatEvent("MouseEvents");
		dom.initEvent("click",true,false);
		element.dispatchEvent(dom);
	}catch(e){
		try{
			var dom2 = document.createEvent("HTMLEvents");
			dom2.initEvent("click",true,false);
			element.dispatchEvent(dom2);
		}catch(e1){
			element.click();
		}
	}
}

function sleep(interval){
	if(interval==null||interval==undefined){
		interval = 1000;
	}
	var start = new Date();
	while(true){
		if(new Date().getTime()-start>interval) break;
	}
}

function delay(id,value,interval){
	setTimeout(function(){
		document.getElementById(id).value = value;
	},interval&&interval!=undefined?interval:1000);
}

function write(id,value){
	for(var n=0;n<value.length;n++){
		var obj = document.getElementById(id);
		obj.value = obj.value + value.charAt(n);
		//console.info(obj.value);
	}
}

var parentDialog = "";
function lockScreen(){
	parentDialog = dialog({title:'自动化测试即将开始，请耐心等待......',cancel:false});
	parentDialog.showModal();
}
function closeLockScreen(){
	if(parentDialog&&parentDialog!=""){
		parentDialog.close();
	}	
}

var HotKeyHandler={
		currentMainKey:null,
		currentValueKey:null,
		Init:function(code){
			HotKeyHandler.Register(0,code,function(){
				top._dialog("快捷键注册成功");
			});
		},
		Register:function(tag,value,func){
			var mainkey = "";
			switch(tag){
				case 0:
					mainkey=17; //ctrl
					break;
				case 1:
					mainkey=16 //shift
					break;
				case 2:
					mainkey=18 //alt
					break;
			}
			document.onkeyup=function(e){
				HotKeyHandler.currentMainKey=null;
			}
			document.onkeydown=function(event){
				var keycode = event.keyCode;
				var keyvalue = String.fromCharCode(event.keyCode);
				top._dialog(keycode+"-"+keyvalue+"-"+value)
				if(HotKeyHandler.currentMainKey!=null){
					if(keyvalue==value){
						HotKeyHandler.currentMainKey=null;
						if(func!=null){
							func();
						}
					}
					if(keycode==mainkey){
						 HotKeyHandler.currentMainKey=keycode;
					}
				}
				
			}
		}
}
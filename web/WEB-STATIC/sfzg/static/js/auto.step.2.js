var auto_timeout=1*1500;
isSbm=false;
terminate=true;	//判断题目是否做完了，true没有做完，false已经做完
submitTestPaper = false;
var hasOptions = true;
var examedNums = 0; //计算已经考了多少科目了
$(function(){
	if(OBT.storage.getSession("isAutoTest")=="Y"){
		auto_timeout=OBT.storage.getSession("autoTimeout");
		//console.log("开始自动化测试 begin");
		startTest();
		//console.log("开始自动化测试 end");
	}
});

function startTest(){
	if(terminate&&!submitTestPaper){
		//auto_timeout = Math.floor(Math.random()*5);
		setTimeout(function(){
			//判断页面是否已经加载出来了，如果没有就一直死循环查看页面加载情况
			if(autoAnser()){
				setTimeout(function(){
					if(terminate&&!submitTestPaper){
						if(hasOptions){
							mouseEvent(document.getElementById("nextbtn"));
						}else{
							//mouseEvent($("#leftnav").find("a[class='active']"));
							var curSubject = OBT.paper.getCurSubject();
								var ito = OBT.paper.getCurItem();
							  var ItemUrl = OBT.storage.getSession("basepath")+"/res/items/"+curSubject.kcdm+"/"+curSubject.kspcbh+"/"+curSubject.sjdm+"/{0}.html?item={1}";
							  var iturl = ItemUrl.format(ito.code,JSON.stringify(ito));
							  $('#question_frame').attr('src',iturl);
						}
						//递归调用
						startTest();
					}else{
						sbmAnswer();
					}
				},auto_timeout);
			}else{
				autoAnser();
			}
		},auto_timeout);
	}
}

function sbmAnswer(){
	++examedNums;
	if(!isSbm){
		setTimeout(function(){
			mouseEvent(document.getElementById("submitbtn"));
			setTimeout(function(){
				mouseEvent($("div[role='alertdialog']").find("div[id='auto_sbm_btn']").find("button").eq(1));
				setTimeout(function(){
					if(OBT.paper.getPapers().data.length==examedNums){
						if(OBT.storage.getSession("isAutoTest")=="Y"){
							OBT.storage.removeSession("isAutoTest");
						}
					}
					mouseEvent($("div[role='alertdialog']").find("div[id='auto_sbm_btn']").find("button").eq(1));
				},1500);
			},1500);
		},1500);
	}
}

function autoAnser(){
	var currentItems = OBT.paper.getCurPaper().items;
	if(!terminate||submitTestPaper){
		return true;
	}	
	var item = OBT.paper.getCurItem();
	//之所以这么写是因为我知道iframe中一定会有这个值的定义，如果obt.paper生成规则变化这里也得从新定义
	var $topDIV = $("#question_frame").contents().find("div[id='I-"+item.code+"']");	
	if($topDIV==undefined){
		return false;
	}
	//此处对于"不定项选择题"不适用
	var $inputs = $topDIV.find("input[name='item-"+item.code+"']");
	var _len = 0;
	var randomNum = 0;
	if($inputs&&$inputs!=undefined){
		_len = $inputs.length;
	}
	//没有选项直接返回
	if(_len==0&&item.type!="COMPOSITE"){
		hasOptions = false;
		return true;
	}else{
		hasOptions = true;
		randomNum = random(_len);
	}
	
	//单选
	if(item.type=="SINGLE"){
		//产生一个小于$inputs.length长度的随机数
		mouseEvent($inputs.eq(randomNum));
	}
	//多选
	else if(item.type=="MULTIPLE"){
		randomNum = randomMin(_len,2);
		execSelect($inputs,randomNum);
	}
	//判断提
	else if(item.type=="JUDGMENT"){
		mouseEvent($inputs.eq(randomNum));
	}
	//不定项选择题
	else if(item.type=="COMPOSITE"){
		for(var i = 0;i<currentItems.length;i++){
    	  if(currentItems[i].pcode==item.code){
    		  var $inputs_bdx = $topDIV.find("div[id='I-"+currentItems[i].code+"']").find("input[name='item-"+currentItems[i].code+"']");
    		  if($inputs_bdx.length==0){
    			  hasOptions = false;
    			  return true;
    		  }
    		  hasOptions = true;
    		  //到总题型数组中查找出当前题的code的子题code
    		  execSelect($inputs_bdx,random($inputs_bdx.length));
    	  }
		}
	}
	var isDisabled = $("#nextbtn").attr("disabled");
	if(isDisabled&&isDisabled!=undefined){
		terminate = false;
		//console.log("最后一题");
	}
	
	return true;
}

function random(rdm){
	return parseInt(rdm * Math.random());	//根据总共多少个选项来确定随机数
}

function randomMin(max,min){
	if(min==undefined){
		min = 0;
	}
	return Math.floor(min+Math.random()*((max+1)-min));
}

function execSelect(arr,count){
	for(var i = 0;i<=count;i++){
		var sjs = random(arr.length);
		mouseEvent(arr.eq(sjs));
		arr.splice(sjs,1);
	}
}

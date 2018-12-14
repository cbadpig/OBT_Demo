var onlyOne = true;	//只允许按一次快捷键
var reqCount = 30; //如果自动化测试开始后，连续访问二十次服务器都是没有回应，则默认服务器可能停了，或者网络存在问题
var isExecByKey = true;	//true：需要按快捷键，false：页面打开自动开始自动化测试
var randomNum = 5;	//随机randomNum+1秒之内的数
//设置自动化测试的快捷键
/*document.onkeydown=function(e){
	e=e||window.event;
	var kc = e.keyCode||e.charCode;
	if(isExecByKey==true){
		//ctrl+shift+r
		//if(onlyOne==true&&kc==121&&e.altKey){
		//F8-119 ,F9=120,F11=121
		if(onlyOne==true&&kc==119){
			onlyOne = false;
			lockScreen();
			readyData();
		}
	}else{
		setTimeout(function(){
			lockScreen();
			readyData();
		},1500);
	}
};*/
 
setTimeout(function(){
	lockScreen();
	readyData();
},1500);

//向服务器请求测试用准考证号
function readyData(){
	jQuery.ajax({
		type : "POST",
		url : _base+"/manage/autoTest/check.do",
		data:{"srf":""},
		dataType:"json",
		cache : false,
		success : function(data){
			//hasGet：担心ajax两次请求时间延迟原因，前一次已经拿到了准考证号，此时还没有关闭定时器，
			//就会再跑一次或者多次又回请求后台，如果后台返回已经请求返回了就不继续往下执行
			//允许测试，但未开始测试
			//data = eval("("+data+")");
			if(data.hasGet!='U'){
				closeLockScreen();
				if(data.hasGet=='N'){
					var rnum = Math.floor(((Math.random()*(data.speedMax-data.speedMin))+Number(data.speedMin))*1000);
					OBT.storage.setSession("autoTimeout",rnum);
					//获取准考证号后直接客户端电脑相关信息
					auto_step_1(data.zkzh,data.zjbm);
				}else{
					_dialog("测试账号已经分配完或尚未设置当前批次！");
				}
			}else{
				setTimeout(function(){
					readyData();
				},2000);
			}
		},
		error : function(e) {
			if(reqCount>1){
				--reqCount;
				setTimeout(function(){
					readyData();
				},1500);
			}else{
				onlyOne = true;	//恢复快捷键使用
				closeLockScreen();
				top._dialog("网络异常，请检查网络是否能访问考试系统服务器！");
			}
		}
	});
}

//测试第一步：登陆答题端
function auto_step_1(zkzh,zjbm){
	setTimeout(function(){
		OBT.storage.setSession("isAutoTest","Y");
		delay("zkzh",zkzh,500);
		delay("zjbm",zjbm,1000);
		setTimeout(function(){
			mouseEvent(document.getElementById("loginbtn"));
		},1500);
	},1500);
}
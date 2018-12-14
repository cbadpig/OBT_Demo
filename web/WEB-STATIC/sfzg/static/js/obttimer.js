
//变为多长时间从后台去一次时间，单位为秒
var getTime = 300;

/*距离开始考试倒计时（距离批次时间）*/
var timer_start = null;
if (!window.console) {
	  window.console = window.console || (function() {
	    var c = {};
	    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
	    return c;
	  })();
	}
var ksToStart = function(){
	if(timer_start) clearInterval(timer_start);
	$.ajax({
			url:'../ccKs/toStart.do',
			type:'post',
			contentType:'application/json;charset=utf-8',
			dataType:'json',
			success:function(data) {
				var seconds = data.secondes;
				timer_start = $("#tt_start").countdown(seconds,function(s,d){
					var msg = d.hours+":"+ d.minutes+":"+d.seconds;
					$("#tt_start").text(msg);
					if(s!=0&&s%getTime==0){
						ksToStart();
					}
				},function(){
					startExam();
				});
			},
			error:function(XMLHttpRequest,error,errorThrown) {
				top._dialog(XMLHttpRequest.status);
			}
	});
};
/*距离考试结束还剩时间（批次）*/

var timer_end = null;
var ksToEnd = function(){
	if(timer_end) clearInterval(timer_end);
	$.ajax({
			url:'../ks/toEnd.do',
			type:'post',
			contentType:'application/json;charset=utf-8',
			dataType:'json',
			success:function(data) {
				var seconds = data.secondes;
				console.log(seconds+":seconds");
				timer_end = $("#tt_end").countdown(seconds,function(s,d){
					var msg = d.days+" 天 "+ d.hours+" 时 "+ d.minutes+" 分 "+d.seconds+" 秒 ";
					$("#tt_end").text(msg);
					if(s%getTime==0){
						ksToStart();
					}
				},function(){
					console.log("考试结束");
					
				});
			},
			error:function(XMLHttpRequest,error,errorThrown) {
				top._dialog(XMLHttpRequest.status);
			}
	});
};

/*当前时间*/
var timer_pre = null;
var curTime = function() {
	if(timer_pre) clearInterval(timer_pre);
	$.ajax({
		url:'../ccKs/curTime.do',
		type:'post',
		contentType:'application/json;charset=utf-8',
		dataType:'json',
		success:function(data) {
			var _mill = data.mill;
			$("#tt_cur").html("00:00:00");
			timer_pre = $("#tt_cur").preTime(_mill,function(s,d){
				$("#tt_cur").html(d.hour+":"+d.minutes+":"+d.seconds);
				if(s%getTime==0){
					curTime();
				};
				
			});
		},
		error:function(XMLHttpRequest,error,errorThrown) {
			top._dialog(XMLHttpRequest.status);
		}	
	});
};


/*时间点设置*/

var km1 = {
	funs:[],
	base_fun:function(){},
	add_funs:function(){
		km1.funs.push(function(){$("#war").html("距离结束还有6秒");});
		km1.funs.push(function(){$("#war").html("还有3秒");});
		km1.funs.push(function(){$("#war").html("还剩2秒");});
		km1.funs.push(function(){$("#war").html("只剩1秒了");});
		
	},
	ex:function(s){
		var ss = parseInt(s);
		if(km1.funs.length==0) {
			km1.add_funs();
		};
		if(s===6||s===3||s===2||s===1){
			km1.base_fun=km1.funs.shift();
		}
		km1.base_fun();
	}
};


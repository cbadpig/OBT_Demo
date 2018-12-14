
$(document).keydown(function(event) {
	if(event.keyCode==8) {
        return false;
    }
});

$(document).ready(function(){
	
	setTimeout(function(){
		//window.location.replace("../index2.html");
		window.close();
	},5*60*1000);
	
//	$.ajax({
//		url:'../exam/ks/getBaseInfo.do',
//		type:'post',
//		dataType:'json',
//		contentType:'application/json',
//		success:function(data) {
//			document.title=data.message.examname;
			$(".endtext").text("国家统一法律职业资格考试计算机化考试模拟答题演示");
//		}
//	});
});


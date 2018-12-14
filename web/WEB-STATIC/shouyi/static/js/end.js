
$(document).keydown(function(event) {
	if(event.keyCode==8) {
        return false;
    }
});

$(document).ready(function(){
	
	setTimeout(function(){
		  var url = 'end2.html?time='+Date.parse(new Date());
		  window.location.replace(url);
	},5000);
	
	$(".endtext").text("全国执业兽医资格考试计算机考试模拟系统");

});


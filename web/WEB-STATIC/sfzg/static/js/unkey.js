
$(document).bind({"contextmenu":function(){return false;}});
window.onhelp=function(){return false;};
$(document).keydown(function(event) {
	alert(event.keyCode);
    if(event.keyCode==122) {
        event.keyCode=0;
        event.returnvalue=false;
    }

    if(event.keyCode==116){
    	alert("F5");
    	event.keyCode=0;
    	event.cancelBubble=true;
    	return false;
    	
    }
    
//    if(event.keyCode==114||event.keyCode==116||event.keyCode==117||(event.ctrlKey&&event.keyCode==82)){
//    	alert("F5");
//        event.keyCode=0;
//        event.returnvalue=false;
//    }
    //����alt��alt+F4
    if(event.altKey||(event.altKey&&event.keyCode==115)) {
        event.keyCode=0;
        return false;
    }
    //���λ��˼�backspace
    if(event.keyCode==8) {
        event.keyCode=0;
        return false;
    }
    //����F10��Shift+F10
    if(event.keyCode==121||(event.shiftKey&&event.keyCode==121)) {
        event.keyCode=0;
        return false;
    }
    //����ctrl+n ������ҳ
    if(event.ctrlKey&&event.keyCode==78) {
        event.keyCode=0;
        return false;
    }

    //alt+���������������Ч��Ŀǰ���η����
    if(event.keyCode==37||event.keyCode==39) {
        event.keyCode=0;
        return false;
    }

    //����F12
    //if(event.keyCode==123) {
    //    event.keyCode=0;
    //    return false;
    //}

    //����M��
    if(event.keyCode==77) {
        event.keyCode=0;
        return false;
    }

    //����win��,��Ч
    if(event.keyCode==91) {
        event.keyCode=0;
        return false;
    }


});
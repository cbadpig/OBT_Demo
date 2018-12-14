;(function($, window, document, undefined) {
	if (!window.console) {
		  window.console = window.console || (function() {
		    var c = {};
		    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
		    return c;
		  })();
		}
  function getSeatId(){
    var id = OBT.storage.getLocal(OBT.KEY_SEAT_NUMBER);
    if(typeof(id) === 'undefined' || id ==null){
      id = '';
    }
    console.log(id);
    return id;
  }

  function getSeatNo(){

  }

  $(document).ready(function(){
    //取得座位号
    $.get('../svc/API/examroom/seat/get','id='+getSeatId(),
      function(data){
        console.debug(data);
        //显示座位号
        if(data.status >0){
          $('#seat-no').text(data.message.zwh);
          //写入服务器创建的机位ID
          if(getSeatId()===''){
            OBT.storage.setLocal(OBT.KEY_SEAT_NUMBER,data.message.jwdm);
          }
        }else{
          dialog({id:'messagebox',title:'提示信息',content:data.message,quickClose: true}).show();
        }
      },'json');
    //绑定点击事件
    $('#seat-no').click(function(e) {
      //点击刷新
      var maskbox = dialog({
        id:'maskbox',
        // 设置遮罩背景颜色
        backdropBackground: 'grey',
        // 设置遮罩透明度
        backdropOpacity: 0.8,
        title:'获取座位中...'
      });
      //取得座位号
      $.ajax({
        url:'../svc/API/examroom/seat/get1',
        data:'id='+getSeatId(),
        dataType:'json',
        beforeSend:function(){
          maskbox.showModal();
        },
        success:function(data){
          //显示座位号
          if(data.status >0){
            $('#seat-no').text(data.message.zwh);
            //写入服务器创建的机位ID
            if(getSeatId()===''){
              OBT.storage.setLocal(OBT.KEY_SEAT_NUMBER,data.message.jwdm);
            }
          }else{
            dialog({id:'messagebox',title:'提示信息',content:data.message,quickClose: true}).show();
          }
          maskbox.close();
        },
        error : function(req,data,error) {
          maskbox.close();
          dialog({id:'messagebox',title:'系统错误',content:error,quickClose: true}).show();
        }
      });
    });
	});
})($, window, document);
(function() {
	if (!window.console) {
		  window.console = window.console || (function() {
		    var c = {};
		    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
		    return c;
		  })();
		}
  if(!OBT) OBT={};
  if (!OBT.client) {
    OBT.client = {
      ItemUrl:'/res/items/{0}.html?item={1}',
      _intervalId: null,
      $clientFrm:null,
      init: function(options) {
        var settings = $.extend({
          frameId :'question_frame',
          errorfun : function(err){},
          successfun: function(){}
        }, options || {});
        
        //作答区iframe最大化
        this.$clientFrm = $('#'+settings.frameId);
        if(this.$clientFrm.is('iframe')){
          if (window.contentDocument){
            console.info('contextDocument'+this.$clientFrm.height());
            this.$clientFrm.height(window.contentDocument.body.offsetHeight);
          }
          else if (window.document){
            // var subheight = document.body.scrollHeight - $clientFrm.height();
            // console.info('scrollHeight='+document.body.scrollHeight);
            // console.info('iframeHeight='+$clientFrm.height());
            // console.info('clientHeight='+document.documentElement.clientHeight);
            // $clientFrm.height(document.documentElement.clientHeight - subheight -20);
            // console.info('newscrollHeight='+document.documentElement.scrollHeight);
          }
        }
      

        /*
        if (OBT.getEndTime() == 0) {
          OBT.setStartTime(OBT.getNow())
        }
        //显示剩余时间
        this.showRemainTime();
        //启动定时器，显示时间
        this._intervalId = setInterval(function() {
          OBT.client.showRemainTime()
        }, 1000);
        //试卷装载后事件调用
        //跳转到第1题
        this.goto()
        */

        settings.successfun();
      },

    }
  }
})();
(function(factory) {
	if (!window.console) {
		  window.console = window.console || (function() {
		    var c = {};
		    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
		    return c;
		  })();
		}
  "use strict";
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
})(function($) {
  "use strict";
  var instances = [],
    matchers = [],
    defaultOptions = {
      //定时器默认循环的时长,1s
      precision: 1000,
      //在所有定时完成后，是否停止时钟
      stoptimer: false,
      getNow: null,
      displaytype: 'clock'
    };
  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
  // 例子： 
  // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
  // (new Date()).Format("yyyy-M-d h:m:s.S")    ==> 2006-7-2 8:9:4.18 
  Date.prototype.Format = function(fmt) { //author: meizz 
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  matchers.push(/^[0-9]*$/.source);
  matchers.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
  matchers.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
  matchers = new RegExp(matchers.join("|"));

  function parseDateString(dateString) {
    if (dateString instanceof Date) {
      return dateString.getTime();
    }
    //数字时，是当前时间向后计时
    if (typeof dateString === 'number') {
      if (dateString > 0 && dateString < 31536000000) {
        return new Date().getTime() + dateString;
      }
      console.info(dateString);
      return dateString;
    }
    if (String(dateString).match(matchers)) {
      if (String(dateString).match(/^[0-9]*$/)) {
        dateString = Number(dateString);
      }
      if (String(dateString).match(/\-/)) {
        dateString = String(dateString).replace(/\-/g, "/");
      }
      return new Date(dateString).getTime();
    } else {
      throw new Error("Couldn't cast `" + dateString + "` to a date object.");
    }
  }
  var DIRECTIVE_KEY_MAP = {
    Y: "years",
    m: "months",
    n: "daysToMonth",
    w: "weeks",
    d: "daysToWeek",
    D: "totalDays",
    H: "hours",
    M: "minutes",
    S: "seconds"
  };

  function escapedRegExp(str) {
    var sanitize = str.toString().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    return new RegExp(sanitize);
  }

  function strftime(offsetObject) {
    return function(format) {
      var directives = format.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);
      if (directives) {
        for (var i = 0, len = directives.length; i < len; ++i) {
          var directive = directives[i].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/),
            regexp = escapedRegExp(directive[0]),
            modifier = directive[1] || "",
            plural = directive[3] || "",
            value = null;
          directive = directive[2];
          if (DIRECTIVE_KEY_MAP.hasOwnProperty(directive)) {
            value = DIRECTIVE_KEY_MAP[directive];
            value = Number(offsetObject[value]);
          }
          if (value !== null) {
            if (modifier === "!") {
              value = pluralize(plural, value);
            }
            if (modifier === "") {
              if (value < 10) {
                value = "0" + value.toString();
              }
            }
            format = format.replace(regexp, value.toString());
          }
        }
      }
      format = format.replace(/%%/, "%");
      return format;
    };
  }

  function pluralize(format, count) {
    var plural = "s",
      singular = "";
    if (format) {
      format = format.replace(/(:|;|\s)/gi, "").split(/\,/);
      if (format.length === 1) {
        plural = format[0];
      } else {
        singular = format[0];
        plural = format[1];
      }
    }
    if (Math.abs(count) === 1) {
      return singular;
    } else {
      return plural;
    }
  }
  var OBTTimer = function(el, options) {
    this.el = el;
    this.$el = $(el);
    this.interval = null;
    this.offset = {
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      daysToWeek: 0,
      daysToMonth: 0,
      totalDays: 0,
      weeks: 0,
      months: 0,
      years: 0
    };
    this.options = $.extend({}, defaultOptions);
    this.instanceNumber = instances.length;
    instances.push(this);
    this.$el.data("obttimer-instance", this.instanceNumber);
    if (options) {
      //注册事件到对象上
      if (typeof options === "function") {
        this.$el.on("update.obttimer", options);
        this.$el.on("stoped.obttimer", options);
        this.$el.on("finish.obttimer", options);
        //循环计次
        this.$el.on("loop.obttimer", options);
      } else {
        this.options = $.extend({}, defaultOptions, options);
      }
    }
    //终止时间，为0时，表示不终止；为小于1年的数字时，表示从当前时间向后累计；
    //为Date或大于1年的数字时，直接指定终止日期；
    if(this.options.counddowns)
      this.setCountDowns(this.options.counddowns);
    this.start();
  };
  $.extend(OBTTimer.prototype, {
    start: function() {
      //首先清除旧定时器
      if (this.interval !== null) {
        clearInterval(this.interval);
      }
      var self = this;
      this.update();
      this.interval = setInterval(function() {
        self.update.call(self);
      }, this.options.precision);
    },
    stop: function() {
      clearInterval(this.interval);
      this.interval = null;
      this.dispatchEvent("stoped");
    },
    toggle: function() {
      if (this.interval) {
        this.stop();
      } else {
        this.start();
      }
    },
    pause: function() {
      this.stop();
    },
    resume: function() {
      this.start();
    },
    remove: function() {
      this.stop.call(this);
      instances[this.instanceNumber] = null;
      delete this.$el.data().obttimerInstance;
    },
    setCountDowns: function(value) { //设置终止时间
      //清除旧计时器
      this.countdownary = new Array();
      if(value instanceof Array){
        for(var i=0;i<value.length;i++){
          var cur = parseDateString(value[i]);
          if(cur >0)
            this.countdownary.push(cur);
        }
        this.countdownary.sort();
      }else{
        this.addCountdown(value);
      }
    },
    addCountdown: function(value) {
      //增加计时时间，放到数组内
      var cur = parseDateString(value);
      if(cur >0){
        this.countdownary.push(cur);
        if(this.countdownary.length >1)
          this.countdownary.sort();
      }
    },
    update: function() {
      if (this.$el.closest("html").length === 0) {
        this.remove();
        return;
      }
      var hasEventsAttached = $._data(this.el, "events") !== undefined,
        now = new Date(),
        newTotalSecsLeft;
      if (this.countdownary && this.countdownary.length > 0) {
        //有倒计时限制时
        newTotalSecsLeft = this.countdownary - now.getTime();
        this.elapsed = newTotalSecsLeft <= 0;
        newTotalSecsLeft = Math.ceil(newTotalSecsLeft / 1e3);
        newTotalSecsLeft = !this.options.elapse && newTotalSecsLeft < 0 ? 0 : Math.abs(newTotalSecsLeft);
        if (this.totalSecsLeft === newTotalSecsLeft || !hasEventsAttached) {
          return;
        } else {
          this.totalSecsLeft = newTotalSecsLeft;
        }
        this.offset = {
          seconds: this.totalSecsLeft % 60,
          minutes: Math.floor(this.totalSecsLeft / 60) % 60,
          hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24,
          days: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
          daysToWeek: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
          daysToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 % 30.4368),
          totalDays: Math.floor(this.totalSecsLeft / 60 / 60 / 24),
          weeks: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7),
          months: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 30.4368),
          years: Math.abs(this.countdownary.getFullYear() - now.getFullYear())
        };
        if (!this.options.elapse && this.totalSecsLeft === 0) {
          this.stop();
          this.dispatchEvent("finish");
        }
      } else {
        this.$el.text(now.Format('HH:mm:ss'));
      }

      //触发页面更新
      this.dispatchEvent("update");
    },
    dispatchEvent: function(eventName) {
      //触发事件
      var event = $.Event(eventName + ".obttimer");
      event.countdownary = this.countdownary;
      event.elapsed = this.elapsed;
      event.offset = $.extend({}, this.offset);
      event.strftime = strftime(this.offset);
      this.$el.trigger(event);
    }
  });
  $.fn.obttimer = function() {
    var argumentsArray = Array.prototype.slice.call(arguments, 0);
    return this.each(function() {
      var instanceNumber = $(this).data("obttimer-instance");
      if (instanceNumber !== undefined) {
        var instance = instances[instanceNumber],
          method = argumentsArray[0];
        if (OBTTimer.prototype.hasOwnProperty(method)) {
          instance[method].apply(instance, argumentsArray.slice(1));
        } else if (String(method).match(/^[$A-Z_][0-9A-Z_$]*$/i) === null) {
          //TODO
          instance.setFinalDate.call(instance, method);
          instance.start();
        } else {
          $.error("Method %s does not exist on jQuery.obttimer".replace(/\%s/gi, method));
        }
      } else {
        new OBTTimer(this, argumentsArray[0], argumentsArray[1]);
      }
    });
  };
});
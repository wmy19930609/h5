window.common_monitor = (function ($utils, monitor, window, $) {
  var defaultPar = {
      isOpenLeave: true,
      isOpenClick: true,
      isOpenTrack: true
    },
    baseExtend = {},
    start_time = new Date;

  //合并对象属性
  function mix(des, src, override, isClearObjectAttr) {
    for (var i in src) {
      //这里要加一个des[i]，是因为要照顾一些不可枚举的属性
      if (override || !(des[i] || (i in des))) {
        des[i] = src[i];
      }
    }
    return des;
  }
  //得到非对象的属性去除pid,twoChannel，threeChannel
  function getNoObjectAttr(source) {
    var result = {};
    for (var a in source) {
      if (typeof source[a] != 'object') {
        if (a != 'pid' && a != 'twoChannel' && a != 'threeChannel')
          result[a] = source[a];
      }
    }
    return result;
  }
  //刷新或关闭打点停留时间
  function beforeunload() {
    var end = +(new Date),
      start = start_time.getTime(),
      trackData = monitor.data.getTrack();
    var data = {
      intime: start,
      outtime: end,
      type: 'leave'
    }
    data = mix(trackData, data, true);
    monitor.log(data, 'track');
  }
  //重写了monitor.data.getBase 方法增加了pid、twoChannel、threeChannel、title、from、src参数
  function newGetbase() {
    var re = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)?/i,
      url = window.location.href,
      arr = url.match(re),
      arr1 = arr.length >= 3 ? arr[2].split(".") : [""],
      arr2 = arr.length >= 5 ? arr[4].split("/") : [0, ""];
    var base = {

      p: monitor.util.getProject(),
      u: window.location.href,
      guid: monitor.util.getGuid(),
      id: monitor.util.getGuid(),
      mid: Cookie.get('__mid'),
      pid: "",
      twoChannel: arr1[0],
      threeChannel: arr2[1],
      title: document.getElementsByTagName('title')[0].innerHTML,
      from: $utils.getParam("from", location.href) || '',
      src: $utils.getParam("src", location.href) || ''
    };
    base = mix(base, baseExtend, true);
    return base;
  };
  var Cookie = {
    get: function (key) {
      try {
        var doc = document,
          a, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        if (a = doc.cookie.match(reg)) {
          return unescape(a[2]);
        } else {
          return "";
        }
      } catch (e) {
        return "";
      }
    },
    set: function (key, val, options) {
      options = options || {};
      var expires = options.expires;
      var doc = document;
      if (typeof (expires) === "number") {
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires);
      }

      try {
        doc.cookie =
          key + "=" + escape(val) +
          (expires ? ";expires=" + expires.toGMTString() : "") +
          (options.path ? ";path=" + options.path : "") +
          (options.domain ? "; domain=" + options.domain : "");
      } catch (e) {}
    }
  };
  return {
    /*兼容之前写的pid,twoChannel,threeChannel，作为一级参数，供快速调用。
      如：common_monitor.init({pid:'test',twoChannel:'test',threeeChannel:'test',isOpenLeave:true}),不支持扩展里边的参数monitor.data.getBase
      或  common_monitor.init({isOpenLeave:true,basePar:{pid:'test',twoChannel:'test',threeeChannel:'test'}，trackPar:{},clickPar:{}})，支持扩展monitor.data.getBase其他参数，
      只需在basePar增加其他参数即可，可在
    */
    init: function (conf) {
      if (!Cookie.get('__mid')) {
        try {
          var mid = (external && external.GetMID && external.GetSID && external.GetMID(external.GetSID(window))) || (wdextcmd && wdextcmd.GetMid && wdextcmd.GetMid()) || '';
          if (mid) {
            var expires = 24 * 3600 * 1000 * 300;
            var date = new Date();
            date.setTime(date.getTime() + expires);
            Cookie.set('__mid', mid, {
              expires: date,
              path: '/',
              domain: '.btime.com'
            });
          }
        } catch (e) {

        }
      }
      if (!conf || (conf && typeof conf != 'object')) {
        alert('请至少提供配置信息');
        return;
      }
      if (!conf.pid && !conf.basePar) {
        alert('请提供pid');
        return;
      }
      //兼容之前写的pid,twoChannel,threeChannel,作为一层参数，最新调用可改成basePar:{pid,twoChannel,threeChannel},clickPar参数扩展monitor.data.getBase
      if (!conf.basePar) {
        conf.basePar = {
          pid: conf.pid
        };
        if (conf.twoChannel) {
          conf.basePar.twoChannel = conf.twoChannel;
        }
        if (conf.threeChannel) {
          conf.basePar.threeChannel = conf.threeChannel;
        }
      }

      baseExtend = conf.basePar; //用来扩展getBase里边的参数
      defaultPar = mix(defaultPar, getNoObjectAttr(conf), true);
      monitor.setConf({
        trackUrl: 'http://s.btime.com/t.html',
        clickUrl: 'http://s.btime.com/c.html'
      });
      monitor.setProject("btime");
      monitor.data.getBase = newGetbase;
      if (defaultPar.isOpenTrack) { //是否开启track打点，默认开启，可以不传isOpenTrack
        if (conf.trackPar) { //用来扩展track打点参数
          var preTrack = monitor.data.getTrack; //没重写的track获取参数方法
          monitor.data.getTrack = function () {
            return mix(preTrack(), conf.trackPar, true);
          }
        }
        monitor.getTrack();
      }
      if (defaultPar.isOpenClick) { //是否开启click打点，默认开启，可以不传isOpenClick

        var preClick = monitor.data.getClick; //没重写的click获取参数方法
        monitor.data.getClick = function (e) {
          var data = preClick(e);
          var referUrl = monitor.util.getReferrer();
          data.r = referUrl; //增加refer参数
          var _e = $.event.fix(e);
          if ($(_e.target).parents('.N-top').html()) {
            data.newtop = 'no';
          }
          if ($(_e.target).parents('.N-nav').html()) {
            data.newtop = 'no';
          }
          if ($(_e.target).parents('.N-ft').html()) {
            data.newtop = 'no';
          }
          if ($(_e.target).parents('.article-nav').html()) {
            data.newtop = 'no';
          }
          if ($(_e.target).attr('alt')) {
            data.c = $(_e.target).attr('alt');
          }
          if (conf.clickPar) { //用来扩展click打点参数
            data = mix(data, conf.clickPar, true);
          }
          return data;
        };
        monitor.getClickAndKeydown();
      }
      if (defaultPar.isOpenLeave) {
        $(window).on('beforeunload', beforeunload);
      }
    },
    customizeLog: function (conf) {
      if (conf && typeof conf == "object") {
        if (conf.event_name) {
          var data = {};
          if (conf.event_name != "click" && conf.event_name != 'track') {
            if (!conf.url) {
              alert("自定义事件url不能为空");
              return;
            }
            if (!monitor.conf[conf.event_name] || (monitor.conf[conf.event_name] && monitor.conf[conf.event_name] != conf.url)) {
              monitor.setConf(conf.event_name, conf.url);
            }
          }
          if (conf.extendOtherData) { //如要携带track基础数据
            if (conf.extendOtherData == "track") {
              data = mix(monitor.data.getTrack(), conf.para, true);
            }
          } else {
            data = conf.para;
          }
          monitor.log(data, conf.event_name);
        }
      }


    }
  }
})($utils, monitor, window, jQuery)
/*
 * 移动端登录控件
 * Version 1.0
 * 2016-10-24
 * dulianqiang
 * 说明：本控件依赖于zepto或jquery，兼容IOS7+ android4+，
 * 非构造函数封装，目前不支持多个示例，支持AMD和CMD调用
 */
;
(function() {
  // 定义主方法类
  var loginFun = {
    // 版本号
    v: {
      version: 1.0,
      css: ['http://s6.qhimg.com/!85fc8f88/p-blogin.css'],
      js: ['http://s6.qhimg.com/!dbbb3dd4/jsencrypt.js']
    },

    param: {
      stopTouchMove: false, // 弹出登录后，是否阻止body滚动事件
      cusTips: false, // 自定义接收提示，传入函数会执行，tips为参数传入，默认为调用默认样式
      debug: false // 是否开调试
    },
    // API接口和相关提示
    apis: {
      loginIn: 'http://user.btime.com/loging?', // pc登录接口
      getUserinfo: 'http://user.btime.com/getUserinfo?', // 获取用户信息
      comPost: 'http://gcs.so.com/comment/post?', // 发送评论数据
      likeUrl: 'http://gcs.so.com/comment/like?', // 为评论点赞
      comUrl: encodeURIComponent(window.curCommentUrl || location.href),
      logOut: 'http://user.btime.com/logout?' // 退出登录
    },
    // 定义提示文案
    txt: {
      logout: '您已安全退出~',
      replySuccess: '回复成功，评论已提交审核！',
      likeSuccess: '赞人评论，手有余香~',
      alreadyLiked: '已经赞过啦~',
      overtimeContent: '联网超时，请检查网络连接~',
      failContent: '联网失败，请检查网络连接~',
      errorMobile: '请填写格式正确的手机号',
      emptyPwd: '密码不能为空',
      emptyComments: '请填写评论信息！',
      withoutLogin: '登录后才能评论！',
      contentRepeat: '内容重复，请修改~'
    },
    // 定义规则
    rule: {
      // 手机号码校验
      mobile: '^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$',
      // 登录秘钥
      pk_m: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDarKnIQrARGnTHhbxqLQ1ZID6lXRdTseCW2tYwDaq5TGejVPKOy4HQ3cUBHhMPFTByvIw+P6quHQrrtzmPnL+ifpOaEyre9/n3RLhxMb7fsctGlXFhiA8+Pf2EJmbvl5R52i5Izsoi4Fk7VC1qjavl1uIjrU17qrVWfJPYfgR9iwIDAQAB",

    },
    // 定义对象
    body: $('body'),
    document: $(document),
    // 定义状态
    network: true, // 联网状态
    loginStatus: false, // 登录状态
    ininStatus: false,
    // 超时监测
    outLineTime: 3000,
    // 定义数据
    userData: {}, // 用户数据
    // 定义dom
    input: $("#sx-comments input"),
    subBtn: $("#login-submit-b"),
    uname: $('#user_name'),
    pwd: $("#login-password"),
    pwd_check: $("#login-password-second"),
    init: function(param, call) {
      // 该方法用于初始化定义参数
      var s = loginFun;
      if (param && typeof(param) === 'object') {
        $.each(param, function(i, item) {
          s.param[i] = s.cloneObject(item);
        });
      }
      s.param.debug && console.log(s.param)
        // 初始化完成，执行主体
      s.loadFile(); // 加载外部资源
      s.event();
      s.loginStatus(function(data) {
        s.ininStatus = true;
        $(document).trigger('loadInit');
        call && call();
      });
    },
    loadFile: function() {
      // 
      var s = this;
      var version = s.v.version * 10 - 10;
      s._getScript(s.v.js[version]);
      s._getCss(s.v.css[version]);
    },
    is: function(call) {
      return loginFun.islogin;
    },
    login: function(call) {
      var s = loginFun;
      if (s.islogin && s.userData) {
        if (call) {
          call(s.userData);
        } else {
          return s.userData;
        }
      } else {
        $(document).on('loginSuc', function() {
          if (call) {
            call(s.userData);
          } else {
            return s.userData;
          }
        })
        $(document).on('loginErr', function() {
          // 用户取消了登录
          s.param.debug && console.log('用户取消了登录')
          return { errno: 1, msg: 'user cancel' };
        })
        s.loginWindow(true);
      }
    },
    logout: function() {
      var s = loginFun;
      if (s.islogin) {
        s.logOut(function() {
          s.loginStatus();
          s.tips(s.txt.logout)
        })
      } else {
        s.tips('用户未登录')
      }
    },
    event: function() {
      // 处理事件绑定
      var s = this,
        body = s.body;
      s.loginbgfix = $('.blogin-bgfix');
      // 防止某些手机获取宽高错误，直接重新获取宽高
      s.loginbgfix.width($(window).width()).height($(window).height());
      body.on('click', '.showlogin', function() {
        // 点击登录按钮
        s.loginWindow(true); // 显示登录窗口
      });
      body.on('touchmove', function(e) {
        // 禁止页面滚动
        if (s.stopTouchMove) {
          e.preventDefault();
          e.stopPropagation();
        }
      })
      body.on('click', '.sdown', function() {
        // 点击关闭按钮
        s.loginWindow();
        $(document).trigger('loginErr');
      })
      body.on('click', '.blogin-bgfix', function(e) {
        var target = $(e.target);
        if (target.hasClass('blogin-bgfix')) {
          s.loginWindow();
          $('body').trigger('loginErr');
        } else {
          return;
        }
      })

      body.on('click', '.login', function(e) {
        // 点击提交登录按钮
        var q = $(this);
        if (q.hasClass('disabled') || q.hasClass('errortips')) {
          return;
        } else {
          s.onLine(false, function() {
            return;
          }); // 监测断网
          q.addClass('disabled');
          setTimeout(function() {
            q.removeClass('disabled')
          }, 300)
        }
        s.loginIn(function(data) {
          s.onLine(true); // 登录成功 关闭超时定时器
          switch (data.errno) {
            case 0:
              s.loginStatus(function(data) {
                s.loginData = data;
                if (data.errno == 0) {
                  $(document).trigger('loginSuc');
                  body.scrollTop(s.sTop); // 防止页面滑动
                  s.stopTouchMove = false; // 回复页面滚动
                  s.tips(data.data.nick_name + ' 欢迎您！');
                  s.loginWindow(); // 隐藏登录窗口
                } else if (data.errno == 1000) {
                  s.tips('域名限制或非法请求')
                } else {
                  s.tips(data.errmsg);
                }
              });
              break;
            case 2000:
              s.pwd.val('').addClass('focus');
              s.tips(data.errmsg);
              break;
            default:
              s.tips(data.errmsg);
              break;
          }
        })
      });
      body.on('click', '.logout', function(e) {
        // 退出登录
        s.onLine(false, function() {
          return;
        }); // 监测断网
        s.logOut(function() {
          s.onLine(true);
          s.loginStatus();
          s.tips(s.txt.logout)
        })
      });
    },
    loginWindow: function(flag) {
      // 打开或关闭登录窗口
      var s = this,
        body = s.body;
      // 处理UI
      var s = this;
      if (flag) {
        if ($('.blogin-bgfix').length) {
          $('.blogin-bgfix,.blogin-fix').show();
        } else {
          var html = '<div class="blogin-bgfix">' +
            ' <div id="blogin" data-name="登录弹窗">' +
            ' <form action="http://user.btime.com/loging" id="login-form">' +
            ' <h2>登录 <a href="javascript:;" class="sdown"></a></h2>' +
            '<div class="login-info">' +
            ' <input type="text" datatype="text" class="login-username" id="user_name" placeholder="手机号" reqmsg="手机号/邮箱" maxlength="20" datatypestatus="false" onfocus="this.focused=true;this.select();" onmouseup="if(this.focused){this.focused=false;return false;}">' +
            ' <input type="password" datatype="text" id="login-password" placeholder="密码" reqmsg="密码" datatypestatus="false" class="login-pwd" onfocus="this.focused=true;this.select();" onmouseup="if(this.focused){this.focused=false;return false;}">' +
            ' <input type="password" name="passwd" datatype="text" id="login-password-second" value="" placeholder="再次输入密码" reqmsg="再次输入密码" class="undis "" style="display: none;">' +
            '  <div class="vercode" data-name="验证" class="undis "" style="display: none;">' +
            ' <div id="ver-img"></div>' +
            '<div id="ver-message">' +
            ' <input type="text" datatype="text" name="message" data-name="短信验证码" id="login-message"><a href="javasctipt:;" id="postmessage">获取验证码</a>' +
            ' </div>' +
            ' </div>' +
            '</div>' +
            '<div class="login-submit">' +
            '<a type="submit" href="javascript:;" id="login-submit-b" class="login-submit-button redbutton login">立即登录</a>' +
            '</div>' +
            ' <div class="login-tips">' +
            '<span>没有账号？</span><span class="login-reg js-sx-download" href="javascript:;" target="_self">下载北京时间APP注册</span>' +
            '</div>' +
            '</form>' +
            '</div> ' +
            '<span class="ver-fix"></span>' +
            '</div>';

          body.append(html);
        }
        $('.wrapper').addClass('blur');
        // 加载校验规则及密码加密
        if (!s.renderIpt) {
          s.ipt(); // 校验数据
          s.createPassword();
          s.renderIpt = true;
        }
        // 记录滑动距离
        s.sTop = $('body').scrollTop();
        s.stopTouchMove = true; // 禁止页面滑动
      } else {
        $('.blogin-bgfix').hide();
        $('.wrapper').removeClass('blur');
      }
    },

    loginStatus: function(call) {
      // 初始化登录状态
      var s = loginFun;
      s.ajax(s.apis.getUserinfo, {}, function(data) {
        if (data.errno == 0 && data.data.nick_name != 'undefined') {
          s.userData = data;
          s.islogin = true; // 已登录
          var nick_name = s.nick_name = data.data.nick_name,
            str = '<a href="javascript:;" class="logout">退出</a><a class="splitline">|</a><a class="comments-nickname" href="javascript:;">' + nick_name + '</a>',
            login = $('.showlogin');
          login.hide();
          s.uid = data.data.user_id;
          s.token = data.data.token;
        } else {
          s.uid = '';
          s.token = '';
          s.islogin = false; // 未登录
        }
        call && call(data);
      })
    },
    onLine: function(flag, callback) {
      // 断网监测 flag为true 取消定时器
      var s = this;
      if (flag) {
        clearTimeout(s.timer);
        return;
      }
      s.timer = setTimeout(function() {
        // 发送成功后需要取消该定时器
        s.tips(s.txt.overtimeContent);
        callback && callback();
      }, s.outLineTime);
      if (!navigator.onLine) {
        clearTimeout(timer);
        s.tips(s.txt.failContent);
        callback && callback();
      }
    },
    ipt: function() {
      // 校验数据
      var s = this;
      var ua = s.ua();
      s.param.debug && s.param.debug && console.log('ua: ' + ua);
      $(".login-info input").on('blur change input click', function(event) {
        event.preventDefault();
        event.stopPropagation(); // 防止输入时滑动页面
        s.iptM($(this));
      });
    },
    iptM: function(q) {
      // q为校验目标‘
      var s = this,
        btn = $("#login-submit-b");
      if (q.hasClass('login-username')) {
        // 校验手机号
        var val = q.val(),
          rule = new RegExp(s.rule.mobile);
        if (val == '' || !rule.test(val)) {
          btn.text(s.txt.errorMobile).addClass('errortips errorMobile')
          q.addClass('focus');
          s.phonenum = false;;
        } else {
          q.removeClass('focus');
          btn.text('立即登录').removeClass('errortips errorMobile');
          s.phonenum = true;
          s.user_name = val;
          s.param = {
              user_name: val
            }
            // $('.login-pwd').focus(); // 手机校验成功，将焦点移到密码上
        }
      } else if (q.hasClass('login-pwd')) {
        // 校验密码是否为空
        var val = q.val();
        if (val == '') {
          q.addClass('focus');
          !btn.hasClass('errortips errorMobile') && btn.text(s.txt.emptyPwd).addClass('errortips errorPwd');
        } else {
          if (!btn.hasClass('errorMobile')) {
            q.removeClass('focus');
            btn.text('立即登录').removeClass('errortips errorPwd');
          }
        }
      } else {
        btn.text(text);
      }
    },
    // 以下为数据组件或封装功能
    loginIn: function(done, error) {
      // 登录ajax
      var s = this;
      var userParam = { remember: 'on', passwd: s.ipt_pwd, timestamp: +new Date(), user_name: s.user_name };
      s.param.debug && console.log('用户登录信息：' + JSON.stringify(userParam));
      var ajaxData = {
        url: s.apis.loginIn,
        type: 'get',
        dataType: 'jsonp',
        // contentType: 'application/x-www-form-urlencoded',
        data: userParam,
        success: done || s.loop,
        processData: true,
        error: error || s.loop
      }
      return $.ajax(ajaxData)
    },
    getUserinfo: function(done, error) {
      // 获取用户信息
      var s = this;
      var ajaxData = {
        url: s.apis.getUserinfo,
        type: 'get',
        dataType: 'jsonp',
        success: done || s.loop,
        error: error || s.loop
      }
      return $.ajax(ajaxData)
    },
    logOut: function(done, error) {
      var s = loginFun;
      var ajaxData = {
        url: s.apis.logOut,
        type: 'get',
        dataType: 'jsonp',
        success: done || s.loop,
        error: error || s.loop
      }
      return $.ajax(ajaxData)
    },
    tips: function(data) {
      // 弹出错误状态 moveup_1 动画
      var s = this;
      if (s.tipsStatus) {
        if (data == s.tipsData) {
          return
        } else {
          setTimeout(function() {
            s.tips(data);
          }, 3000)
        }
      }
      s.tipsData = data;
      var str = '<div class="poptips"><p>' + (s.tipsData || '发生未知错误') + '</p></div>';
      this.body.append(str);
      var pop = $('.poptips');
      s.tipsStatus = true;
      pop.show().addClass('tipsmove');
      setTimeout(function() {
        pop.remove();
        s.tipsStatus = false;
      }, 2000);
    },
    ajax: function(api, param, done, error) {
      var s = this;
      var ajaxData = {
        url: api,
        type: 'get',
        dataType: 'jsonp',
        param: param,
        success: done || s.loop,
        error: error || s.loop
      }
      return $.ajax(ajaxData)
    },
    // 对象深度拷贝
    cloneObject: function(obj) {
      if (typeof obj === "object") {
        if ($.isArray(obj)) {
          var newArr = [];
          for (var i = 0; i < obj.length; i++) newArr.push(this.cloneObject(obj[i]));
          return newArr;
        } else {
          var newObj = {};
          for (var key in obj) {
            newObj[key] = this.cloneObject(obj[key]);
          }
          return newObj;
        }
      } else {
        return obj;
      }
    },

    // 判断ua
    ua: function() {
      var a = navigator.userAgent.toLowerCase();
      return {
        samsung: /samsung/gi.test(a), // 三星浏览器
        ios: /iphone|ipad|ipod/gi.test(a) // ios
      }
    },
    createPassword: function(pwdIpt) {
      // 创建密码秘钥
      var s = this,
        body = $('body');
      // var m = typeof(pk_m) == "undefined" ? "" : pk_m;
      $('#login-password').on('input change blur', function() {
        var q = $(this),
          pwd = q.val();
        var createPwd = s.createEncrypt(pwd, s.rule.pk_m);
        s.ipt_pwd = createPwd;

      });
    },
    createEncrypt: function(value, publicKey) {
      // 需配合JSEncrypt使用
      if (!value) return '';
      var pk_m = this.rule.pk_m;
      if (!pk_m) return value;
      if (JSEncrypt === undefined)
        throw new Error('Please introduce [JSEncrypt] package');
      var pubKey = pk_m ? pk_m : $.trim(this.pwd.val());
      pubKey = decodeURIComponent(pubKey);
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey(pubKey);
      return encrypt.encrypt($.trim(value));
    },
    _getScript: function(url, callback) {
      var s = this;
      var head = document.getElementsByTagName('head')[0],
        js = document.createElement('script');
      js.setAttribute('type', 'text/javascript');
      js.setAttribute('src', url);
      head.appendChild(js);
      //执行回调
      var callbackFn = function() {
        if (typeof callback === 'function') {
          callback();
        }
      };
      if (document.all) { //IE
        js.onreadystatechange = function() {
          if (js.readyState == 'loaded' || js.readyState == 'complete') {
            callbackFn();
          }
        }
      } else {
        js.onload = function() {
          callbackFn();
        }
      }
      //如果使用的是zepto，就添加扩展函数
      if (Zepto) {
        $.getScript = s._getScript;
      }
    },
    _getCss: function(src, fn) {
      var s = this;
      var node = document.createElement('link');
      node.rel = 'stylesheet';
      node.href = src;
      document.head.insertBefore(node, document.head.firstChild);
      if (node.attachEvent) {
        node.attachEvent('onload', function() { fn(null, node) });
      } else {
        setTimeout(function() {
          poll(node, fn);
        }, 0); // for cache
      }

      function poll(node, callback) {
        var isLoaded = false;
        if (/webkit/i.test(navigator.userAgent)) { //webkit
          if (node['sheet']) {
            isLoaded = true;
          }
        } else if (node['sheet']) { // for Firefox
          try {
            if (node['sheet'].cssRules) {
              isLoaded = true;
            }
          } catch (ex) {
            // NS_ERROR_DOM_SECURITY_ERR
            if (ex.code === 1000) {
              isLoaded = true;
            }
          }
        }
        if (isLoaded) {
          setTimeout(function() {
            callback && callback(null, node);
          }, 1);
        } else {
          setTimeout(function() {
            callback && poll(node, callback);
          }, 10);
        }
      }
      node.onLoad = function() {
          fn(null, node);
        }
        //如果使用的是zepto，就添加扩展函数
      if (Zepto) {
        $.getCss = s._getCss
      }
    }
  };
  loginFun.init();
  // 定义对外接口
  var outerApi = {};
  outerApi.init = loginFun.init;
  outerApi.login = loginFun.login;
  outerApi.is = loginFun.is;
  outerApi.logout = loginFun.logout;
  // 暴露对外接口
  var mLogin = window.mLogin = outerApi;

  if (typeof module !== 'undefined' && typeof exports === 'object' && define.cmd) {
    module.exports = mLogin;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return mLogin;
    });
  } else {
    this.mLogin = mLogin;
  }
}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
});

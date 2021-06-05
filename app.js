App({
  onLaunch: function () {
    // 先取 token，如果 token 取不到，则登录
    if(!this.checkIsLogin) {
      this.getUserInfo();
    }
  },

  getUserInfo: function () {
    //微信的登录方法
    wx.login({
      success: res => {
        //登录成功后会返回一个微信端提供的 code ，用来自定义登录使用
        console.log("code", res.code);
        this.getToken(res.code);
      }
    })
  },

  globalData: {
    userInfo: null,
    hasUserInfo: false,
    // apiDomain: 'https://api.guoleishenbo.top/api', //生产
    downloadPrefix: 'https://api.guoleishenbo.top/download?url=', // 通过代理服务器中转（微信限制资源域名，不同平台cdn域名千变万化）
    // apiDomain: 'http://127.0.0.1/api', // test
    apiDomain: 'http://192.168.0.105/api', // test
    // downloadPrefix: 'http://127.0.0.1/download?url=', // 通过代理服务器中转（微信限制资源域名，不同平台cdn域名千变万化）
    defaultDailyFreeParseNum: 10,
  },

  //全局统一调用接口的方法
  apiRequest: function (options) {
    var token = wx.getStorageSync('token')
    wx.request({
      url: this.globalData.apiDomain + options.url,
      method: options.method ? options.method : 'GET',
      header: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
      },
      dataType: 'json',
      data: options.data,
      success: res => {
        switch (res.statusCode) {
          case 200:
            options.success(res);
            break;
          case 401:
            this.toLogin();
            break;
          case 422:
            break;
          case 404:
            wx.showToast({
              title: '请求地址不存在',
              icon: 'none'
            })
            break;
          default:
            wx.showToast({
              title: '出错了～请稍后再试',
              icon: 'none'
            })
        }
      },
      fail: res => {
        if (options.fail) {
          options.fail(res);
        }
      },
      complete: res => {
        if (options.complete) {
          options.complete(res);
        }
      }
    });
  },

  /**
   * 验证登录
   */
  checkIsLogin(autoLogin = false) {
    if (wx.getStorageSync('token') != '') {
      return true;
    }
    if (autoLogin) {
      this.toLogin();
    } else {
      return false;
    }
  },

  /**
   * 跳转登陆页
   */
  toLogin() {
    this.globalData.hasUserInfo = false;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.showToast({
      title: '请先登陆!',
      icon: 'none',
      success: res => {
        wx.switchTab({
          url: '/pages/mine/mine'
        })
      }
    })
  },

  /**
   * 获取token
   */
  getToken(code) {
    //调后端接口获取token
    this.apiRequest({
      url: '/user/login',
      method: 'POST',
      data: {
        'code': code
      },
      success: res => {
        wx.setStorageSync('token', res.data.token);
        // callback && callback();
      }
    });
  },
});

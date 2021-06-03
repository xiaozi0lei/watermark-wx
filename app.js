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
        //向自己的后台发送请求
        // wx.request({
        //   url: this.globalData.URL+'login/',
        //   data:{
        //     code:res.code
        //   },
        //   header:{
        //     "content-type": "application/json"
        //   },
        //   method:"POST",
        //   success:function(e){
        //     console.log(e)
        //       //请求成功后会返回一个自己后端生成的 token 用来做其他操作的校验，把token保存在本地
        //     wx.setStorageSync("token", e.data.data.token)
        //   }
        // })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  /**
   * 登陆并获取用户信息、token
   * @param {*} callback 
   */
  // getUserInfo: function (callback = null) {
  //   // 登录
  //   wx.login({
  //     success: res => {
  //       // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //       var code = res.code;
  //       // 获取用户信息
  //       wx.getSetting({
  //         success: res => {
  //           if (res.authSetting['scope.userInfo']) {
  //             console.log(1)
  //             console.log(res.authSetting)
  //             // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //             wx.getUserProfile({
  //               success: res => {
  //                 console.log(2)
  //                 // 可以将 res 发送给后台解码出 unionId
  //                 this.globalData.userInfo = res.userInfo
  //                 this.globalData.hasUserInfo = true
  //                 if (!this.checkIsLogin()) {
  //                   console.log(3)
  //                   this.getToken(code, res.encryptedData, res.iv);
  //                 }
  //                 // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //                 // 所以此处加入 callback 以防止这种情况
  //                 // callback && callback(res);
  //               }
  //             })
  //           }
  //         }
  //       })
  //     }
  //   });
  // },

  globalData: {
    userInfo: null,
    hasUserInfo: false,
    // apiDomain: 'https://api.guoleishenbo.top/api', //生产
    downloadPrefix: 'https://api.guoleishenbo.top/download?url=', // 通过代理服务器中转（微信限制资源域名，不同平台cdn域名千变万化）
    apiDomain: 'http://127.0.0.1/api', // test
    // downloadPrefix: 'http://127.0.0.1/download?url=', // 通过代理服务器中转（微信限制资源域名，不同平台cdn域名千变万化）
    defaultDailyFreeParseNum: 10,
  },

  //全局统一调用接口的方法
  apiRequest: function (options) {
    console.log(wx.getStorageSync('token'))
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

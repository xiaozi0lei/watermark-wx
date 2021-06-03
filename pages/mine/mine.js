const util = require('../../utils/util.js');
var app = getApp();

Component({
  data: {
    dailyFreeParseNum: '--',
    totalParseNum: '--',
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true
        })
      }
    },
    onShow: function () {
      // if (!app.checkIsLogin()) {
      //   this.setData({
      //     hasUserInfo: false,
      //   })
      // }
      // if (app.globalData.hasUserInfo) {
      //   this.setData({
      //       userInfo: app.globalData.userInfo,
      //       hasUserInfo: app.globalData.hasUserInfo,
      //   })
      // }
      // 获取每日剩余免费解析次数
      this.getDailyFreeParseNum()
      // 获取当前用户总解析次数
      // this.getTotalParseNum();
    },

    /**
     * 授权登录
     */
    getUserProfile(e) {
      // 执行登录操作
      let code = '';
      wx.login({
        success: (res) => {
          code = res.code;
        },
      });
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          // 更新用户信息，获取新的 token
          this.updateUserInfo(code, res.encryptedData, res.iv);
          wx.setStorageSync("userInfo", res.userInfo);
        }
      })
    },
    updateUserInfo(code, encryptedData, iv) {
      //调后端接口获取token
      app.apiRequest({
        url: '/user/updateInfo',
        method: 'POST',
        data: {
          'code': code,
          'encryptedData': encryptedData,
          'iv': iv
        },
        success: res => {
          try {
            wx.setStorageSync('token', res.data.token);

          }catch(e) {
            console.log(e)
          }
          // console.log(wx.getStorageSync('token'))
          // callback && callback();
        }
      });
    },
    // getUserInfo(e) {
    //   // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    //   this.setData({
    //     userInfo: e.detail.userInfo,
    //     hasUserInfo: true
    //   })
    // },
    getUserInfo(e) {
      if (e.detail.errMsg !== 'getUserInfo:ok') {
        wx.showToast({
          title: '未授权，登录失败',
          icon: 'none'
        })
        return false;
      }
      wx.showLoading({
        title: "正在登录",
        mask: true
      });
      // 执行登录
      app.getUserInfo(res => {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: app.globalData.hasUserInfo,
        })
        wx.hideLoading();
      })
    },

    /**
     * 获取当日免费次数
     * 使用本地存储，不走服务端
     */
    getDailyFreeParseNum() {
      var num;
      var today = util.formatDate(new Date(), '');
      var lastParseDate = wx.getStorageSync('lastParseDate');
      if (lastParseDate != today) {
        wx.setStorageSync('lastParseDate', today);
        wx.setStorageSync('dailyFreeParseNum', app.globalData.defaultDailyFreeParseNum);
        num = app.globalData.defaultDailyFreeParseNum;
      } else {
        num = wx.getStorageSync('dailyFreeParseNum');
      }
      this.setData({
        dailyFreeParseNum: num
      })
    },

    /**
     * 获取总解析次数
     */
    getTotalParseNum() {
      app.apiRequest({
        url: '/records/total',
        success: res => {
          this.setData({
            totalParseNum: res.data.total_num
          })
        }
      })
    },

    //打赏
    showQrcode() {
      wx.previewImage({
        urls: ['http://www.guoleishenbo.top/img/reward-Smile-Sunny.jpeg'],
        current: 'http://www.guoleishenbo.top/img/reward-Smile-Sunny.jpeg' // 当前显示图片的http链接
      })
    },

    //分享小程序
    onShareAppMessage: function () {
      return {
        title: this.data.config_base_list.share_title ? this.data.config_base_list.share_title : '推荐一款超好用的视频去水印工具，免费解析不限次，大家都在用',
        path: '/pages/index/index',
        imageUrl: this.data.config_base_list.share_imageUrl ? this.data.config_base_list.share_imageUrl : '/images/share.jpg',
        success: function (e) {
          wx.showToast({
            title: "分享成功",
            icon: "success",
            duration: 2e3
          });
        },
        fail: function (e) {
          wx.showToast({
            title: "分享失败",
            icon: "none",
            duration: 2e3
          });
        }
      }
    },
  }
})
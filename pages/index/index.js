//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    userInfo: {},
    videoUrl: 'https://v.douyin.com/JxHkvPT/',
  },

  onLoad: function () {
  
  },

  onShow() {
    // 如果剪切板内有内容则尝试自动填充
    wx.getClipboardData({ success: res => {
      var str = res.data.trim()
      if (this.regUrl(str)) {
        wx.showModal({
          title: '检测到剪切板有视频地址，是否自动填入？',
          success: res => {
            if (res.confirm) {
              this.setData({
                videoUrl: str
              })
            }
          }
        })
      }
    } })
  },

  // 清空输入框
  inputClear: function () {
    this.setData({
      videoUrl: ''
    })
  },

  // 视频地址匹配是否合法
  regUrl: function (t) {
    return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(t)
  },

  removeMark: function() {
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
    if (num > 0) {
      this.parseVideo();
    } else {
      wx.showToast({
        title: '免费解析次数已用完！',
        icon: 'none'
      })
      // // 超免费次数需要观看激励广告
      // wx.showModal({
      //   title: "解析视频",
      //   content: "免费解析次数已用完，需观看完广告才可继续解析！",
      //   confirmColor: "#00B269",
      //   cancelColor: "#858585",
      //   success: (res) => {
      //     if (res.confirm) {
      //       videoAd.show().catch(() => {
      //         // 失败重试
      //         videoAd.load()
      //           .then(() => videoAd.show())
      //           .catch(err => {
      //             console.log('激励视频 广告显示失败')
      //           })
      //       })
      //     } else if (res.cancel) {
      //       wx.showToast({
      //         title: '广告观看完才可继续解析！',
      //         icon: 'none'
      //       })
      //     }
      //   }
      // })
    }
  },

  // 视频解析
  parseVideo: function () {
    app.apiRequest({
      url: '/video/parse',
      method: 'POST',
      data: {
        url: this.data.videoUrl
      },
      success: res => {
        console.log(res)
        var noWaterUrl = encodeURIComponent(res.data.noWaterUrl);
        var imageUrl = encodeURIComponent(res.data.imageUrl);
        var preview = res.data.preview;
        wx.setStorageSync('dailyFreeParseNum',  wx.getStorageSync('dailyFreeParseNum') - 1);
        wx.navigateTo({
          url: "../video/video?url=" + noWaterUrl + '&image=' + imageUrl + '&preview=' + preview,
        })
      }
    })
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})



// Page({
//   data: {
//     motto: 'Hello World',
//     userInfo: {},
//     hasUserInfo: false,
//     canIUse: wx.canIUse('button.open-type.getUserInfo'),
//     canIUseGetUserProfile: false,
//     canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
//   },
//   // 事件处理函数
//   bindViewTap() {
//     wx.navigateTo({
//       url: '../logs/logs'
//     })
//   },
//   onLoad() {
//     if (wx.getUserProfile) {
//       this.setData({
//         canIUseGetUserProfile: true
//       })
//     }
//   },
//   getUserProfile(e) {
//     // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
//     wx.getUserProfile({
//       desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
//       success: (res) => {
//         console.log(res)
//         this.setData({
//           userInfo: res.userInfo,
//           hasUserInfo: true
//         })
//       }
//     })
//   },
//   getUserInfo(e) {
//     // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
//     console.log(e)
//     this.setData({
//       userInfo: e.detail.userInfo,
//       hasUserInfo: true
//     })
//   }
// })

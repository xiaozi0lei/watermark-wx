// pages/video/video.js
//获取应用实例
var app = getApp(), n = ''
Page({
    data: {
        playUrl: '',
        saveUrl: '',
        downloadUrl: '',
        imageUrl: '',
        preview: 0,
    },
    onLoad: function (options) {
        console.log(options)
        this.setData({
            playUrl: decodeURIComponent(options.playUrl),
            saveUrl: decodeURIComponent(options.saveUrl),
            downloadUrl: decodeURIComponent(options.downloadUrl),
            imageUrl: decodeURIComponent(options.imageUrl),
            preview: options.preview
        })
    },
   
    onUnload: function () {
        n && n.abort()
    },
    goBack: function () {
        wx.switchTab({
          url: '/pages/index/index',
        });
    },
    copyUrl: function() {
        wx.setClipboardData({
            data: this.data.downloadUrl,
            success: function(a) {
              wx.showToast({
                title: '复制成功',
                duration: 1200
              });
            }
          });
    },

    // 保存到相册
    saveVideo: function () {
        var that = this
        var downloadUrl = app.globalData.downloadPrefix + that.data.saveUrl; // 无法直接下载资源域下的资源，需要通过nginx中转一层
        console.log(downloadUrl)
        wx.showLoading({
            title: '保存中 0%'
        }), (n = wx.downloadFile({
            url: downloadUrl,
            success: function (o) {
                wx.hideLoading(), wx.saveVideoToPhotosAlbum({
                    filePath: o.tempFilePath,
                    success: function (o) {
                        that.showToast('保存成功', 'success'), setTimeout(function () {
                            wx.setClipboardData({
                              data: '',
                            })
                            that.goBack()
                        }, 1e3)
                    },
                    fail: function (o) {
                        that.showToast('保存失败')
                    }
                })
            },
            fail: function (o) {
                n = null, wx.hideLoading(), t.showToast('下载失败')
            }
        })).onProgressUpdate(function (o) {
            100 === o.progress ? '' : wx.showLoading({
                title: '保存中 ' + o.progress + '%'
            })
        })
    },
    postSave: function (o) {
        var that = this
        // 获取用户已经同意的权限
        wx.getSetting({
            success: function (o) {
                // 确认用户是否具有写入相册的权限
                o.authSetting['scope.writePhotosAlbum'] ? that.saveVideo() : wx.authorize({
                    // 让用户授权写入相册的权限
                    scope: 'scope.writePhotosAlbum',
                    success: function () {
                        // 保存到相册
                        that.saveVideo()
                    },
                    fail: function (o) {
                        wx.showModal({
                            title: '提示',
                            content: '视频保存到相册需获取相册权限请允许开启权限',
                            confirmText: '确认',
                            cancelText: '取消',
                            success: function (o) {
                                o.confirm ? (wx.openSetting({
                                    success: function (o) { }
                                })) : ''
                            }
                        })
                    }
                })
            }
        })
    },
    showToast: function (o) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'none', n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1500
        wx.showToast({
            title: o,
            icon: t,
            duration: n
        })
    }
})

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })
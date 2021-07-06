// pages/push/add.js
import Taro, { Component } from "@tarojs/taro";
import { AtToast } from "taro-ui";
import utils from "../../utils/index.js";

var util = require("../../utils/util.js");

var app = getApp();
var today = util
  .formatTime(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 1))
  .split(" ")[0];
var minday = util.formatTime(new Date()).split(" ")[0];
var maxday = util
  .formatTime(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 62))
  .split(" ")[0];

Page({
  data: {
    userName: "",
    phone: "",
    sexOpt: ["女", "男"],
    type: 2,
    sex: 0,
    date: today,
    time: "请选择时间",
    types: [
      { name: "1", value: "车找人" },
      { name: "2", value: "人找车", checked: true }
    ],
    Surpluss: ["请选择", 1, 2, 3, 4, 5, 6],
    cusNum: 0,
    isAgree: false,
    startLocal: "出发地",
    endLocal: "目的地"
  },
  setSex: function(e) {
    console.log(e);
    this.setData({ sex: +e.detail.value });
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    });
  },
  selectType: function(e) {
    this.setData({ type: e.detail.value });
  },
  setsurplus: function(e) {
    this.setData({ cusNum: +e.detail.value });
  },
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },
  formSubmit: async function(e) {
    var data = e.detail.value;
    var that = this;
    console.log("----", data);
    if (data.userName == "") {
      util.isError("请输入姓名", that);
      return false;
    }
    if (![0, 1].includes(data.sex)) {
      util.isError("请选择性别", that);
      return false;
    }

    if (data.phone == "") {
      util.isError("请输入手机号码", that);
      return false;
    }

    if (!/^1[34578]\d{9}$/.test(data.phone)) {
      util.isError("手机号码错误", that);
      return false;
    }
    if (that.data.startLocal == "出发地") {
      util.isError("请选择出发地", that);
      return false;
    }
    if (that.data.endLocal == "目的地") {
      util.isError("请选择目的地", that);
      return false;
    }
    if (data.time == "请选择时间") {
      util.isError("请选择出发时间", that);
      return false;
    }
    if (data.cusNum == "0") {
      var arr = new Array("", "剩余空位", "乘车人数");
      util.isError("请选择" + arr[data.type], that);
      return false;
    }

    if (!data.isAgree[0]) {
      util.isError("请阅读并同意条款", that);
      return false;
    }
    // data.sk = app.globalData.sk;
    data.startLocal = that.data.startLocal;
    data.endLocal = that.data.endLocal;
    const _date = that.data.date + " " + that.data.time;
    // console.log('_date',_date,new Date(_date).getTime())
    data.date = new Date(_date).getTime();
    data.startDim = that.data.startDim;
    data.endDim = that.data.endDim;
    data.startLon = that.data.startLon;
    data.endLon = that.data.endLon;
    console.log("data---", data);
    const res = await utils.request("CusRecord/add", data);
    console.log("res", res);
    if(res.data.success){
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      })
    }
    // util.req("info/add", data, function(data) {
    //   if (data.status == 1) {
    //     wx.redirectTo({
    //       url: "/pages/push/index?id=" + data.info
    //     });
    //   } else {
    //     util.isError(data.msg, that);
    //     return false;
    //   }
    // });
    util.clearError(that);
  },
  sexDeparture: function() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        console.log("res---", res);
        that.setData({
          startLocal: res.address,
          startDim: res.latitude,
          startLon: res.longitude
        });
      }
    });
  },
  sexDestination: function() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          endLocal: res.address,
          endDim: res.latitude,
          endLon: res.longitude
        });
      }
    });
  },
  onLoad: async function() {
    const res = await utils.request("User/userInfo");
    const { info } = res.data;
    await this.setData({
      userName: info.userName,
      sex: info.sex,
      phone: info.phone
    });
    console.log("this.data", this.data);
  }
});

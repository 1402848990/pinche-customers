import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtButton, AtAvatar, AtToast } from "taro-ui";
import MySetGrid from "../../components/mySetGrid";
import utils from "../../utils/index";
import "./index.scss";

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      toast: false,
      urgentName: null,
      urgentPhone: null
    };
  }

  async componentWillMount() {
    const res = await Taro.getSetting({});
    console.log("setting...", res);
    if (res.authSetting["scope.userInfo"]) {
      const { userInfo } = await Taro.getUserInfo({});
      const oldUserInfo = this.state.userInfo;
      await this.setState({
        isLogin: true,
        userInfo: {
          ...oldUserInfo,
          ...userInfo
        }
      });
      Taro.setStorageSync("userInfo", JSON.stringify(userInfo));
    } else {
      this.setState({
        isLogin: false
      });
    }
  }

  async componentDidMount() {
    this.getUserInfoFromServer();
    this.getCusRecordData();
    this.getUrgentInfo();
  }

  componentDidShow() {
    this.getUserInfoFromServer();
    this.getCusRecordData();
    this.getUrgentInfo();
  }

  // 处理获取用户授权信息
  handleGetUserInfo = async ({ detail: { userInfo } = {} }) => {
    console.log("userInfo..", userInfo);
    if (userInfo) {
      this.setState({
        isLogin: true,
        userInfo
      });
      const { nickName, gender } = userInfo;
      // 创建账户
      const res = await Taro.request({
        url: "http://localhost:8088/interface/User/register",
        method: "POST",
        data: {
          nickName,
          sex: gender
        }
      });
      console.log("res...", res);
      Taro.setStorageSync("userInfo", JSON.stringify(userInfo));
      this.getUserInfoFromServer();
      this.getCusRecordData();
      this.getUrgentInfo();
    }
  };

  // 获取用户信息
  getUserInfoFromServer = async () => {
    const res = await utils.request("User/userInfo");
    const { info } = res.data;
    await this.setState({
      userInfo: info
    });
  };

  // 获取行程记录
  getCusRecordData = async () => {
    const res = utils.request("CusRecord/getRecordData");
    const { waitOrderCount, allCount } = (await res).data.data;
    this.setState({
      waitOrderCount,
      allCount
    });
  };

  // 获取紧急联系人信息
  getUrgentInfo = async () => {
    const res = await utils.request("Urgent/get");
    console.log("res", res);
    const {  urgentName, urgentPhone } = res.data.info||{};
    this.setState({
      urgentName,
      urgentPhone,
      isUrgent: urgentName
    });
  };

  jumpInfoSetting = () => {
    const { isLogin } = this.state;
    if (isLogin) {
      Taro.navigateTo({
        url: "/pages/myInfoSet/index"
      });
    } else {
      this.setState({
        toast: true
      });
    }
  };

  // 紧急联系人设置提交
  urgentSubmit = async () => {
    const { urgentName, urgentPhone, isUrgent } = this.state;
    await utils.request(isUrgent ? "Urgent/edit" : "Urgent/add", {
      urgentName,
      urgentPhone
    });
    this.getUrgentInfo();
  };

  getPhoneNumber = e => {
    console.log(e);
  };

  fieldChange = (field, value) => {
    console.log(field, value);
    this.setState({
      [field]: value
    });
  };

  chose = () => {
    Taro.chooseLocation({
      success: function(res) {
        console.log("res", res);
      },
      isHighAccuracy: true
    });
  };

  render() {
    const {
      userInfo,
      toast,
      isLogin,
      waitOrderCount,
      allCount,
      urgentName,
      urgentPhone
    } = this.state;
    console.log("state....", this.state);

    return (
      <View className='mine'>
        <AtToast isOpened={toast} text='请登录!'></AtToast>
        {/* 用户信息 */}
        <View onClick={this.jumpInfoSetting} className='userInfo'>
          {/* 头像 */}
          <AtAvatar
            className='avatar'
            openData={{ type: "userAvatarUrl" }}
            size='large'
            circle
            default-avatar='https://jdc.jd.com/img/200'
          ></AtAvatar>
          {/* 登录按钮 */}
          {isLogin ? (
            <>
              <Text className='userName'>
                {userInfo.userName || userInfo.nickName}
              </Text>
              <Text className='address'>{`共发布:${allCount}次 | 余额:${userInfo.amount}元 | 待出行:${waitOrderCount}`}</Text>
            </>
          ) : (
            <AtButton
              lang='zh_CN'
              className='btn-login'
              openType='getUserInfo'
              onGetUserInfo={this.handleGetUserInfo}
              type='primary'
              size='large'
              circle
            >
              立即登录
            </AtButton>
          )}
        </View>

        <MySetGrid
          urgentSubmit={this.urgentSubmit}
          fieldChange={this.fieldChange}
          urgentName={urgentName}
          urgentPhone={urgentPhone}
        />

        <Text className='version'> ——乘客端——</Text>
        <AtButton onClick={()=>{Taro.switchTab({url:'/pages/push/add'})}}>发布行程</AtButton>
      </View>
    );
  }
}

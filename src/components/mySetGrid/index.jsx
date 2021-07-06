import Taro from "@tarojs/taro";
import React, { Component } from "react";
import {
  AtToast,
  AtGrid,
  AtInput,
  AtModalAction,
  AtModal,
  AtModalContent,
  AtModalHeader,
  AtFloatLayout
} from "taro-ui";
import { View, Text, Button } from "@tarojs/components";
import "./index.scss";

const columns = [
  {
    image: "/assets/发布记录.png",
    value: "行程记录",
    path: "pushRecord"
  },
  {
    image: "/assets/个人信息.png",
    value: "个人信息",
    path: "myInfoSet"
  },
  {
    image: "/assets/我的钱包.png",
    value: "我的钱包",
    path: "wallet"
  },
  {
    image: "/assets/紧急联系人.png",
    value: "紧急联系人"
  },
  {
    image: "/assets/紧急告警.png",
    value: "一键报警"
  },
  {
    image: "/assets/帮助.png",
    value: "使用帮助"
  }
];

export default class MySetGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpened: false,
      helpOpen: false
    };
  }

  onClick = (item, index) => {
    console.log(item, index);
    if (index === 3) {
      this.setState({ isOpened: true });
    } else if (index === 5) {
      this.setState({
        helpOpen: true
      });
    } else if (index === 4) {
      wx.makePhoneCall({
        phoneNumber: "110", 
        success: function() {
          wx.showToast({
            title: '拨打电话成功！',
            icon: "success",
            duration: 2000
          });
          console.log("拨打电话成功！");
        },

        fail: function() {
          wx.showToast({
            title: '您已取消拨打',
            icon: "error",
            duration: 2000
          });
          console.log("拨打电话失败！");
        }
      });
    } else {
      Taro.navigateTo({
        url: `/pages/${item.path}/index`
      });
    }
  };

  closeHelp = () => {
    this.setState({
      helpOpen: false
    });
  };

  onConfirm = value => {
    this.props.urgentSubmit(value, "confirm");
    this.setState({
      isOpened: false
    });
  };

  render() {
    const { isOpened, helpOpen } = this.state;
    return (
      <>
        <AtModal isOpened={helpOpen}>
          <AtModalHeader>使用帮助</AtModalHeader>
          <AtModalContent>
            使用帮助使用帮助使用帮助使用帮助使用帮助使用帮助使用帮助使用帮助使用帮助
          </AtModalContent>
          <AtModalAction>
            {" "}
            <Button onClick={this.closeHelp}>取消</Button>{" "}
            <Button onClick={this.closeHelp}>确定</Button>{" "}
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={isOpened}>
          <AtModalHeader>设置紧急联系人</AtModalHeader>
          <AtModalContent className='modalContent'>
            <AtInput
              className='field'
              border={false}
              required
              name='urgentName'
              title='紧急联系人姓名'
              type='text'
              placeholder='紧急联系人姓名'
              value={this.props.urgentName}
              onChange={this.props.fieldChange.bind(this, "urgentName")}
            />
            <AtInput
              className='field'
              border={false}
              required
              name='urgentPhone'
              title='紧急联系人电话'
              type='number'
              placeholder='紧急联系人电话'
              value={this.props.urgentPhone}
              onChange={this.props.fieldChange.bind(this, "urgentPhone")}
            />
          </AtModalContent>
          <AtModalAction>
            <Button
              onClick={() => {
                this.setState({ isOpened: false });
              }}
            >
              取消
            </Button>{" "}
            <Button onClick={this.onConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
        <AtGrid className='atGrid' data={columns} onClick={this.onClick} />
      </>
    );
  }
}

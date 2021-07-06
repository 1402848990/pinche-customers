import React, { Component } from "react";
import { View, Button } from "@tarojs/components";
import {
  AtList,
  AtListItem,
  AtButton,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtInput,
  AtModalAction,
  AtNoticebar,
  AtDivider
} from "taro-ui";
import moment from 'moment'
import "./index.scss";
import utils from "../../utils/index";

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpened: false,
      amount: 100,
      rechargeRecord: [], // 充值记录
      rechargeRecordPay:[], // 支付记录
      totalRecharge: 0, // 总充值金额
      totalPay: 0, // 总支付金额
      money: 100
    };
  }

  async componentDidMount() {
    this.getAmount();
    this.getRechargeRecord();
    this.getPayRecord();
  }

  // 获取账户余额
  getAmount = async () => {
    const res = await utils.request("User/userInfo");
    const { info } = res.data;
    await this.setState({
      amount: info.amount
    });
  };

  // 获取充值记录
  getRechargeRecord = async () => {
    const {
      data: { data } = {}
    } = await utils.request("RechargeRecord/getRecord", { type: 1 });
    console.log("data", data);
    // 计算总充值金额
    let totalRecharge = 0;
    data.forEach(item => {
      totalRecharge = item.money + totalRecharge;
    });
    this.setState({
      totalRecharge,
      rechargeRecord: data
    });
  };

  // 获取支付记录
  getPayRecord = async () => {
    const {
      data: { data } = {}
    } = await utils.request("RechargeRecord/getRecord", { type: 0 });
    console.log("支付data", data);
    // 计算总支付金额
    let totalPay = 0;
    data.forEach(item => {
      totalPay = item.money + totalPay;
    });
    this.setState({
      totalPay,
      rechargeRecordPay: data
    });
  };

  handleChange = (field, value) => {
    this.setState({
      [field]: value
    });
  };

  onConfirm = async () => {
    const { money } = this.state;
    const res = await utils.request("RechargeRecord/recharge", {
      money,
      type:1
    });
    console.log("res", res);
    if (res.data.success) {
      this.setState({
        isOpened: false
      });
      this.getAmount();
      this.getRechargeRecord();
      this.getPayRecord();
    }
    // console.log("res", res);
    // console.log(title, price, wishLevel);
  };

  render() {
    const {
      isOpened,
      amount,
      totalRecharge,
      totalPay,
      rechargeRecord,
      rechargeRecordPay,
      money
    } = this.state;
    console.log('rechargeRecordPay',rechargeRecordPay)
    const data = [...rechargeRecord,...rechargeRecordPay]
    return (
      <View className='wallet'>
        <AtNoticebar marquee icon='volume-plus'>
          新用户注册免费送100元哦~😯
        </AtNoticebar>
        <AtModal isOpened={isOpened}>
          <AtModalHeader>充值</AtModalHeader>
          <AtModalContent className='modalContent'>
            <AtInput
              className='field'
              border={false}
              required
              name='price'
              title='充值金额'
              type='number'
              placeholder='请输入充值金额'
              value={money}
              onChange={this.handleChange.bind(this, "money")}
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
        <AtList>
          <AtListItem
            onClick={() => {
              this.setState({ isOpened: true });
            }}
            title='余额'
            extraText={`${amount}元`}
            arrow='right'
          />
          <AtListItem title='总充值' extraText={`${totalRecharge}元`} />
          <AtListItem title='总账单' extraText={`${totalPay}元`} />
          <AtListItem
            title='充值次数'
            extraText={`${rechargeRecord.length}次`}
          />
        </AtList>
        {/* 历史记录 */}
        <AtDivider content='历史记录' fontColor='#ed3f14' lineColor='#ed3f14' />
        <AtList>
          {data.map(item => (
            <AtListItem
              key={item.id}
              title={moment(+item.createdAt).format("YYYY-MM-DD HH:MM:ss")}
              extraText={`${item.type==0?'- ':'+ '}${item.money}元`}
            />
          ))}
        </AtList>
        <AtButton
          className='Recharge'
          onClick={() => {
            this.setState({ isOpened: true });
          }}
        >
          充值
        </AtButton>
      </View>
    );
  }
}

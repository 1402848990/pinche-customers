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
  AtFloatLayout,
  AtButton,
  AtSegmentedControl
} from "taro-ui";
import { View, Text, Button } from "@tarojs/components";
import moment from "moment";
import "./index.scss";

const empSeat = [1, 2, 3, 4, 5];
export default class MySetGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpened: false,
      helpOpen: false,
      status: 0,
      seat: undefined,
      startDate: Date.now(),
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 365
    };
  }

  // 处理时间选择
  bindDateChange = async (field, { detail: { value } = {} }) => {
    const { seat, startLocal, endLocal } = this.state;
    console.log(field, value);
    value = `${value} ${field === "startDate" ? "00:00:00" : "23:59:59"}`;
    if (field === "startDate") {
      const { endDate = moment().format("YYYY-MM-DD 23:59:59") } = this.state;
      await this.props.getCusRecordList({
        seat,
        startLocal,
        endLocal,
        endDate:
          typeof endDate === "string" ? new Date(endDate).getTime() : endDate,
        [field]: typeof value === "string" ? new Date(value).getTime() : value
      });
    } else {
      const { startDate = moment().format("YYYY-MM-DD 00:00:00") } = this.state;
      console.log("----startDate", startDate);
      await this.props.getCusRecordList({
        seat,
        startLocal,
        endLocal,
        startDate:
          typeof startDate === "string"
            ? new Date(startDate).getTime()
            : startDate,
        [field]: typeof value === "string" ? new Date(value).getTime() : value
      });
    }
    await this.setState({
      [field]: value
    });
  };

  // 地址选择
  chooseLocal = field => {
    Taro.chooseLocation({
      success: res => {
        const { latitude, longitude, address, name } = res;
        console.log("res", res);
        this.props.getCusRecordList({ [field]: { latitude, longitude } });
        this.setState({
          [field]: address
        });
      },
      isHighAccuracy: true
    });
  };

  // 选择剩余空座
  bindSeatChange = ({ detail: { value } }) => {
    this.props.getCusRecordList({
      seat: +value + 1
    });
    this.setState({
      seat: +value + 1
    });
  };

  // 订单状态选择
  handleStatus = status => {
    status = +status;
    console.log("status", status);
    this.props.getCusRecordList({
      status: status === 0 ? undefined : status === 5 ? 9 : status - 1
    });
    this.setState({
      status
    });
  };

  getFilter = () => this.state;

  render() {
    const {
      isOpened,
      helpOpen,
      startDate,
      startLocal,
      endLocal,
      endDate,
      seat
    } = this.state;
    console.log("state...", this.state);
    return (
      <View className='recordFilter'>
        {/* 起止地点选择 */}
        <View className='date'>
          <Text className='title'>起止时间：</Text>
          <picker
            className='datePicker'
            onChange={this.bindDateChange.bind(this, "startDate")}
            mode='date'
            value={startDate}
          >
            <AtButton className='picker' size='small'>
              {moment(startDate).format("YYYY-MM-DD")}
            </AtButton>
          </picker>
          <image className='right' src='/assets/right.png' />
          <picker
            className='datePicker'
            onChange={this.bindDateChange.bind(this, "endDate")}
            mode='date'
            value={endDate}
          >
            <AtButton className='picker' size='small'>
              {moment(endDate).format("YYYY-MM-DD")}
            </AtButton>
          </picker>
        </View>
        {/* 起止地点选择 */}
        <View className='date'>
          <Text className='title'>起止地点：</Text>
          <AtButton
            size='small'
            className='chooseLocal'
            onClick={this.chooseLocal.bind(this, "startLocal")}
          >
            {startLocal || "出发地点"}
          </AtButton>
          <image className='right' src='/assets/right.png' />
          <AtButton
            size='small'
            className='chooseLocal'
            onClick={this.chooseLocal.bind(this, "endLocal")}
          >
            {endLocal || "目的地点"}
          </AtButton>
        </View>
        {/* 乘客人数   订单状态 */}
        {this.props.seatSelect && (
          <View className='date'>
            <Text className='title'>剩余空座：</Text>
            <picker
              className='datePicker'
              onChange={this.bindSeatChange}
              mode='selector'
              range={empSeat}
              value={this.state.seat}
            >
              <AtButton className='picker' size='small'>
                {(seat == 0 && seat) || (seat && seat)}
              </AtButton>
            </picker>
          </View>
        )}
        {this.props.statusSelect && (
          <AtSegmentedControl
            values={["全部", "待成单", "待出行", "进行中", "已完成", "已废弃"]}
            onClick={this.handleStatus}
            current={this.state.status}
          />
        )}
      </View>
    );
  }
}

import React, { Component } from "react";
import Taro from "@tarojs/taro";
import moment from "moment";
import {
  AtButton,
  AtList,
  AtListItem,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtInput,
  AtSlider,
  AtToast,
  AtCard
} from "taro-ui";
import RecordFilter from "../../components/recordFilter";
import { View, Text, ScrollView, Button } from "@tarojs/components";
import util from "../../utils/index";
import "./index.scss";
import utils from "../../utils/index";
import { wxAppinfo } from "../../utils/util";

const scrollStyle = {
  height: "520px"
};
const scrollTop = 0;
const Threshold = 20;

const OrderStatusMap = {
  0: "待成单",
  1: "待出行",
  2: "进行中",
  3: "已完成",
  4: "已关闭",
  9: "已废弃"
};

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      title: "",
      isOpened: false,
      recordList: [],
      price: 0.0,
      wishLevel: 1,
      delSucc: false,
      search: "", // 搜索
      current: 0,
      recordList: [],
      startDate: Date.now(), // 筛选开始时间
      endDate: Date.now(), // 筛选结束时间
      message: "",
      cusNum: 1,
      detailModal: false,
      driDetail: {},
      orderDetail: {}
    };
  }

  componentWillMount() {}

  async componentDidMount() {
    await this.getCusRecordList();
  }

  // 获取乘客订单记录
  getCusRecordList = async filter => {
    const res = await util.request("CusRecord/getRecordList", {
      ...filter
    });
    console.log("res...", res);
    if (res.data.success) {
      await this.setState({
        recordList: res.data.data,
        filter
      });
    }
  };

  addTrip = () => {
    Taro.switchTab({
      url: "/pages/push/add"
    });
  };

  handleChange = (field, value) => {
    this.setState({
      [field]: value
    });
  };

  // 处理时间选择
  bindDateChange = async (field, { detail: { value } = {} }) => {
    console.log(field, value);
    if (field === "startDate") {
      const { endDate } = this.state;
      await this.getRecordList({
        endDate:
          typeof endDate === "string" ? new Date(endDate).getTime() : endDate,
        [field]: typeof value === "string" ? new Date(value).getTime() : value
      });
    } else {
      const { startDate } = this.state;
      await this.getRecordList({
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

  onSearchChange = value => {
    this.setState({
      search: value
    });
  };

  // 点击搜索
  onSearch = async () => {
    const { search } = this.state;
    console.log("search", search);
    await this.getCusRecordList({
      search
    });
  };

  onConfirm = async () => {
    const { title, price, wishLevel } = this.state;
    const res = await util.request("Wish/addWish", {
      title,
      wishPrice: price,
      wishLevel
    });
    if (res.data.success) {
      this.setState({
        isOpened: false
      });
      this.getWishList();
    }
    console.log("res", res);
    console.log(title, price, wishLevel);
  };

  // 点击删除
  handleClick = async id => {
    console.log("id", id);
    const res = await util.request("Wish/deleteWish", { id });
    if (res.data.success) {
      this.setState({
        delSucc: true
      });
      this.getWishList();
      setTimeout(() => {
        this.setState({
          delSucc: false
        });
      }, 2000);
    }
  };

  showDetail = async item => {
    const { matchCode } = item;
    const res = await utils.request("CusRecord/getRecordDetailDriver", {
      matchCode
    });
    this.setState({
      driDetail: res.data.info,
      orderDetail: item
    });
    this.setState({
      detailModal: true
    });
  };

  // 行程开始 || 行程结束
  startOrder = async () => {
    const {
      status,
      matchCode,
      id,
      nickName: driNickName,
      price
    } = this.state.orderDetail;
    if (status === 1 || status === 2) {
      const res = await utils.request("CusRecord/updateCusRecord", {
        id,
        status: status + 1,
        matchCode,
        driNickName,
        price
      });
      if (res.data.success) {
        wx.showToast({
          title: status === 1 ? "行程开始，祝您愉快" : "行程完成",
          icon: "success",
          duration: 2000
        });
      }
    }
    this.getCusRecordList(this.state.filter);
    this.setState({
      detailModal: false
    });
  };

  render() {
    let {
      isOpened,
      title,
      price,
      recordList,
      wishLevel,
      detailModal,
      driDetail = {},
      orderDetail
    } = this.state;

    return (
      <View className='pushRecord'>
        {/* 详情弹窗 */}
        <AtModal className='detailModal' isOpened={detailModal}>
          <AtModalHeader>订单详情</AtModalHeader>
          <AtModalContent>
            <AtList>
              <AtListItem title='司机姓名' extraText={driDetail.userName} />
              <AtListItem
                title='司机性别'
                extraText={driDetail.sex === 0 ? "女" : "男"}
              />
              <AtListItem title='司机电话' extraText={driDetail.phone} />
              <AtListItem title='车牌号' extraText={driDetail.carCode} />
              <AtListItem title='订单号' extraText={driDetail.matchCode} />
            </AtList>
          </AtModalContent>
          <AtModalAction>
            <Button
              onClick={() => {
                this.setState({
                  detailModal: false
                });
              }}
            >
              取消
            </Button>
            <Button onClick={this.startOrder}>
              {orderDetail.status === 1
                ? "行程开始"
                : orderDetail.status === 2
                ? "行程结束"
                : "确定"}
            </Button>{" "}
          </AtModalAction>
        </AtModal>
        <AtToast
          isOpened={this.state.delSucc}
          text='删除成功'
          icon='success'
          status='success'
        ></AtToast>
        {/* 头部筛选区域 */}
        <RecordFilter
          ref={this.ref}
          getCusRecordList={this.getCusRecordList}
          statusSelect
        />
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          scrollTop={scrollTop}
          style={scrollStyle}
          lowerThreshold={Threshold}
          upperThreshold={Threshold}
        >
          <View className='recordList'>
            {recordList.map((item, index) => {
              return (
                <AtCard
                  onClick={() => this.showDetail(item)}
                  key={item.id}
                  note={`备注：${item.remark}`}
                  extra={`￥${item.price || "-"}`}
                  title={moment(item.date).format("YYYY-MM-DD HH:MM")}
                  thumb='/assets/time_4px.png'
                >
                  <View className='item'>
                    <View className='local'>
                      <Text className='startLocal'>{item.startLocal}</Text>
                    </View>
                    <View className='local'>
                      <Text className='endLocal'>{item.endLocal}</Text>
                    </View>
                    <View className='local'>
                      <Text className='createdAt'>
                        发布时间：
                        {moment(+item.createdAt).format("YYYY-MM-DD HH:MM:ss")}
                      </Text>
                    </View>
                    <View className='status'>
                      {OrderStatusMap[item.status]}
                    </View>
                  </View>
                </AtCard>
              );
            })}
          </View>
        </ScrollView>
        <View className='float'>
          <AtButton circle className='btn-addType' onClick={this.addTrip}>
            发布行程
          </AtButton>
        </View>
      </View>
    );
  }
}

import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, ScrollView, Button } from "@tarojs/components";
import RecordFilter from "../../components/recordFilter";
import {
  AtButton,
  AtCard,
  AtIcon,
  AtTabs,
  AtTabsPane,
  AtSearchBar,
  AtMessage,
  AtNoticebar,
  AtModal,
  AtInput,
  AtModalAction,
  AtModalContent,
  AtModalHeader,
  AtToast,
} from "taro-ui";
import moment from "moment";
import utils from "../../utils/index";
import "./index.scss";

const OrderStatusMap = {
  0: "待成单",
  1: "待出行",
  2: "进行中",
  3: "已完成",
  4: "已关闭",
  9: "已废弃"
};
const scrollStyle = {
  height: "450px"
};
const scrollTop = 0;
const Threshold = 20;
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.typeSelectRef = React.createRef();
    this.state = {
      search: "", // 搜索
      current: 0,
      recordList: [],
      startDate: Date.now(), // 筛选开始时间
      endDate: Date.now(), // 筛选结束时间
      message: "",
      cusNum:1
    };
  }

  async componentDidMount() {
    console.log("-------");
    await this.getCusRecordList();
  }

  async componentDidShow() {
    console.log("#$$$$$$", this.ref.current);
    const filter = this.ref.current.getFilter();
    delete filter.isOpened;
    delete filter.helpOpen;
    delete filter.status;
    await this.getCusRecordList(this.ref.current.getFilter());
  }

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

  // 获取司机发布记录
  getCusRecordList = async filter => {
    console.log('filter',filter)
    const res = await utils.request("CusRecord/getRecordListDriver", {
      ...filter,
      status: 0
    });
    console.log("res...", res);
    if (res.data.success) {
      await this.setState({
        recordList: res.data.data
      });
    }
  };

  /**
   * 先查询余额是否充足
   * 然后生成matchCode，并更新到司机和乘客的record中，更新status，司机空座-出行人数，
   */
  handleMatchOrder = async () => {
    const { orderInfo,cusNum } = this.state;
    const resInfo = await utils.request("User/userInfo");
    const { info } = resInfo.data;
    console.log('info',info)
    const totalFee = +cusNum * +orderInfo.price
    console.log('totalFee',totalFee)
    // 如果剩座不足
    if(cusNum>Number(+orderInfo.cusNum-+orderInfo.cusNumIn)){
      Taro.atMessage({
        'message': '该车剩余座位不足，请减少出行人员！',
        'type':'error',
      })
      return
    }
    // 如果余额不足
    if(totalFee>info.amount){
      Taro.atMessage({
        'message': '您的账户可用余额不足，请先充值！',
        'type':'error',
      })
      return
    }
    const matchOrderRes = await utils.request('MatchOrder/match',{
      orderInfo,
      cusNum,
      userName:info.userName
    })
    console.log('matchOrderRes',matchOrderRes)
    if(matchOrderRes.data.success){
        this.setState({
        okOpened: true,
        orderConfirm:false
        });
        setTimeout(() => {
          this.setState({
            okOpened: false
          });
        }, 2000);
      this.getCusRecordList();
    }
  };

  render() {
    const {
      recordList,
      startDate,
      endDate,
      current,
      message = "",
      orderConfirm,
      cusNum,
      okOpened
    } = this.state;
    console.log("message", message);
    console.log("recordList", recordList);
    return (
      <View className='index'>
        <AtToast
          isOpened={okOpened}
          text='拼车成功'
          icon='success'
          status='success'
        ></AtToast>
        <AtMessage />
        {message && (
          <AtNoticebar marquee icon='volume-plus'>
            {`${message}`}
          </AtNoticebar>
        )}
        {/* 头部筛选区域 */}
        <RecordFilter ref={this.ref} getCusRecordList={this.getCusRecordList} seatSelect />
        {/* 搜索 */}
        <AtSearchBar
          value={this.state.search}
          onChange={this.onSearchChange}
          onActionClick={this.onSearch}
          placeholder='模糊搜索'
        />
        {/* 订单区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          scrollTop={scrollTop}
          style={scrollStyle}
          lowerThreshold={Threshold}
          upperThreshold={Threshold}
        >
          <View className='pushRecord'>
            {recordList.map((item, index) => {
              return (
                <AtCard
                  key={item.id}
                  note={`备注：${item.remark}`}
                  extra={`${OrderStatusMap[item.status]} | ￥${item.price ||
                    "-"}`}
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
                    <View className='local'>
                      <Text className='num'>
                        总空座：{item.cusNum}人 || 剩余空座：
                        {item.cusNum - Number(item.cusNumIn)}人
                      </Text>
                    </View>
                    <View className='status'>
                      <AtButton
                        onClick={() =>
                          this.setState({
                            orderConfirm: true,
                            orderInfo:item
                          })
                        }
                        type='primary'
                        size='small'
                        className='doOrder'
                      >
                        立即拼车
                      </AtButton>
                    </View>
                  </View>
                </AtCard>
              );
            })}
          </View>
        </ScrollView>
        <AtModal isOpened={orderConfirm}>
          <AtModalHeader>确认拼车，设置出行人数</AtModalHeader>
          <AtModalContent className='modalContent'>
            <AtInput
              className='field'
              border={false}
              required
              name='cusNum'
              title='出行人数'
              type='number'
              placeholder='输入出行人数'
              value={cusNum}
              onChange={value => {
                this.setState({ cusNum: value });
              }}
            />
          </AtModalContent>
          <AtModalAction>
            <Button
              onClick={() => {
                this.setState({ orderConfirm: false });
              }}
            >
              取消
            </Button>
            <Button onClick={this.handleMatchOrder}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

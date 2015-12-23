/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  Dimensions,
  Image,
  ListView,
  TouchableOpacity,
  Navigator,
} = React;


var screen = require('Dimensions').get('window');

var CreditSummary = React.createClass({
  getInitialState: function() {
    var listdata=[
        {name:'忆江南黄金礼包',value:'5000元',sale:24,credit:'50000积分',img:'./images/libao.png'},
        {name:'忆江南黄金礼包',value:'5000元',sale:24,credit:'50000积分',img:'./images/libao.png'},
        {name:'忆江南黄金礼包',value:'5000元',sale:24,credit:'50000积分',img:'./images/libao.png'},
        ]
    var dataSource= new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
   return {
      dataSource:dataSource.cloneWithRows(listdata),
      loaded: false,
    };
  },

  onPressButton:function(){
    // this.props.navigator.push({
    //   title:'giftdetail',
    //   component: GiftDetail,
    // })

  },
  _renderRow:function(rowData: string, sectionID: number, rowID: number){
    return(
          <View style={styles.cname}>
            <Image
              style={styles.img}
              source={require('./images/libao.png')} />
            <View style={styles.middle}>
              <Text style={[styles.coltext,{color:'black',fontSize:16}]}>{rowData.name}</Text>
              <Text style={styles.coltext}>价值：{rowData.value}</Text>
              <Text style={styles.coltext}>销量：{rowData.sale}</Text>
              <Text style={styles.coltext}>积分：<Text style={{color:'red'}}>{rowData.credit}</Text></Text>
            </View>
            <View style={styles.right}>
              <TouchableOpacity style={styles.button} onPress={this.onPressButton}>
              <Text style={styles.buttontext}>兑换</Text>
              </TouchableOpacity>
            </View>
          </View>
      )
  },

  render: function() {

    return (
        <View style={styles.normal}>
          <View style={styles.header} >
            <Text style={[styles.coltext,{color:'black',paddingRight:30}]}> 当前积分</Text>
            <Text style={styles.headerText}>20395</Text>
            <View />
          </View>
          <View style={styles.seperator} / >
          <ListView
          dataSource={this.state.dataSource}
          style={styles.listview}
          renderRow={this._renderRow} />

          <View style={styles.bottom}>
            <View />
            <Text style={styles.foottext}>累计积分:526670</Text>
          </View>
        </View>





    );
  }
});

var styles = StyleSheet.create({
  normal:{
    flex:1,
    flexDirection:'column',
  },
  button:{
    height:20,
    backgroundColor:'red',
    width:50,
    borderRadius:4,
    alignItems:'center',
    justifyContent:'center'
  },

  buttontext:{
    color:'white',
    fontSize:12,
  },
  list:{
    flex:1,
  },
  listview:{
    flex:1,
    marginBottom:25,
    padding:10,
  },
    bottom:{
    position: 'absolute',
    bottom: 0,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:25,
    width:screen.width,
    backgroundColor:'##F8F8F8',
    paddingLeft:15,
    paddingRight:15,
  },
  middle:{
    flex:2,
    paddingLeft:15
  },
  right:{
    flex:1,
    alignItems:'center'
  },
  number:{
    flex:1,
    textAlign:'center',
    fontSize:16
  },
  cname:{
    flex:1,
    flexDirection:'row',
    borderBottomWidth:1,
    borderColor:'#F1F1F1',
    height:85,
    alignItems:'center',
  },
  coltext:{
    color:'#ADADAD',
    fontSize:10,
    margin:1,
  },
  foottext:{
    color:'#C5C5C5',
    fontSize:12,
  },
   header:{
    height:50,
    alignItems:'center',
    flexDirection:'row',
    padding:10,
  },
      headerText: {
    fontSize:22,
    color:'red',
  },
  seperator:{
    height:15,
    backgroundColor:'#F0F0F0',
  },
  container: {
    paddingLeft:15,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenttext:{
    color:'red'

  },
  img:{
    width:65,
    height:65,
    borderRadius:4,
  },
});

module.exports = CreditSummary;

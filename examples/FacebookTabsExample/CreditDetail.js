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
} = React;


var screen = require('Dimensions').get('window');

var CreditDetail = React.createClass({
  getInitialState: function() {
    var listdata={
        sectiondata:{title:'本月',credit:'435'},
        detail:[
        {message:'大猫（6009）通过推广码安装了鱼多多',date:'09-07',time:'12:32',type:1,number:'5'},
        {message:'大猫（6009）消费100元，优惠20元',date:'09-06',time:'08:16',type:1,number:'8'},
        {message:'发布放鱼公告',date:'09-05',time:'07:22',type:1,number:'1'},
        {message:'鱼多多官方奖励',date:'09-05',time:'07:22',type:1,number:'100'},
        {message:'申请鱼多多活动礼包',date:'09-05',time:'07:22',type:2,number:'300'},
        ]
        }
	var dataBlob = {};
	var sectionIDs = [];
	var rowIDs = [];
    var getSectionData = (dataBlob, sectionID) => {
      return dataBlob[sectionID];
    };
    var getRowData = (dataBlob, sectionID, rowID) => {
      return dataBlob[rowID];
    };
    var dataSource = new ListView.DataSource({
      getRowData: getRowData,
      getSectionHeaderData: getSectionData,
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    var ii =0;
    rowIDs[ii] =[];
    var sectionName = 'Section ' + ii;
	sectionIDs.push(sectionName);
	dataBlob[sectionName] = listdata.sectiondata;
	for (var jj = 0; jj < listdata.detail.length; jj++) {
	    var rowName = 'S' + ii + ', R' + jj;
	    rowIDs[ii].push(rowName);
	    dataBlob[rowName] = listdata.detail[jj];
	}
    
   	return {
      dataSource: dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
      loaded: false,
      pressed:false,
    };
  },
  _renderRow:function(rowData: string, sectionID: number, rowID: number){
    var number = rowData.type ===1 ?
    <Text style={[styles.number,{color:'red'}]}>+{rowData.number}</Text>:
    <Text style={[styles.number,{color:'green'}]}>-{rowData.number}</Text>;

    return(
    	<View style={styles.row}>
          <View style={{flex:1}}>
          <Text style={styles.coltext}>{rowData.time}</Text>
          <Text style={styles.coltext}>{rowData.date}</Text>
          </View>
          <Text style={[styles.message,{paddingLeft:10}]}>{rowData.message}</Text>
          {number}
         </View>
      )
  },

_renderSectionHeader: function(sectionData: string, sectionID: string) {

    return (
      <View style={styles.section}>
      <Text style={styles.sectiontext}>{sectionData.title}</Text>
      <Text style={styles.sectiontext}>{sectionData.credit}分</Text>
      </View>
    );
    
  },

  render: function() {

    return (
        <View>

           <ListView
            dataSource={this.state.dataSource}
            renderSectionHeader={this._renderSectionHeader}
            renderRow={this._renderRow} />
          </View>
    );
  }
});

var styles = StyleSheet.create({
	section:{
		flexDirection:'row',
		justifyContent:'space-between',
		backgroundColor:'#F8F8F8',
		borderColor:'#E5E5E5',
		borderTopWidth:1,
		borderBottomWidth:1,
		height:30,
		alignItems:'center',
		paddingLeft:15,
		paddingRight:10,
	},
	sectiontext:{
		fontSize:12,
		color:'#CCCCCC'
	},
	message:{
		flex:4,
		fontSize:12,
		color:'#979797',

	},

  number:{
    flex:1.2,
    textAlign:'center',
    color:'#EA5045',
    fontSize:22,
  },
  row:{
    flexDirection:'row',
    borderBottomWidth:1,
    borderColor:'#EBEBEB',
    height:60,
    alignItems:'center',
    paddingLeft:10,
    paddingRight:10,
  },
  coltext:{
    textAlign:'center',
    fontSize:12,
    color:'#CCCCCC'
  },

   header:{
    height:55,
    alignItems:'flex-end',
    justifyContent:"space-between",
    flexDirection:'row',
    padding:10,
  },
      headerText: {
    fontSize:18,

    fontWeight:'bold',

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
    width:25,
    height:25,
  },
});

module.exports = CreditDetail;

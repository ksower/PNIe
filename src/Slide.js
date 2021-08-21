/*global chrome*/
import React, { Component } from 'react';
import './SlideStyle.css';
import Network from './network/Page';
import Manage from './management/Page'


var storage_tmp = [];
var files_tmp = [];

class Slide extends Component{
  constructor(props){
    super(props);
    this.state = {
      network_name: null,
      encrypt_key: null,
      total_mail_list: [],
      total_storage_files: [],
      network_files: [],
      current_page: 1,
      margin_left: "-0%",
      effect: [
        {page:1, opacity:1},
        {page:2, opacity:0}
      ]
    };
    this.getStorage = this.getStorage.bind(this);               // IPFS 실행 시 초기 데이터(메일 목록)을 storage에서 가져옴
    this.changeNetworkName = this.changeNetworkName.bind(this); // network 이름 변경(state에 update)
    this.changeKey = this.changeKey.bind(this);                 // network 암호화 키 변경(state에 update)
    this.changePage = this.changePage.bind(this);               // 페이지 전환(network page와 manage page 간)
    this.storageFileGet = this.storageFileGet.bind(this);       // chrome storage에서 file 목록을 get
    this.storageFileSet = this.storageFileSet.bind(this);       // chrome storage에 file 목록 업데이트
    this.changeStar = this.changeStar.bind(this);               // 파일 별 즐겨찾기 정보 변경
    this.storageMailSet = this.storageMailSet.bind(this);       // 메일 목록 업데이트
  }

  // IPFS 실행 시 초기 데이터(메일 목록)을 storage에서 가져옴
  getStorage(){
    var mail_tmp = [];

    chrome.storage.sync.get(["MailList"], function(result){
        mail_tmp = result.MailList;
    });

    setTimeout(function(){
        if(mail_tmp == null){ mail_tmp = []; }

        this.setState({
            total_mail_list: mail_tmp
        });
    }.bind(this), 300);
  }

  // network 이름과 암호화 키 변경(state에 update)
  changeNetworkName(_name){ this.setState({network_name: _name}); }
  changeKey(_key){ this.setState({encrypt_key: _key}); }
  // 페이지 전환(network page와 manage page 간)
  changePage(_page){
    var left = "-" + (_page - 1) * 100 + "%";
    var effect_tmp = Array.from(this.state.effect);
    var i = 0;
    while(i < effect_tmp.length){
      if(effect_tmp[i].page == _page){ effect_tmp[i].opacity = 1; }
      else{ effect_tmp[i].opacity = 0; }
      i++;
    }
    this.setState({
      current_page: _page,
      margin_left: left,
      effect: effect_tmp
    });
    if(_page == 2){
      this.props.buffering('visible', 'file');
    }
  }

  // chrome storage에서 file 목록을 get
  storageFileGet(){
    setTimeout(function(){
      var name = this.state.network_name;
      chrome.storage.sync.get(["Files"], function(result){
          console.log("file get");
          storage_tmp = result.Files;
          if(storage_tmp == null){storage_tmp=[];}
          files_tmp = storage_tmp.filter(file => file.network == name);
      });
      setTimeout(function() { 
        this.setState({
          total_storage_files: storage_tmp,
          network_files: files_tmp
        });
        this.props.buffering('hidden', 'file');
      }.bind(this), 500);
    }.bind(this), 500);
  }
  // chrome storage에 file 저장 및 리스트 업데이트
  storageFileSet(_filename, _hash){
    var name = this.state.network_name;
    var index = 0;
    var i = 0;

    while(storage_tmp[i]){
      if(storage_tmp[i].network == name && storage_tmp[i].hash == _hash){
        return;
      }
      i++;
    }

    if(storage_tmp == null || storage_tmp.length == 0){ storage_tmp=[]; index=0;}
    else{
        var i = 0;
        while(storage_tmp[i]){i++;}
        index = storage_tmp[i-1].index;
    }

    storage_tmp.push({index:index+1, star:'uncheck', network:name, filename:_filename, hash:_hash, owner:this.props.UserName});
    files_tmp = storage_tmp.filter(file => file.network == name);
    this.setState({network_files: files_tmp});

    console.log(storage_tmp);
    chrome.storage.sync.set({"Files":storage_tmp}, function(){
        console.log("file save");
    });
  }
  // 파일에 대한 즐겨찾기 변경
  changeStar(_hash){
    var name = this.state.network_name;
    var i = 0;
    
    while(storage_tmp[i]){
      if(storage_tmp[i].hash == _hash){
        if(storage_tmp[i].star == 'check'){ storage_tmp[i].star = 'uncheck'; }
        else{ storage_tmp[i].star = 'check'; }
      }
      i++;
    }

    files_tmp = storage_tmp.filter(file => file.network == name);
    this.setState({network_files: files_tmp});

    chrome.storage.sync.set({"Files":storage_tmp}, function(){
      console.log("file save");
    });
  }

  // chrome storage에 mail 저장 및 리스트 업데이트
  storageMailSet(_list){
    var list_tmp = [];

    chrome.storage.sync.set({MailList: _list});
    setTimeout(function(){
      chrome.storage.sync.get(['MailList'], function(result){
        list_tmp = result.MailList;
      });
      
      setTimeout(function(){
        this.setState({total_mail_list: list_tmp});
      }.bind(this), 100);
    }.bind(this), 100);
  }


  async componentWillMount(){
    this.getStorage();
  }


  render(){
    return(
      <div className="slide">
        <div className="move">
          <ul style={{marginLeft:this.state.margin_left}}>
            <li style={{opacity:this.state.effect[0].opacity}}>
                <Network 
                  PeerId={this.props.PeerId} 
                  UserName={this.props.UserName}
                  total_mail_list={this.state.total_mail_list}
                  onSubmit={function(_page, _name, _key){
                      this.changePage(_page);
                      this.changeNetworkName(_name);
                      this.changeKey(_key);
                      this.storageFileGet();
                    }.bind(this)}
                  updateMail={function(_list){
                      this.storageMailSet(_list);
                    }.bind(this)}
                ></Network>
            </li>
            <li style={{opacity:this.state.effect[1].opacity}}>
                <Manage 
                  IPFS={this.props.IPFS} 
                  PeerId={this.props.PeerId}
                  UserName={this.props.UserName}
                  network_name={this.state.network_name} 
                  encrypt_key={this.state.encrypt_key} 
                  network_files={this.state.network_files}
                  total_mail_list={this.state.total_mail_list}
                  changeStar={this.changeStar}
                  saveFile={this.storageFileSet}
                  onSubmit={function(_page){
                      this.changePage(_page);
                    }.bind(this)}
                  updateMail={function(_list){
                      this.storageMailSet(_list);
                    }.bind(this)}
                ></Manage>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Slide;

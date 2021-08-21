/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import Buffering from './image/buffering.png';
import Title from './Title';
import Slide from './Slide';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      IPFS: null,
      PeerId: null,
      user_name: '',
      app_buffer_visibility: 'hidden',
      buffering_kind: 'network'
    };
    this.ipfsDaemon = this.ipfsDaemon.bind(this);  // IPFS 프로토콜을 실행
    this.buffering = this.buffering.bind(this);    // 버퍼링 페이지 visibility 설정
    this.getUserName = this.getUserName.bind(this);
  }

  // IPFS 프로토콜을 실행
  async ipfsDaemon(){
    const IPFS = require('ipfs-core');
    const daemon = await IPFS.create();
    const config = await daemon.config.get("Identity");

    this.setState({
      IPFS: daemon,
      PeerId: config.PeerID
    });

    this.buffering('visible', "network");
    setTimeout(function(){
      this.buffering('hidden', 'network');
    }.bind(this), 3000);
  }

  // 버퍼링 페이지 visibility 설정
  buffering(_visibility, _kind){
    this.setState({
      app_buffer_visibility:_visibility,
      buffering_kind: _kind
    });
  }

  getUserName(){
    var name = '';
    chrome.storage.sync.get(["User"], function(result){
      console.log('get user name');
      name = result.User;
    });
    setTimeout(function(){
      this.setState({user_name: name});
    }.bind(this), 500);
  }

  render(){
    var buffering_text = '';
    if(this.state.buffering_kind == 'network'){ buffering_text='IPFS를 실행하는 중입니다...'; }
    else if(this.state.buffering_kind == 'file'){ buffering_text="파일을 가져오고 있습니다..."; }


    return(
      <div className="app">
        <div className="app_buffer" style={{visibility:this.state.app_buffer_visibility}}>
          <img src={Buffering}/>
          <p>{buffering_text}</p>
        </div>

        <div className="previous">
          <Title 
            startIPFS={this.ipfsDaemon}
            getName={this.getUserName}
          ></Title>
        </div>

        <div className="service">
          <Slide 
            IPFS={this.state.IPFS} 
            PeerId={this.state.PeerId}
            UserName={this.state.user_name}
            buffering={(_visibility, _kind) => this.buffering(_visibility, _kind)}
          ></Slide>
        </div>
      </div>
    );
  }
}

export default App;

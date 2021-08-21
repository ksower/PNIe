/*global chrome*/
import {Component} from 'react';
import './PageStyle.css';
import Logo from '../image/logo.png';
import Back from '../image/back_button.png';
import Files from './manage_menu/File';

class Page extends Component{
    constructor(props){
        super(props);
        this.state={
            side_menu: 1,
            selected: [
                {menu:1, background:'gray', color:'white'},
                {menu:2, background:'white', color:'black'},
                {menu:3, background:'white', color:'black'}
            ],
            show_key: 'hidden',
            m_sub: 'hidden',
            ml_sub: 'hidden',
            user_input_pwd: '',
            check: 0,
            total_mail_list: [],
            before_mail_list: [],
            after_mail_list: []
        };         
        this.changeContent = this.changeContent.bind(this);             // sub content를 변경(manage page의 오른쪽 부분)
        this.showKeyToOther = this.showKeyToOther.bind(this);           // 배포를 위한 네트워크 키 보여주는 창에 대한 설정(visibility 설정)
        this.handleUserInputPwd = this.handleUserInputPwd.bind(this);   // 사용자가 입력하는 비밀번호
        this.checkPwd = this.checkPwd.bind(this);                       // 사용자의 비밀번호 입력을 체크하는 것
        this.showMail = this.showMail.bind(this);                       // 현재 네트워크의 메일 목록 출력
        this.netAddMail = this.netAddMail.bind(this);                   // 메일 추가 창 출력
        this.handleBeforeBuf = this.handleBeforeBuf.bind(this);         // 변경 전 메일 목록
        this.handleAfterBuf = this.handleAfterBuf.bind(this);           // 변경 후 메일 목록
        this.addNetMailList = this.addNetMailList.bind(this);           // 현재 네트워크에 메일 추가
        this.delNetMailList = this.delNetMailList.bind(this);           // 현재 네트워크에서 메일 삭제
    }

    // sub content를 변경(manage page의 오른쪽 부분)
    changeContent(_side_menu){
        if(this.state.side_menu != _side_menu){
            var selected_tmp = this.state.selected;
            var i = 0;
            while(i < selected_tmp.length){
                if(i == _side_menu - 1){
                    selected_tmp[i].background = 'gray';
                    selected_tmp[i].color = 'white';
                }
                else{
                    selected_tmp[i].background='white';
                    selected_tmp[i].color='black';
                }
                i++;
            }

            this.setState({
                side_menu: _side_menu,
                selected: selected_tmp
            });
        }
    }

    // 배포를 위한 네트워크 키 보여주는 창에 대한 설정(visibility 설정)
    showKeyToOther(kind){
        var show = '';
        if(kind == 'open'){ show = 'visible'; }
        else if(kind == 'close'){ show = 'hidden'; }
        this.setState({show_key:show, check:0});
    }
    // 사용자가 입력하는 비밀번호
    handleUserInputPwd(e){
        this.setState({user_input_pwd: e.target.value});
    }
    // 사용자의 비밀번호 입력을 체크하는 것
    checkPwd(){
        var pwd = '';
        const SHA = require('crypto-js/sha256');
        var u_pwd = this.state.user_input_pwd;

        chrome.storage.sync.get(["Password"], function(result) {
            pwd = result.Password;
            console.log(pwd);
        });
        setTimeout(function(){
            if(SHA(u_pwd).toString() == pwd){
                this.setState({check: 1});
            }
            else{
                alert("비밀번호가 일치하지 않습니다.");
            }
            console.log(u_pwd, pwd);
        }.bind(this), 300);
    }

    // 현재 네트워크의 메일 목록 출력
    showMail(){
        var effect_tmp = this.state.m_sub;
        if(effect_tmp == 'hidden'){ effect_tmp='visible'; }
        else{ effect_tmp='hidden'; }
        this.setState({m_sub: effect_tmp});
    }
    // 메일 추가 창 출력
    netAddMail(){
        var effect_tmp = this.state.ml_sub;
        if(effect_tmp == 'hidden'){ effect_tmp='visible'; }
        else{ effect_tmp='hidden'; }
        this.setState({ml_sub: effect_tmp});
    }
    // 변경 전 메일 목록
    handleBeforeBuf(_mail){
        var list_tmp = this.state.before_mail_list;
        var check = 0;
        for(var i = 0;i<list_tmp.length; i++){
            if(list_tmp[i] == _mail){
                check = 1;
                break;
            }
        }

        if(check == 1){
            list_tmp = list_tmp.filter(per => per != _mail);
        }
        else{
            list_tmp.push(_mail);
        }
        this.setState({before_mail_list: list_tmp});
    }
    // 변경 후 메일 목록
    handleAfterBuf(_mail){
        var list_tmp = this.state.after_mail_list;
        var check = 0;
        for(var i = 0;i<list_tmp.length; i++){
            if(list_tmp[i] == _mail){
                check = 1;
                break;
            }
        }

        if(check == 1){
            list_tmp = list_tmp.filter(per => per != _mail);
        }
        else{
            list_tmp.push(_mail);
        }
        this.setState({after_mail_list: list_tmp});
    }
    // 현재 네트워크에 메일 추가
    addNetMailList(){
        var list_tmp = this.state.total_mail_list;
        var before_mail_tmp = this.state.before_mail_list;

        for(var i = 0; i<before_mail_tmp.length; i++){
            for(var j = 0; j<list_tmp.length; j++){
                if(list_tmp[j].mail == before_mail_tmp[i]){
                    list_tmp[j].network.push(this.props.network_name);
                }
            }
        }
        this.props.updateMail(list_tmp);
    }
    // 현재 네트워크에서 메일 삭제
    delNetMailList(){
        var list_tmp = this.state.total_mail_list;
        var after_mail_tmp = this.state.after_mail_list;

        for(var i = 0; i<after_mail_tmp.length; i++){
            for(var j = 0; j<list_tmp.length; j++){
                if(list_tmp[j].mail == after_mail_tmp[i]){
                    list_tmp[j].network = list_tmp[j].network.filter(net => net != this.props.network_name);
                }
            }
        }
        this.props.updateMail(list_tmp);
    }


    componentDidUpdate(){
        if(this.props.total_mail_list != this.state.total_mail_list){
            if(this.props.total_mail_list != null){
                console.log(this.props.total_mail_list);
                this.setState({total_mail_list: this.props.total_mail_list});
            }
        }
    }
    

    render(){
        var sub = '';
        if(this.state.check == 0){ sub = <div id="check_pwd">
                                            <p>비밀번호를 입력해주세요.</p>
                                            <input id="input_pwd" type="password" onChange={this.handleUserInputPwd}/><br/>
                                            <button id="check" onClick={this.checkPwd}>확 인</button>
                                        </div>;}
        else if(this.state.check == 1){ sub = <div id="show_network_key">
                                            <p id="snk_1">현재 네트워크 {this.props.network_name}의 키는</p>
                                            <div>{this.props.encrypt_key}</div>
                                            <p>입니다.</p>
                                        </div>;}

        var list_tmp = this.state.total_mail_list;
        var net_mail_list = [];
        var to_mail_list = [];
        var net_mail_list2 = [];
        var i = 0;
        if(this.state.m_sub == 'visible'){
            while(list_tmp[i]){
                var net_tmp = list_tmp[i].network;
                var toname_tmp = list_tmp[i].toname;
                var mail_tmp = list_tmp[i].mail;

                if(net_tmp.includes(this.props.network_name)){
                    net_mail_list.push(
                        <div id="t_mail" style={{visibility:this.state.m_sub}}>
                            <p>{toname_tmp}</p> <br/> {mail_tmp}
                        </div>
                    );
                }
                i++;
            }
        }
        
        if(this.state.ml_sub == 'visible'){
            i = 0;
            while(list_tmp[i]){
                var toname_tmp = list_tmp[i].toname;
                var mail_tmp = list_tmp[i].mail;

                to_mail_list.push(
                    <div id="add_mail_list">
                        <ul>
                            <li id="chbox"> <input type="checkbox" toname={toname_tmp} mail={mail_tmp} onClick={function(e){this.handleBeforeBuf(e.target.getAttribute('mail'));}.bind(this)}/> </li>
                            <li id="na_text"> <p id="na_text_1">{toname_tmp}</p> <br/> {mail_tmp} </li>
                        </ul>
                    </div>
                );
                i++;
            }

            i = 0;
            while(list_tmp[i]){
                var net_tmp = list_tmp[i].network;
                var toname_tmp = list_tmp[i].toname;
                var mail_tmp = list_tmp[i].mail;

                if(net_tmp.includes(this.props.network_name)){
                    net_mail_list2.push(
                        <div id="add_mail_list">
                            <ul>
                                <li id="chbox"> <input type="checkbox" toname={toname_tmp} mail={mail_tmp} onClick={function(e){this.handleAfterBuf(e.target.getAttribute('mail'));}.bind(this)}/> </li>
                                <li id="na_text"> <p id="na_text_1">{toname_tmp}</p> <br/> {mail_tmp} </li>
                            </ul>
                        </div>
                    );
                }
                i++;
            }
        }


        return(
            <div className="manage">
                <div className="k_subcontent" style={{visibility:this.state.show_key}}>
                    <div id="key_show">
                        <button id="x_btn" onClick={() => this.showKeyToOther('close')}>X</button>
                        {sub}
                    </div>
                </div>

                <div className="m_subcontent" style={{visibility:this.state.m_sub}}>
                    <div id="net_mail">
                        <button id="x_btn" onClick={this.showMail}>X</button>
                        <p id="mail_title">{this.props.network_name} 메일 목록</p>
                        <div id="show_net_mail_list">
                            {net_mail_list}
                        </div>
                        <button id="add_net_mail" onClick={this.netAddMail}>메일 추가</button>
                    </div>
                </div>

                <div className="ml_subcontent" style={{visibility:this.state.ml_sub}}>
                    <div id="net_add_mail">
                        <button id="x_btn" onClick={this.netAddMail}>X</button>
                        <p id="net_add_text">메일 추가하기</p>

                        
                        <div id="list_title_l">전체 메일 목록</div>
                        <div id="list_title_r">네트워크 메일 목록</div>

                        <div id="clear"></div>

                        <div id="m_list">
                            {to_mail_list}
                        </div>

                        <div id="mail_move">
                            <button onClick={this.addNetMailList}>추가</button>
                            <button onClick={this.delNetMailList}>삭제</button>
                        </div>

                        <div id="m_list">
                            {net_mail_list2}
                        </div>
                    </div>
                </div>


                <div className="manage_left">
                    <div id="nav_top">
                        <button id="end" onClick={function(e){
                            e.preventDefault();
                            this.props.onSubmit(1);
                        }.bind(this)}><img src={Back}/></button>
                        <img id="file_logo" src={Logo}/>
                    </div>

                    <div id="nav_middle">
                        <div id="nw_info">
                            <p>network : {this.props.network_name}</p>
                            <p>peerid : <span id="nw_text">{this.props.PeerId}</span> </p>
                        </div>
                    </div>

                    <div id="nav_menu_1">
                        <button id="btn_menu" onClick={function(e){
                            e.preventDefault();
                            this.changeContent(1);
                        }.bind(this)}>전체 파일</button>
                        <button id="btn_menu" onClick={function(e){
                            e.preventDefault();
                            this.changeContent(2);
                        }.bind(this)}>즐겨찾기</button>
                        <button id="btn_menu" onClick={function(e){
                            e.preventDefault();
                            this.changeContent(3);
                        }.bind(this)}>내가 올린 파일</button>
                    </div>
                    <div id="nav_menu_2">
                        <button id="btn_menu" onClick={() => this.showKeyToOther('open')}>네트워크 키 배포</button>
                        <button id="btn_menu" onClick={this.showMail}>네트워크 메일 목록</button>
                    </div>
                </div>
                
                <div className="manage_right">
                    <Files
                        side_menu={this.state.side_menu}
                        IPFS={this.props.IPFS}
                        UserName={this.props.UserName}
                        network_name={this.props.network_name} 
                        encrypt_key={this.props.encrypt_key}
                        network_files={this.props.network_files}
                        changeStar={this.props.changeStar}
                        saveFile={this.props.saveFile}
                        mailList={this.state.total_mail_list}
                    ></Files>
                </div>
            </div>
        );
    }
}

export default Page;
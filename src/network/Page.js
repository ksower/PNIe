/*global chrome*/
import {Component} from 'react';
import './PageStyle.css';
import Logo from '../image/logo.png';
import Profile from '../image/default_profile.png';
import Option from '../image/option_button.png';

class Page extends Component{
    constructor(props){
        super(props);
        this.state = {
            network_list: [],
            effect_list: [],
            total_mail_list: [],
            mail_visible: 'hidden',
            mail_add_visible: 'hidden',
            toname: '',
            mail: '',
            sub_kind: '생성',
            sub_visible: 'hidden',
            name: '',
            key: '',
            search: ''
        };
        this.getStorage = this.getStorage.bind(this);                       // IPFS 실행 시 초기 데이터(네트워크 목록)을 storage에서 가져옴
        this.handleMail = this.handleMail.bind(this);                       // 메일창에 대한 핸들러(visibility)
        this.handleAddMail = this.handleAddMail.bind(this);                 // 메일 추가 창에 대한 핸들러(visibility)
        this.onChangeToname = this.onChangeToname.bind(this);               // 메일 추가 창의 입력값 가져오기(메일 주인)
        this.onChangeMail = this.onChangeMail.bind(this);                   // 메일 추가 창의 입력값 가져오기(메일)
        this.addMailToList = this.addMailToList.bind(this);                 // 메일창에서 추가 버튼 클릭 시 실행되는 함수(메일목록에 새 메일을 추가함)
        this.delMailFromList = this.delMailFromList.bind(this);             // 메일 목록에서 해당 메일을 삭제하는 함수
        this.handleSub = this.handleSub.bind(this);                         // sub창(네트워크 추가.생성)이 사용하는 state 값 변경
        this.onChangeNetworkName = this.onChangeNetworkName.bind(this);     // sub창의 입력값 가져오기(네트워크 이름)
        this.onChangeNetworkKey = this.onChangeNetworkKey.bind(this);       // sub창의 입력값 가져오기(암호화 키)
        this.getRandomKey = this.getRandomKey.bind(this);                   // 키 랜덤 생성
        this.onChangeSearchString = this.onChangeSearchString.bind(this);   // 검색칸의 입력값 읽기
        this.clearSearchText = this.clearSearchText.bind(this);             // 검색칸 초기화
        this.addNetworkToList = this.addNetworkToList.bind(this);           // sub창에서 추가(생성) 버튼 클릭 시 실행되는 함수
        this.handleStorageNetwork = this.handleStorageNetwork.bind(this);   // 네트워크 목록을 업데이트[새로운 네트워크 추가(생성)될 시]
        this.removeNetwork = this.removeNetwork.bind(this);                 // 네트워크 삭제하기(update도)
        this.clearAllNetwork = this.clearAllNetwork.bind(this);             // 전체 네트워크 지우기
        this.showNetworkMenu = this.showNetworkMenu.bind(this);             // 네트워크 버튼 별 메뉴의 visible 변경
        this.giveParam = this.giveParam.bind(this);                         // 네트워크 버튼에 대한 인덱스 처리(html에서의 기밀성을 위함)
    }

    // IPFS 실행 시 초기 데이터(네트워크 목록)을 storage에서 가져옴
    getStorage(){
        var list_tmp = [];
        var effect_tmp = [];

        chrome.storage.sync.get(["NetworkList"], function(result){
            list_tmp = result.NetworkList;
        });

        setTimeout(function(){
            var i = 0;
            while(list_tmp[i]){ 
                effect_tmp.push({name:list_tmp[i].name, effect:'hidden'});
                i++; 
            }

            this.setState({
                network_list: list_tmp,
                effect_list: effect_tmp
            });
        }.bind(this), 300);
    }

    // 메일창과 메일 추가창에 대한 핸들러(visibility)
    handleMail(){
        var effect_tmp = this.state.mail_visible;
        if(effect_tmp == 'hidden'){ effect_tmp='visible'; }
        else{ effect_tmp='hidden'; }
        this.setState({mail_visible: effect_tmp});
    }
    handleAddMail(){
        var effect_tmp = this.state.mail_add_visible;
        if(effect_tmp == 'hidden'){ effect_tmp='visible'; }
        else{ effect_tmp='hidden'; }
        this.setState({mail_add_visible: effect_tmp});
    }

    // 메일 추가 창의 입력값들 가져오기
    onChangeToname(e){ this.setState({toname: e.target.value}); }
    onChangeMail(e){ this.setState({mail: e.target.value}); }

    // 메일창에서 추가 버튼 클릭 시 실행되는 함수(메일목록에 새 메일을 추가함)
    addMailToList(){
        var list_tmp = this.state.total_mail_list;
        var index = 0;
        var toname_tmp = this.state.toname;
        var mail_tmp = this.state.mail;

        if(list_tmp == null || list_tmp.length == 0){ list_tmp=[]; index=0;}
        else{
            var i = 0;
            while(list_tmp[i]){i++;}
            index = list_tmp[i-1].index;
        }

        list_tmp.push({index:index+1, toname:toname_tmp, mail:mail_tmp, network:[]});
        this.props.updateMail(list_tmp);

        this.handleAddMail();
        this.setState({
            toname: '',
            mail: ''
        });
        document.getElementById("toname_text").value = '';
        document.getElementById("mail_text").value = '';
    }
    // 메일 목록에서 해당 메일을 삭제하는 함수
    delMailFromList(_mail){
        var list_tmp = this.state.total_mail_list;

        list_tmp = list_tmp.filter(function(item){
            return item.mail != _mail;
        });

        this.props.updateMail(list_tmp);
    }

    // sub창(네트워크 추가.생성)이 사용하는 state 값 변경
    // input : _kind    [sub창 종류: 추가인지 생성인지를 받음]
    handleSub(_kind){
        if(_kind == '추가' || _kind == '생성'){
            this.setState({
                sub_kind: _kind,
                sub_visible: 'visible'
            });
        }
        else{
            this.setState({
                sub_visible: 'hidden',
                name: '',
                key: ''
            });
            document.getElementById("name_text").value = '';
            document.getElementById("key_text").value = '';
        }
    }

    // sub창의 입력값들 가져오기
    onChangeNetworkName(e){ this.setState({name: e.target.value}); }
    onChangeNetworkKey(e){ this.setState({key: e.target.value}); }
    // 키 랜덤 생성
    getRandomKey(){
        const CryptoJS = require('crypto-js');
        var salt = CryptoJS.lib.WordArray.random(10).words[0].toString();
        var hash = CryptoJS.AES.encrypt(salt, this.props.PeerId).toString();
        document.getElementById("key_text").value = hash
        this.setState({key: hash});
    }
    // 검색칸의 입력값 읽기와 초기화
    onChangeSearchString(e){ this.setState({search: e.target.value}); }
    clearSearchText(){
        document.getElementById("search_text").value = '';
        this.setState({search: ''});
    }

    // sub창에서 추가(생성) 버튼 클릭 시 실행되는 함수
    addNetworkToList(){
        this.handleStorageNetwork();
        setTimeout(function(){
            this.setState({
                sub_visible: 'hidden',
                name: '',
                key: ''
            });
            document.getElementById("name_text").value = '';
            document.getElementById("key_text").value = '';
        }.bind(this), 300);
    }
    // 네트워크 목록을 업데이트(새로운 네트워크 추가될 시)
    handleStorageNetwork(){
        var index = 0;
        var list_tmp = this.state.network_list;
        var effect_tmp = this.state.effect_list;

        if(list_tmp == null || list_tmp.length == 0){ list_tmp=[]; index=0;}
        else{
            var i = 0;
            while(list_tmp[i]){i++;}
            index = list_tmp[i-1].index;
        }

        var save_key = this.state.key;

        list_tmp.push({ index:index+1, name:this.state.name, key:save_key });
        effect_tmp.push({name:this.state.name, effect:'hidden'});
        
        chrome.storage.sync.set({"NetworkList":list_tmp}, function(){});

        chrome.storage.sync.get(["NetworkList"], function(result) {
            list_tmp = result.NetworkList;
        });

        setTimeout(function(){
            this.setState({
                network_list: list_tmp,
                effect_list: effect_tmp
            });
        }.bind(this), 300);
    }
    // 네트워크 삭제하기(update도)
    removeNetwork(e){
        var confirm_window = window.confirm('정말 삭제하시겠습니까?\n[암호화 키 복구는 힘들 수 있습니다]');
        if(confirm_window == true){
            var list_tmp = this.state.network_list;
            var effect_tmp = this.state.effect_list;
            var name_tmp = e.target.getAttribute('name');

            list_tmp = list_tmp.filter(function(item){
                return item.name != name_tmp;
            });
            effect_tmp = effect_tmp.filter(function(item){
                return item.name != name_tmp;
            })

            chrome.storage.sync.set({"NetworkList":list_tmp}, function() {
                console.log("update network list");
            });

            setTimeout(function(){
                this.setState({
                    network_list: list_tmp,
                    effect_list: effect_tmp
                });
            }.bind(this), 300);
        }
    }
    // 전체 네트워크 지우기
    clearAllNetwork(){
        var list_tmp = this.state.network_list;

        chrome.storage.sync.set({"NetworkList":null}, function() {
            console.log("update network list");
        });
        chrome.storage.sync.get(["NetworkList"], function(result) {
            console.log("get network list after update");
            list_tmp = result.NetworkList;
        });

        setTimeout(function(){
            this.setState({network_list: list_tmp});
        }.bind(this), 500);
    }
    // 네트워크 버튼 별 메뉴의 visible 변경
    showNetworkMenu(_name){
        var effect_tmp = this.state.effect_list;
        var i = 0;

        while(effect_tmp[i]){
            if(effect_tmp[i].name == _name){
                if(effect_tmp[i].effect == 'hidden'){ effect_tmp[i].effect='visible'; }
                else{ effect_tmp[i].effect='hidden' }
            }
            else{ effect_tmp[i].effect='hidden' }
            i++;
        }

        this.setState({effect_list: effect_tmp});
        console.log(_name, this.state.effect_list);
    }
    // 네트워크 버튼에 대한 인덱스 처리(html에서의 기밀성을 위함)
    giveParam(_index){
        var list_tmp = this.state.network_list;
        this.props.onSubmit(2, list_tmp[_index].name, list_tmp[_index].key);
    }


    async componentWillMount(){
        this.getStorage();
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
        var network_list = [];
        var list_tmp = this.state.network_list;
        var effect_tmp = this.state.effect_list;
        var i = 0;
        if(list_tmp != null){
            while(list_tmp[i]){
                var index_tmp = list_tmp[i].index;
                var name_tmp = list_tmp[i].name;
                var key_tmp = list_tmp[i].key;
                var visible = effect_tmp[i].effect;
                var search_tmp = this.state.search;

                if(search_tmp != ''){
                    var part = name_tmp.indexOf(search_tmp);
                    if(part == -1){
                        i++;
                        continue;
                    }
                }

                network_list.push(
                    // 리스트 컴포넌트에 key가 속성 예약어로 되어있어, encryption key는 do로 속성부여.
                    <div id="net" key={index_tmp}>
                        <button id="sel_net" index={i} onClick={function(e){
                            this.giveParam(e.target.getAttribute('index'));
                        }.bind(this)}>
                            <p id="net_t1">{index_tmp}</p>
                            <p id="net_t2">{name_tmp}</p>
                        </button>
                        <button id="sel_net_opt" name={name_tmp} onClick={function(e){
                            this.showNetworkMenu(e.target.getAttribute('name'));
                        }.bind(this)}> <img src={Option} name={name_tmp}/> </button>
                        <button id="sel_net_del" style={{visibility:visible}} name={name_tmp} onClick={this.removeNetwork}>삭제하기</button>
                    </div>
                );
                i++;
            }
        }

        var mail_list = [];
        list_tmp = this.state.total_mail_list;
        i = 0;
        if(list_tmp != null && this.state.mail_visible == 'visible'){
            while(list_tmp[i]){
                var index_tmp = list_tmp[i].index;
                var toname_tmp = list_tmp[i].toname;
                var mail_tmp = list_tmp[i].mail;

                mail_list.push(
                    <div id="mail" style={{visibility:this.state.mail_visible}}>
                        <ul>
                            <li id="mail_t1"> <p>{toname_tmp}</p> <br/> {mail_tmp}</li>
                            <li id="mail_btn1"><button id="mail_remove" mail={mail_tmp} onClick={function(e){this.delMailFromList(e.target.getAttribute("mail"));}.bind(this)}>삭제</button></li>
                        </ul>
                    </div>
                )
                i++;
            }
        }

        var random_create = ''
        if(this.state.sub_kind == '생성'){
            random_create = <button id="random" onClick={this.getRandomKey}>키 랜덤 생성</button>;
        }
        else{
            random_create = '';
        }


        return(
            <div className="network">
                <div id="subcontent_net" style={{visibility: this.state.sub_visible}}>
                    <div id="subcontent_net-1">
                        <button id="x_btn" onClick={function(e){
                            this.handleSub('no');
                        }.bind(this)}>X</button>
                        <div id="subcontent_net-2">
                            <p>네트워크 {this.state.sub_kind}하기</p>
                            &nbsp;&nbsp;&nbsp;&nbsp;이 름 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="name_text" type="text" onChange={this.onChangeNetworkName}/><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;암호화 키 : <input id="key_text" type="text" onChange={this.onChangeNetworkKey}/><br/>
                            {random_create}
                            <button id="end" onClick={this.addNetworkToList}>{this.state.sub_kind}</button>
                        </div>
                    </div>
                </div>

                <div id="subcontent_mail" style={{visibility: this.state.mail_visible}}>
                    <div id="subcontent_mail-1">
                        <button id="x_btn" onClick={this.handleMail}>X</button>
                        <p id="p_title">메일 목록</p>
                        <div id="show_mail_list">
                            {mail_list}
                        </div>
                        <button id="new_mail" onClick={this.handleAddMail}>메일 추가</button>
                    </div>
                </div>

                <div id="subcontent_mail_add" style={{visibility: this.state.mail_add_visible}}>
                    <div id="subcontent_mail_add-1">
                        <button id="x_btn" onClick={this.handleAddMail}>X</button>
                        <div id="subcontent_mail_add-2">
                            <p>메일 추가하기</p>
                            &nbsp;&nbsp;&nbsp;&nbsp;이 름 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="toname_text" type="text" onChange={this.onChangeToname}/><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;이메일 : &nbsp;&nbsp;&nbsp;<input id="mail_text" type="text" onChange={this.onChangeMail}/><br/>
                            <button onClick={this.addMailToList}>추 가</button>
                        </div>
                    </div>
                </div>


                <div className="network_left">
                    <div id="logo">
                        <div> <img src={Logo}/> </div>
                    </div>

                    <div id="info">
                        <ul>
                            <li id="info_li_1"> <button id="profile"> <img src={Profile}/> </button> </li>
                            <li id="info_li_2">
                                <p>name : <span id="info_text">{this.props.UserName}</span> </p>
                                <p>peerid : <span id="info_text">{this.props.PeerId}</span> </p>
                            </li>
                        </ul>
                    </div>

                    <div id="btns">
                        <button id="btn_main" className="bm_lo" onClick={function(e){this.props.onSubmit(2, 'public', '');}.bind(this)}>public network</button><br/><br/>
                        <button id="btn_main" className="bm_sh1" onClick={function(e){
                            this.handleSub("추가");
                        }.bind(this)}>add</button>
                        <button id="btn_main" className="bm_sh2" onClick={function(e){
                            this.handleSub("생성");
                        }.bind(this)}>create</button><br/><br/>
                        <button id="btn_main" className="bm_lo" onClick={this.handleMail}>mail list</button><br/>
                        <a id="help">도움말</a>
                    </div>
                </div>

                <div className="network_right">
                    <div id="search">
                        <input id="search_text" type="text" placeholder="Search..." onChange={this.onChangeSearchString}/>
                        <div id="clr_search">
                            <button onClick={this.clearSearchText}>X</button>
                        </div>
                        <button id="btn_net_clr" onClick={this.clearAllNetwork}>clear storage</button>
                    </div>
                    <br/><br/>
                    <div id="nets">
                        {network_list}
                    </div>
                </div>
            </div>
        );
    }
}

export default Page;
/*global chrome*/
import {Component} from 'react';
import './TitleStyle.css';
import TitleBack from'./image/title_background.png';
import Logo from './image/logo.png';

var saved_passwd = null;
var title_margin = "-0%";
var login_margin = "100%";
class Title extends Component{
    constructor(props){
        super(props);
        this.state = {
            user_name: null,
            user_passwd: null,
            title_page_opacity: 1,
            start_btn_visible: 'visible',
            welcome_page_visible: 'hidden',
            wel_p_effect: [
                {opacity:1, delay:'0s', zindex:102},
                {opacity:0, delay:'0.5s', zindex:101},
                {opacity:0, delay:'0.5s', zindex:101},
                {opacity:0, delay:'0.5s', zindex:101}
            ],
            login_effect: {width:"1em", padding:"0.6em", margin_left:"-1em", delay:"1s"},
            login_btn_opacity: 0
        };
        
        this.getStarted = this.getStarted.bind(this);                   // 프로그램의 시작(다음 페이지가 login page인지 welcome page인지를 판단)
        this.changeWelcomePage = this.changeWelcomePage.bind(this);     // welcome page에서의 페이지 전환(총4개 페이지 존재)
        this.handleNameInput = this.handleNameInput.bind(this);         // 사용자가 입력하는 이름 값
        this.handlePwdInput = this.handlePwdInput.bind(this);           // 사용자가 입력하는 패스워드 값(생성, 확인 모두 사용)
        this.saveName = this.saveName.bind(this);                       // 초기 이름 저장(처음 설치 시 한 번만 실행)
        this.savePasswd = this.savePasswd.bind(this);                   // 초기 패스워드 저장(처음 설치 시 한 번만 실행)
        this.checkPassword = this.checkPassword.bind(this);             // 패스워드 확인 및 프로그램 들어가기

        this.clearpass = this.clearpass.bind(this);
    }

    // 프로그램의 시작(다음 페이지가 login page인지 welcome page인지를 판단)
    getStarted(){
        if(saved_passwd == null){
            this.setState({
                title_page_opacity: 0,
                welcome_page_visible: 'visible'
            });
            setTimeout(function(){
                this.setState({start_btn_visible:'hidden'});
            }.bind(this), 300);
        }
        else{
            var eff_tmp = Array.from(this.state.wel_p_effect);
            var i = 0;
            while(i < eff_tmp.length){
                eff_tmp[i].opacity = 0;
                eff_tmp[i].zindex = 101;
                eff_tmp[i].delay = '0s';
                i++;
            }

            this.setState({ 
                title_page_opacity: 0,
                welcome_page_visible: 'hidden',
                wel_p_effect: eff_tmp,
                login_effect: {width:"16em", padding:"0.6em 1.5em", margin_left:"-9.5em", delay:"1s"},
                login_btn_opacity: 1
            });
            login_margin = "0%";
            setTimeout(function(){
                this.setState({start_btn_visible:'hidden'});
            }.bind(this), 300);
        }
    }
    // welcome page에서의 페이지 전환(총4개 페이지 존재)
    changeWelcomePage(_page){
        var eff_tmp = Array.from(this.state.wel_p_effect);
        var i = 0;
 
        while(i < eff_tmp.length){
            if(i == _page){ eff_tmp[i].opacity = 1; eff_tmp[i].zindex = 102; }
            else{ eff_tmp[i].opacity = 0; eff_tmp[i].zindex = 101;}

            if(i == _page - 1){ eff_tmp[i].delay = '0s'; }
            else{ eff_tmp[i].delay = '0.5s'; }
            i++;
        }
        
        this.setState({wel_p_effect: eff_tmp});        
    }

    // 사용자가 입력하는 이름 값
    handleNameInput(e){
        this.setState({user_name: e.target.value});
    }
    // 사용자가 입력하는 패스워드 값(생성, 확인 모두 사용)
    handlePwdInput(e){
        this.setState({user_passwd: e.target.value});
    }

    // 초기 이름 저장(처음 설치 시 한 번만 실행)
    saveName(){
        var name = this.state.user_name;
        chrome.storage.sync.set({"User":name}, function(){
            console.log("save name");
        });
        this.changeWelcomePage(2);
    }
    // 초기 패스워드 저장(처음 설치 시 한 번만 실행)
    savePasswd(){
        const SHA = require('crypto-js/sha256');
        var pwd = this.state.user_passwd;

        if(pwd.length < 8){
            alert("비밀번호는 8글자 이상으로 지정해야 합니다.");
        }
        else{
            chrome.storage.sync.set({"Password":SHA(pwd).toString()}, function() {
                console.log("save pwd");
            });
            chrome.storage.sync.get(["Password"], function(result){
                console.log("get pwd");
                saved_passwd = result.Password;
                console.log(saved_passwd);
            })
            this.changeWelcomePage(3);
        }
    }

    // 패스워드 확인 및 프로그램 들어가기
    checkPassword(){
        const SHA = require('crypto-js/sha256');
        var user = this.state.user_passwd;

        if(SHA(user).toString() == saved_passwd){
            title_margin = "-200%";
            login_margin = "-200%";
            this.props.startIPFS();
            this.props.getName();
        }
        else{
            alert("비밀번호가 일치하지 않습니다.");
        }
    }

    componentWillMount(){
        chrome.storage.sync.get(["Password"], function(result) {
            console.log("get pwd");
            saved_passwd = result.Password;
            console.log(saved_passwd);
        });
    }

    render(){
        // ti_p_style: title page style  |  wel_p_style: welcome page style  |  log_p_style: login page style
        const ti_p_style = {
            opacity: this.state.title_page_opacity,
            marginTop: title_margin
        }
        const wel_p_style = [
            {opacity: this.state.wel_p_effect[0].opacity, transitionDelay: this.state.wel_p_effect[0].delay, zIndex:this.state.wel_p_effect[0].zindex},
            {opacity: this.state.wel_p_effect[1].opacity, transitionDelay: this.state.wel_p_effect[1].delay, zIndex:this.state.wel_p_effect[1].zindex},
            {opacity: this.state.wel_p_effect[2].opacity, transitionDelay: this.state.wel_p_effect[2].delay, zIndex:this.state.wel_p_effect[2].zindex},
            {opacity: this.state.wel_p_effect[3].opacity, transitionDelay: this.state.wel_p_effect[3].delay, zIndex:this.state.wel_p_effect[3].zindex}
        ];
        const log_p_style = {
            width: this.state.login_effect.width,
            padding: this.state.login_effect.padding,
            marginLeft: this.state.login_effect.margin_left,
            transitionDelay: this.state.login_effect.delay
        };

        return(
            <div className="title" style={{marginTop:title_margin}}>
                <img id="back_img" src={TitleBack}/>

                <div id="title_page" style={ti_p_style}>
                    <img id="logo_img" src={Logo}/>
                    <button id="title_start_btn" style={{visibility:this.state.start_btn_visible}} onClick={this.getStarted}>Next</button>
                </div>


                <div id="welcome_page" style={{visibility:this.state.welcome_page_visible}}>
                    <div id="wel_p" style={wel_p_style[0]}>
                        <p id="wel_logo">logo</p>
                        <p id="p1">logo를 사용해주셔서 감사합니다.</p>
                        <p id="p1">logo를 통해 기존의 IPFS를 편리하게 사용할 수 있습니다.</p>
                        <p id="p1">또한 개별적인 네트워크를 구성하여 부서, 그룹 간에 보안적으로 파일을 주고 받을 수 있습니다.</p>
                        <button id="first_btn" onClick={() => this.changeWelcomePage(1)}>다음</button>
                    </div>
                    <div id="wel_p" style={wel_p_style[1]}>
                        <p id="wel_logo">logo</p>
                        <p id="p2">사용할 이름을 작성해주세요.</p>
                        <input id="name_input" type="text" onChange={this.handleNameInput}/>
                        <button id="name_btn" onClick={this.saveName}>다음</button>
                    </div>
                    <div id="wel_p" style={wel_p_style[2]}>
                        <p id="wel_logo">logo</p>
                        <p id="p1">프로그램 사용을 위해서는 비밀번호를 통해 로그인을 해야 합니다.</p>
                        <p id="p3">사용할 비밀번호를 작성해주세요.(8글자 이상)</p>
                        <input id="pwd_input" type="text" onChange={this.handlePwdInput}/>
                        <button id="pwd_btn" onClick={this.savePasswd}>다음</button>
                    </div>
                    <div id="wel_p" style={wel_p_style[3]}>
                        <p id="wel_last">이제 logo를 시작합니다!</p>
                        <button id="start" onClick={this.getStarted}>시작하기</button>
                    </div>
                </div>

                <div id="login_page" style={{marginTop:login_margin}}>
                    <p>PASSWORD</p>
                    <input id="g_pwd_input" style={log_p_style} type="password" onChange={this.handlePwdInput}/>
                    <button id="g_pwd_btn" style={{opacity:this.state.login_btn_opacity}} onClick={this.checkPassword}>확인</button>
                    {/* <button onClick={this.clearpass}>비밀번호 지우기</button> */}
                </div>
            </div>
        );
    }
}

export default Title;
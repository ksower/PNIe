/*global chrome*/
import {Component} from 'react';
import './FileStyle.css';
import Uncheck from '../../image/uncheck_star.png';
import Check from '../../image/check_star.png';
import Download from '../../image/download_button.png';

class Files extends Component{
    constructor(props){
        super(props);
        this.state = {
            side_menu: 1,
            content_style: [
                {top_height:'12em', bottom_height:'22em'},
                {top_height:'12em', bottom_height:'22em'},
                {top_height:'12em', bottom_height:'22em'}
            ],
            files: [],
            set_file: [],
            hash: '',
            search: '',
            enroll_visible: 'hidden',
            file_name: '',
            file_hash: ''
        }
        this.addFileToIPFS = this.addFileToIPFS.bind(this);                 // IPFS network에 파일 업로드
        this.sendUpdateNoteEmail = this.sendUpdateNoteEmail.bind(this);     // 업로드한 파일에 대한 해쉬 코드를 네트워크의 메일 목록의 메일들에 전달
        this.downFileFromIPFS = this.downFileFromIPFS.bind(this);           // IPFS network로부터 파일 다운로드
        this.enrollContent = this.enrollContent.bind(this);                 // IPFS network에 업로드 되어 있는 파일을 목록에 추가
        this.onChangeFilename = this.onChangeFilename.bind(this);           // 업로드한 파일의 이름 정보 업데이트
        this.onChangeFilehash = this.onChangeFilehash.bind(this);           // 업로드한 파일의 해쉬 코드 정보 업데이트
        this.enrollFileInNetwork = this.enrollFileInNetwork.bind(this);     // 업로드한 파일의 정보를 상위 모듈에 전달
        this.onChangeSearchString = this.onChangeSearchString.bind(this);   // 파일 목록에 대한 검색칸의 입력값
        this.clearSearchText = this.clearSearchText.bind(this);             // 검색칸 초기화
    }

    // IPFS network에 파일을 업로드
    async addFileToIPFS () {
        if(this.state.set_file.length == 0){
            alert('업로드 할 파일을 선택해주세요.');
        }
        else{
            var CryptoJS = require('crypto-js');
            var fileReader = new FileReader();
            fileReader.onload = async () => {
                var reda = fileReader.result;
                var chip = CryptoJS.AES.encrypt(reda, this.props.encrypt_key).toString();

                const upload_file = await this.props.IPFS.add(chip);

                this.setState({hash: upload_file.path});
                this.props.saveFile(this.state.set_file.name, this.state.hash);
            };
            fileReader.readAsText(this.state.set_file);

            var mail_list = this.props.mail_list;
            var i = 0;
            while(mail_list[i]){
                if(mail_list[i].network.includes(this.props.network_name)){
                    this.sendUpdateNoteEmail(mail_list[i].toname, mail_list[i].mail);
                }
            }
        }
    }

    // 업로드한 파일에 대한 해쉬 코드를 네트워크의 메일 목록의 메일들에 전달
    sendUpdateNoteEmail(_toname, _email){
        const emailjs = require("emailjs-com");
        emailjs.init("user_33Pym9FUOC7jKCuV5TkmA");
        emailjs.send("service_acwfxvm", "template_cp5q8rf", {
            email:_email,
            to_name:_toname,
            from_name:this.props.UserName,
            network:this.props.network_name,
            filename:this.state.set_file.name,
            hash:this.state.hash
        });
    }

    //IPFS network에서 파일을 다운로드
    async downFileFromIPFS(_filename, _hash){
        var CryptoJS = require('crypto-js');
        for await (const file of this.props.IPFS.get(_hash)){
            if(!file.content) continue;
            const content = ''

            for await (const chunk of file.content){
                content += chunk.toString();
            }

            var bytes  = CryptoJS.AES.decrypt(content, this.props.encrypt_key);
            const original = bytes.toString(CryptoJS.enc.Utf8);

            console.log(content, original);
            // file download [a태그를 만들어서 다운내용을 입력하여 클릭하고 생성한 태그를 삭제하는 방식]
            console.log("down start");
            var a = document.createElement('a');
            var blob = new Blob([ original ], {type : "text/plain"});
            a.href = window.URL.createObjectURL(blob);
            a.download = _filename;
            a.click();
            a.remove();
            window.URL.revokeObjectURL(a);
            console.log("down end");
        }
    }

    // IPFS network에 업로드 되어 있는 파일을 목록에 추가
    enrollContent(_visibility){
        this.setState({enroll_visible: _visibility});
    }
    // 업로드한 파일의 이름, 해쉬 코드를 업데이트
    onChangeFilename(e){ this.setState({file_name: e.target.value}); }
    onChangeFilehash(e){ this.setState({file_hash: e.target.value}); }
    // 업로드한 파일의 정보를 상위 모듈에 전달
    enrollFileInNetwork(){
        this.props.saveFile(this.state.file_name, this.state.file_hash);
        document.getElementById("name_text").value = '';
        document.getElementById("key_text").value = '';
        this.enrollContent('hidden');
    }

    // 파일 목록에 대한 검색칸의 입력값
    onChangeSearchString(e){
        this.setState({search: e.target.value});
    }
    // 검색칸 초기화
    clearSearchText(){
        document.getElementById("search_file").value = '';
        this.setState({search: ''});
    }

    componentDidUpdate(){
        if(this.props.network_files != this.state.files){
            if(this.props.network_files != null){
                this.setState({files: this.props.network_files});
            }
        }
        if(this.props.side_menu != this.state.side_menu){
            this.setState({side_menu: this.props.side_menu});
        }
    }


    render(){
        var files = this.state.files;
        var file_list = [];
        var search_tmp = this.state.search;
        var i = 0;
        if(files != null){
            while(files[i]){
                if(search_tmp != ''){
                    var part = files[i].filename.indexOf(search_tmp);
                    if(part == -1){
                        i++;
                        continue;
                    }
                }

                if(this.state.side_menu == 2){
                    if(files[i].star != 'check'){ i++; continue; }
                }
                else if(this.state.side_menu == 3){
                    if(files[i].owner != this.props.UserName){ i++; continue; }
                }

                var index_tmp = files[i].index;
                var filename_tmp = files[i].filename;
                var owner_tmp = files[i].owner;
                var hash_tmp = files[i].hash;
                var star = null;
                if(files[i].star == 'check'){ star = Check; }
                else{ star = Uncheck; }

                file_list.push(
                    <div id="sel_file" key={index_tmp}>
                        <ul id="sel_file_ul">
                            <li id="file-0"><button id="star" onClick={function(e){
                                console.log(e.target.getAttribute("hash"));
                                this.props.changeStar(e.target.getAttribute("hash")); 
                            }.bind(this)}> <img src={star} hash={hash_tmp}/> </button></li>
                            <li id="file-1">{filename_tmp}</li>
                            <li id="file-2">{owner_tmp}</li>
                            <li id="file-3">{hash_tmp}</li>
                            <li id="file-4"><button id="file_down_btn" onClick={function(e){
                                this.downFileFromIPFS(e.target.getAttribute("filename"), e.target.getAttribute("hash"));
                            }.bind(this)}> <img src={Download} filename={filename_tmp} hash={hash_tmp}/> </button></li>
                        </ul>
                    </div>
                );
                i++;
            }
        }

        return(
            <div className="files">
                <div className="subcontent_net" style={{visibility:this.state.enroll_visible}}>
                    <div id="subcontent_net-1">
                        <button id="x_btn" onClick={() => this.enrollContent('hidden')}>X</button>
                        <div id="subcontent_net-2">
                            <p>업로드 된 파일 등록</p>
                            &nbsp;&nbsp;&nbsp;&nbsp;파일 이름 : &nbsp;&nbsp;<input id="name_text" type="text" onChange={this.onChangeFilename}/><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;해쉬 코드 : &nbsp;&nbsp;<input id="key_text" type="text" onChange={this.onChangeFilehash}/><br/>
                            <button id="end" onClick={this.enrollFileInNetwork}>등록</button>
                        </div>
                    </div>
                </div>


                <div id="files_top" style={{height:this.state.content_style[this.state.side_menu-1].top_height}}>
                    <ul id="file_table">
                        <li>
                            <span id="filezone_text">새로운 파일 업로드 : </span>
                            <input id="f_btn1" type="button" value="파일 추가" onClick={this.addFileToIPFS}/>
                            &nbsp;&nbsp;&nbsp;
                            <input id="f_btn2" type='file' onChange={function(e){
                                var file = e.target.files;
                                e.preventDefault();
                                e.stopPropagation();
                                this.setState({
                                    set_file: file[0],
                                    filename: file[0].name
                                });
                                setTimeout(function(){
                                    console.log(this.state.set_file);
                                }.bind(this), 500);
                            }.bind(this)}/>
                        </li>
                        <br/>
                        <li>
                            <span id="filezone_text">업로드 된 파일 목록에 추가 : </span>
                            <input id="f_btn1" type="button" value="파일 목록에 추가" onClick={() => this.enrollContent('visible')}/>
                        </li>
                    </ul>
                </div>

                <input id="search_file" type="text" placeholder="Search..." onChange={this.onChangeSearchString}/>
                <div id="clr_search_btn">
                    <button onClick={this.clearSearchText}>X</button>
                </div>
                <br/><br/>

                <div id="files_bottom" style={{height:this.state.content_style[this.state.side_menu-1].bottom_height}}>
                    {file_list}
                </div>
            </div>
        );
    }
}

export default Files;
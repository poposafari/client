import Phaser from 'phaser';
import api from '../utils/api';

export class SignInScene extends Phaser.Scene {

  constructor() {
      super({ key: 'SignInScene' });
  }

  create() {
      // Phaser 3 DOMElement를 사용하여 HTML 폼을 Phaser 캔버스 중앙에 배치
      const loginFormHTML = `
          <div class="login-form">
              <h2>PoPoSeop</h2>
              <div class="input-group">
                  <label for="userId">아이디</label>
                  <input type="text" name="username" id="userId">
              </div>
              <div class="input-group">
                  <label for="password">비밀번호</label>
                  <input type="password" name="password" id="password">
              </div>
              <p id="error-msg"></p>
              <div class="buttons">
                  <button id="login-button" class="login-button">로그인</button>
              </div>
              <div class="link">
                <p><a href="#" id="find-id">아이디 찾기</a></p>
                <p>|</p>
                <p><a href="#" id="find-password">비밀번호 찾기</a></p>
                <p>|</p>
                <p><a href="#" id="register">회원가입</a></p>
              </div>
          </div>
      `;
      
      const loginFormElement = this.add.dom(this.cameras.main.centerX, this.cameras.main.centerY).createFromHTML(loginFormHTML);
    
      const loginButton = loginFormElement.getChildByID('login-button') as HTMLButtonElement;
      if (loginButton) {
          loginButton.addEventListener('click', this.handleLogin.bind(this));
      }

      const findIdLink = loginFormElement.getChildByID('find-id') as HTMLAnchorElement;
      if (findIdLink) {
          findIdLink.addEventListener('click', this.handleFindId.bind(this));
      }

      const findPasswordLink = loginFormElement.getChildByID('find-password') as HTMLAnchorElement;
      if (findPasswordLink) {
          findPasswordLink.addEventListener('click', this.handleFindPassword.bind(this));
      }

      const registerLink = loginFormElement.getChildByID('register') as HTMLAnchorElement;
      if (registerLink) {
          registerLink.addEventListener('click', this.handleRegister.bind(this));
      }
  }

  handleLogin(event: Event) {
    event.preventDefault();

    const username = (document.getElementById('userId') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const errorMsg = document.getElementById('error-msg') as HTMLInputElement;  

    if (!username || !password) {
      errorMsg.textContent = '아이디와 비밀번호를 입력해주세요.';
      return;
    }

    if (username.includes(' ') || password.includes(' ')) {
      errorMsg.textContent = '아이디와 비밀번호에는 공백을 포함할 수 없습니다.';
      return;
    }

    api.post('/account/login',{
      username:username,
      password:password
    })
    .then(res=>{
      console.log(res);
      if(!res.data.data){
        this.scene.start('ClosetScene');
      }
      else{
        //start! Season Scene
      }
    })
    .catch(error=>{
      console.log(error);
      if(error.response.status === 400){
        errorMsg.textContent = '아이디 또는 비밀번호가 일치하지 않습니다.';
      }
    })
  }

  handleFindId(event: Event) {
    event.preventDefault();
    console.log('move to find username');
  }

  handleFindPassword(event: Event) {
    event.preventDefault();
    console.log('move to find pw');
  }

  handleRegister(event: Event) {
    event.preventDefault();
    this.scene.start('SignUpScene');
  }
}

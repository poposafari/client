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

      // 로그인 버튼 이벤트 리스너 추가
      const loginButton = loginFormElement.getChildByID('login-button') as HTMLButtonElement;
      if (loginButton) {
          loginButton.addEventListener('click', this.handleLogin.bind(this));
      }

      // 아이디 찾기 링크 이벤트 리스너 추가
      const findIdLink = loginFormElement.getChildByID('find-id') as HTMLAnchorElement;
      if (findIdLink) {
          findIdLink.addEventListener('click', this.handleFindId.bind(this));
      }

      // 비밀번호 찾기 링크 이벤트 리스너 추가
      const findPasswordLink = loginFormElement.getChildByID('find-password') as HTMLAnchorElement;
      if (findPasswordLink) {
          findPasswordLink.addEventListener('click', this.handleFindPassword.bind(this));
      }

      // 회원가입 링크 이벤트 리스너 추가
      const registerLink = loginFormElement.getChildByID('register') as HTMLAnchorElement;
      if (registerLink) {
          registerLink.addEventListener('click', this.handleRegister.bind(this));
      }
  }

  handleLogin(event: Event) {
    event.preventDefault();
    const username = (document.getElementById('userId') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    api.post('/account/login',{
      username:username,
      password:password
    })
    .then(res=>{
      console.log(res);
    })
    .catch(error=>{
      console.error(error);
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

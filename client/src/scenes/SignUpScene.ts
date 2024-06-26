import Phaser from 'phaser';
import api from '../utils/api';

export class SignUpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SignUpScene' });
    }

    create() {
        const registerFormHTML = `
            <div class="register-form">
                <h2>Create Account</h2>
                <div class="input-group">
                    <label for="username">아이디</label>
                    <input type="text" name="username" id="username">
                    <p id="error-msg" class="error-msg-0"></p>
                </div>
                <div class="input-group">
                    <label for="password">비밀번호</label>
                    <input type="password" name="password" id="password">
                    <p id="error-msg" class="error-msg-1"></p>
                </div>
                <div class="input-group">
                    <label for="re-password">비밀번호 재입력</label>
                    <input type="password" name="re-password" id="re-password">
                    <p id="error-msg" class="error-msg-2"></p>
                </div>
                <div class="input-group">
                    <label for="email">이메일</label>
                    <input type="text" name="email" id="email">
                    <p id="error-msg" class="error-msg-3"></p>
                </div>
                <div class="buttons">
                    <button id="register-button" class="register-button">회원가입</button>
                </div>
                <div class="link">
                    <p><a href="#" id="move-to-signin">로그인 페이지로 이동</a></p>
                </div>
            </div>
        `;
        const registerFormElement = this.add.dom(this.cameras.main.centerX, this.cameras.main.centerY).createFromHTML(registerFormHTML);

        const moveToSignInButton = registerFormElement.getChildByID('move-to-signin') as HTMLButtonElement;
        if (moveToSignInButton) {
            moveToSignInButton.addEventListener('click', this.handleLogin.bind(this));
        }

        const registerButton = registerFormElement.getChildByID('register-button') as HTMLButtonElement;
        if (registerButton) {
            registerButton.addEventListener('click', this.handleRegister.bind(this));
        }

        const usernameInput = registerFormElement.getChildByID('username') as HTMLInputElement;
        const passwordInput = registerFormElement.getChildByID('password') as HTMLInputElement;
        const rePasswordInput = registerFormElement.getChildByID('re-password') as HTMLInputElement;
        const emailInput = registerFormElement.getChildByID('email') as HTMLInputElement;

        if (usernameInput) {
            usernameInput.addEventListener('input', this.validateusername.bind(this));
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', this.validatePassword.bind(this));
        }

        if (rePasswordInput) {
            rePasswordInput.addEventListener('input', this.validateRePassword.bind(this));
        }

        if(emailInput){
            emailInput.addEventListener('input', this.validateEmail.bind(this));
        }
    }

    handleLogin(event: Event) {
        event.preventDefault();
        this.scene.start('SignInScene');
    }

    handleRegister(event: Event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const rePasswordInput = document.getElementById('re-password') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;

        let isValid = true;

        this.validateusername({ target: usernameInput } as unknown as Event);
        this.validatePassword({ target: passwordInput } as unknown as Event);
        this.validateRePassword({ target: rePasswordInput } as unknown as Event);
        this.validateEmail({ target: emailInput } as unknown as Event);

        if (document.querySelector('.error-msg-0')!.textContent !== '') {
            isValid = false;
        }

        if (document.querySelector('.error-msg-1')!.textContent !== '') {
            isValid = false;
        }

        if (document.querySelector('.error-msg-2')!.textContent !== '') {
            isValid = false;
        }

        if (document.querySelector('.error-msg-3')!.textContent !== '') {
            isValid = false;
        }

        if (isValid) {
            api.post('/account/register',{
                username:usernameInput.value,
                password:passwordInput.value,
                email:emailInput.value
            })
            .then(res=>{
                console.log(res);
            })
            .catch(error=>{
                console.error(error);
            })
        }
    }

    validateusername(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const errorMsg = document.querySelector('.error-msg-0')!;

        if (value.length < 4) {
            errorMsg.textContent = '아이디는 4자 이상이어야 합니다.';
        } else if (!/^[a-zA-Z0-9]{1,20}$/.test(value)) {
            errorMsg.textContent = '20자 이내로 공백이 없어야 하며, 영어 대소문자와 숫자로만 이루어져야 합니다.';
        } else {
            errorMsg.textContent = '';
        }
    }

    validatePassword(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const errorMsg = document.querySelector('.error-msg-1')!;

        if (value.length < 4) {
            errorMsg.textContent = '비밀번호는 4자 이상이어야 합니다.';
        } else if (!/^[a-zA-Z0-9!@#$%^&*()_+[\]{};':"\\|,.<>\/?~-]{1,20}$/.test(value)) {
            errorMsg.textContent = '20자 이내로 공백이 없어야 하며, 영어 대소문자, 숫자, 특수문자로 이루어져야 합니다.';
        } else {
            errorMsg.textContent = '';
        }
    }

    validateRePassword(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const errorMsg = document.querySelector('.error-msg-2')!;

        if (value !== passwordInput.value) {
            errorMsg.textContent = '비밀번호가 일치하지 않습니다.';
        } else {
            errorMsg.textContent = '';
        }
    }

    validateEmail(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const errorMsg = document.querySelector('.error-msg-3')!;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            errorMsg.textContent = '유효한 이메일 형식이 아닙니다.';
        } else {
            errorMsg.textContent = '';
        }
    }
}

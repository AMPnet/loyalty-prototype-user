import {Component} from '@angular/core';
import {AuthService, LoginState} from "../auth-service/auth.service";

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css']
})
export class LoginButtonComponent {

  loginState: LoginState
  account: string | null

  constructor(private authService: AuthService) {
    this.loginState = this.authService.getState()
    this.account = this.authService.getAccount()
    this.authService.addAccountChangeHook(this.updateState.bind(this))

    setTimeout(
      this.updateState.bind(this),
      500
    )
  }

  updateState() {
    this.loginState = this.authService.getState()
    this.account = this.authService.getAccount()
  }

  async logIn() {
    await this.authService.logIn()
  }
}

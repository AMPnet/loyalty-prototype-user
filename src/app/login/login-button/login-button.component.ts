import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService, LoginState} from "../auth-service/auth.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {

  loginState$: Observable<LoginState>
  account$: Observable<string | null>

  constructor(private authService: AuthService) {
    this.loginState$ = this.authService.loginState$
    this.account$ = this.authService.account$
  }

  async logIn() {
    await this.authService.logIn()
  }
}

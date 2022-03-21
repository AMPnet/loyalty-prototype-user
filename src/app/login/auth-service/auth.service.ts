import {ApplicationRef, Injectable} from '@angular/core'
import {BehaviorSubject, Observable} from "rxjs";
import {fromPromise} from "rxjs/internal-compatibility";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  account$ = new BehaviorSubject<string>("Unknown")
  loginState$ = new BehaviorSubject<LoginState>("METAMASK_MISSING")

  constructor(private applicationRef: ApplicationRef) {
    (window as any).ethereum.on("accountsChanged", this.updateState.bind(this))
    this.updateState()
  }

  async logIn() {
    await (window as any).ethereum.request({method: 'eth_requestAccounts'})
      .then(this.updateState.bind(this))
  }

  signMessage(message: string): Observable<string> {
    return fromPromise<string>(
      (window as any).ethereum.request(
        {
          method: 'personal_sign',
          params: [message, this.account$.value]
        }
      )
    )
  }

  private updateState() {
    const ethereum = (window as any).ethereum
    this.account$.next(ethereum?.selectedAddress || "Unknown")
    this.loginState$.next(AuthService.determineLoginState())
    this.applicationRef.tick()
  }

  private static determineLoginState(): LoginState {
    const ethereum = (window as any).ethereum

    if (!ethereum) {
      return "METAMASK_MISSING"
    }

    if (!ethereum.selectedAddress) {
      return "LOGGED_OUT"
    }

    return "LOGGED_IN"
  }
}

export type LoginState = "METAMASK_MISSING" | "LOGGED_OUT" | "LOGGED_IN"

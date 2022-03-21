import {ApplicationRef, Injectable} from '@angular/core'
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private accountSubject = new BehaviorSubject<string>("Unknown")
  private loginStateSubject = new BehaviorSubject<LoginState>("METAMASK_MISSING")

  account$ = this.accountSubject.asObservable()
  loginState$ = this.loginStateSubject.asObservable()

  constructor(private applicationRef: ApplicationRef) {
    (window as any).ethereum.on("accountsChanged", this.updateState.bind(this))
    this.updateState()
  }

  async logIn() {
    await (window as any).ethereum.request({method: 'eth_requestAccounts'})
      .then(this.updateState.bind(this))
  }

  private updateState() {
    const ethereum = (window as any).ethereum
    this.accountSubject.next(ethereum?.selectedAddress || "Unknown")
    this.loginStateSubject.next(AuthService.determineLoginState())
    this.applicationRef.tick()
  }

  private static determineLoginState(): LoginState {
    console.log("determine state")
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

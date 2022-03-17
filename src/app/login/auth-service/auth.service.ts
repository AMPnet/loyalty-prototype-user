import {Injectable} from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getState(): LoginState {
    const ethereum = (window as any).ethereum

    if (!ethereum) {
      return "METAMASK_MISSING"
    }

    if (!ethereum.selectedAddress) {
      return "LOGGED_OUT"
    }

    return "LOGGED_IN"
  }

  addAccountChangeHook(hook: () => void) {
    (window as any).ethereum.on("accountsChanged", hook)
  }

  getAccount(): string | null {
    return (window as any)?.ethereum?.selectedAddress
  }

  async logIn() {
    await (window as any).ethereum.request({method: 'eth_requestAccounts'});
  }
}

export type LoginState = "METAMASK_MISSING" | "LOGGED_OUT" | "LOGGED_IN"

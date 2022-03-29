import {ApplicationRef, ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthService, LoginState} from "../../login/auth-service/auth.service";
import {HttpClient} from "@angular/common/http";
import {switchMap, tap} from "rxjs/operators";
import {BehaviorSubject, interval, Observable} from "rxjs";

@Component({
  selector: 'app-generate-button',
  templateUrl: './generate-button.component.html',
  styleUrls: ['./generate-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateButtonComponent implements OnInit {

  loginState$: Observable<LoginState>
  signingState$: BehaviorSubject<SigningState>
  messageToSign$: BehaviorSubject<GenerateMessageResponse | null>
  remainingTime$: BehaviorSubject<string>

  signedPayload: string
  countdownTime?: Date

  constructor(private authService: AuthService,
              private httpClient: HttpClient,
              private applicationRef: ApplicationRef) {
    this.loginState$ = this.authService.loginState$
    this.signingState$ = new BehaviorSubject<SigningState>("GENERATE_PAYLOAD")
    this.messageToSign$ = new BehaviorSubject<GenerateMessageResponse | null>(null)
    this.remainingTime$ = new BehaviorSubject<string>("None")
    this.authService.account$.subscribe(() => this.signingState$.next("GENERATE_PAYLOAD"))
    this.signedPayload = ""
  }

  ngOnInit() {
    interval(1000).subscribe(() => {
      const now = new Date().getTime()
      const target = this.countdownTime?.getTime()

      this.remainingTime$.next("5:00")

      if (!!target) {
        const diff = target - now

        if (diff > 0) {
          const minutes = Math.floor(diff / 60000)
          const seconds = Math.floor((diff - (minutes * 60000)) / 1000)

          if (seconds >= 10) {
            this.remainingTime$.next(`${minutes}:${seconds}`)
          } else {
            this.remainingTime$.next(`${minutes}:0${seconds}`)
          }
        } else {
          this.remainingTime$.next("Expired")
        }
      }
    })
  }

  generateMessage() {
    const account = this.authService.account$.value
    const response = this.httpClient.post<GenerateMessageResponse>(
      `https://eth-staging.ampnet.io/api/blockchain-api/verification/generate/${account}`,
      null,
      {responseType: 'json'}
    )

    response.pipe(
      tap(() => this.signingState$.next("SIGN_PAYLOAD")),
      tap(resp => this.messageToSign$.next(resp)),
      tap(() => this.applicationRef.tick())
    ).subscribe()
  }

  signMessage() {
    const messageToSign = this.messageToSign$.value

    if (messageToSign !== null) {
      this.authService.signMessage(messageToSign.message).pipe(
        switchMap(signature => this.verifySignature(messageToSign.id, signature))
      ).subscribe((resp) => {
        this.signingState$.next("DISPLAY_CODE")
        this.signedPayload = JSON.stringify(resp)
        this.countdownTime = new Date(resp.valid_until)
      })
    }
  }

  private verifySignature(messageId: string, signature: string): Observable<VerifySignedMessageResponse> {
    return this.httpClient.post<VerifySignedMessageResponse>(
      `https://eth-staging.ampnet.io/api/blockchain-api/verification/signature/${messageId}`,
      {signature: signature},
      {responseType: 'json'}
    )
  }
}

type SigningState = "GENERATE_PAYLOAD" | "SIGN_PAYLOAD" | "DISPLAY_CODE"

interface GenerateMessageResponse {
  id: string
  message: string
  valid_until: string
}

interface VerifySignedMessageResponse {
  id: string
  signature: string
  valid_until: string
}

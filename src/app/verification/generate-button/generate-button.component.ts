import {ApplicationRef, ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService, LoginState} from "../../login/auth-service/auth.service";
import {HttpClient} from "@angular/common/http";
import {switchMap, tap} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'app-generate-button',
  templateUrl: './generate-button.component.html',
  styleUrls: ['./generate-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateButtonComponent {

  loginState$: Observable<LoginState>
  signingState$: BehaviorSubject<SigningState>
  messageToSign$: BehaviorSubject<GenerateMessageResponse | null>
  qrCodePayload: string

  constructor(private authService: AuthService,
              private httpClient: HttpClient,
              private applicationRef: ApplicationRef) {
    this.loginState$ = this.authService.loginState$
    this.signingState$ = new BehaviorSubject<SigningState>("GENERATE_PAYLOAD")
    this.messageToSign$ = new BehaviorSubject<GenerateMessageResponse | null>(null)
    this.authService.account$.subscribe(() => this.signingState$.next("GENERATE_PAYLOAD"))
    this.qrCodePayload = ""
  }

  generateMessage() {
    const account = this.authService.account$.value
    const response = this.httpClient.post<GenerateMessageResponse>(
      `http://localhost:8080/verification/generate/${account}`,
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
        this.qrCodePayload = JSON.stringify(resp)
      })
    }
  }

  private verifySignature(messageId: string, signature: string): Observable<VerifySignedMessageResponse> {
    return this.httpClient.post<VerifySignedMessageResponse>(
      `http://localhost:8080/verification/signature/${messageId}`,
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
  validUntil: string
}

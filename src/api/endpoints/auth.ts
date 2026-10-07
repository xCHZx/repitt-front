// /v1/auth/* (guide §2). Auth forms never trigger the global step-up / session-end handling.
import { request, unwrap } from '../client'
import type { components } from '../types'

type S = components['schemas']

const form = { noAuthHandling: true } as const

// §2.5 Visitor / cashier: continue with phone (OTP) — also registers new phones
export const otpRequest = (body: S['OtpRequestDto']) =>
  request('post', '/v1/auth/otp/request', { body, meta: form }).then(unwrap)

export const otpVerify = (body: S['OtpVerifyDto']) =>
  request('post', '/v1/auth/otp/verify', { body, meta: form }).then(unwrap)

// §2.6 Owner registration in two steps
export const ownerRegister = (body: S['OwnerRegisterDto']) =>
  request('post', '/v1/auth/owner/register', { body, meta: form }).then(unwrap)

export const ownerRegisterVerify = (body: S['ChallengeVerifyDto']) =>
  request('post', '/v1/auth/owner/register/verify', { body, meta: { ...form, noConflictRetry: true } }).then(unwrap)

// §2.7 Owner login
export const ownerLogin = (body: S['OwnerLoginDto']) =>
  request('post', '/v1/auth/owner/login', { body, meta: form }).then(unwrap)

// §2.8–§2.9 Step-up / reauthentication
export const stepUp = (body: S['StepUpDto']) =>
  request('post', '/v1/auth/step-up', { body, meta: form }).then(unwrap)

export const stepUpOtpRequest = () =>
  request('post', '/v1/auth/step-up/otp/request', { meta: form }).then(unwrap)

export const stepUpOtpVerify = (body: S['ChallengeVerifyDto']) =>
  request('post', '/v1/auth/step-up/otp/verify', { body, meta: form })

// §2.4 Logout (bearer, no body). TOKEN_EXPIRED still refreshes first through the interceptor.
export const logout = () =>
  request('post', '/v1/auth/logout', { meta: form })

export const logoutAll = () =>
  request('post', '/v1/auth/logout-all', { meta: form })

// §2.10 Password reset by email link and by phone
export const passwordForgot = (body: S['PasswordForgotDto']) =>
  request('post', '/v1/auth/password/forgot', { body, meta: form }).then(unwrap)

export const passwordReset = (body: S['PasswordResetDto']) =>
  request('post', '/v1/auth/password/reset', { body, meta: form })

export const passwordForgotOtp = (body: S['PasswordForgotOtpDto']) =>
  request('post', '/v1/auth/password/forgot/otp', { body, meta: form }).then(unwrap)

export const passwordResetOtp = (body: S['PasswordResetOtpDto']) =>
  request('post', '/v1/auth/password/reset/otp', { body, meta: { ...form, noConflictRetry: true } })

// §2.11 Email verification
export const emailVerify = (body: S['EmailVerifyDto']) =>
  request('post', '/v1/auth/email/verify', { body, meta: form })

/** 202 = sent, 204 = already verified (refresh GET /v1/me). */
export const emailResend = () =>
  request('post', '/v1/auth/email/resend', { meta: form })

export interface AddActivityApiReponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface AddActivityApiRequest {
  activity: string;
  session_id: string;
  user_id: string;
}

export interface AuthenticationRequest {
  emailAddress: string;
  password: string;
}

export interface AuthenticationResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface EmailAddressValidation {
  hasError: boolean;
  text: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

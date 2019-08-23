import webapi from "api/webapi";

export interface SignatureDoRequest {
    sId: number;
}
export interface SignatureDoResponse {
    wordPath: string;
    isSign?: number;
}
export interface SignatureSignResponse {
    signPath: string;
}
export interface SignatureSignRequest {
    sId: number;
    singPath: string;
}
export function signatureDo(req: SignatureDoRequest) {
    return webapi.post<SignatureDoResponse>("/signature/h5/do", req);
}

export function signatureSign(req: SignatureSignRequest) {
    return webapi.post<SignatureSignResponse>("/signature/h5/sign", req);
}

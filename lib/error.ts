export class SDKError extends Error {
    code: number;

    constructor(code: number, message = "") {
        super(message);
        this.code = code;
        this.message = message;
        this.name = "Discord SDK Error";
    }
}

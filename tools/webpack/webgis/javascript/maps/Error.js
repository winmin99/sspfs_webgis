export default class MapError extends Error {
  constructor(message, code) {
    super(message);

    this.code = code;
    this.message = message;
  }
}

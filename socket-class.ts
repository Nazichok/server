export class Socket {
  private static socket: any;

  static setSocket(socket: any) {
    Socket.socket = socket;
  }

  static getSocket() {
    return Socket.socket;
  }
}
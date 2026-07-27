import type { WebSocket } from "ws";
export class SocketManager {
  private socketMap: Map<string, WebSocket[]>;
  private userMap: Map<string, WebSocket>;
  constructor() {
    this.socketMap = new Map();
    this.userMap = new Map();
    this.socketMap.set("SOL", []);
    this.socketMap.set("ETH", []);
  }
  subscribe(ws: WebSocket, market: string, userid?: string) {
    if (userid) {
      this.userMap.set(userid, ws);
      return;
    }
    const marketsockets = this.socketMap.get(market);
    if (!marketsockets) {
      return;
    }
    if (marketsockets.includes(ws)) {
      return;
    } else {
      marketsockets.push(ws);
      this.socketMap.set(market, marketsockets);
    }
  }
  unsubscribe(ws: WebSocket, market: string, userid?: string) {
    if (userid) {
      this.userMap.delete(userid);
      return;
    }
    const marketsockets = this.socketMap.get(market);
    if (!marketsockets) {
      return;
    }
    if (marketsockets.includes(ws)) {
      let newmarketsockets = marketsockets.filter((x) => x != ws);
      this.socketMap.set(market, newmarketsockets);
    }
  }
  async pushDepth(data: any, market: string) {
    console.log(data);
    const websockets = this.socketMap.get(market);
    if (!websockets) {
      return;
    }
    for (const ws of websockets) {
      ws.send(JSON.stringify({ data, type: "depthChange" }));
    }
  }
  async pushPriceUpdate(data: any, market: string) {
    console.log(data);
    const websockets = this.socketMap.get(market);
    if (!websockets) {
      return;
    }
    for (const ws of websockets) {
      ws.send(JSON.stringify({ data, type: "priceUpdate" }));
    }
  }
  clearAllSubs(ws: WebSocket) {
    for (const [key, value] of this.socketMap) {
      this.socketMap.set(
        key,
        value.filter((x) => x !== ws),
      );
    }
  }
}

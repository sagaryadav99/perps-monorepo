export type Bid = {
  availableQty: number;
  openOrders: {
    userId: string;
    qty: number;
    filledQty: number;
    orderId: string;
    createdAt: Date;
  }[];
};
export type Ask = {
  availableQty: number;
  openOrders: {
    userId: string;
    orderId: string;
    qty: number;
    filledQty: number;
    createdAt: Date;
  }[];
};
export type Orderbook = {
  bids: Record<string, Bid>;
  asks: Record<string, Ask>;
  lastTradedPrice: number;
  indexPrice: number;
};
export type Orderbooks = Record<string, Orderbook>;
export type Fill = {
  fillId: string;
  market: string;
  price: number;
  qty: number;
  takerUserId: string;
  makerUserId: string;
  takerOrderId: string;
  makerOrderId: string;
  takerSide: string;
  createdAt: Date;
};
export type ToEngine =
  | { messageType: "getBalance"; userId: string }
  | {
      messageType: "onRamp";
      userId: string;
      amount: number;
    }
  | {
      messageType?: "order";
      userId: string;
      orderId: string;
      price: number;
      qty: number;
      type: string;
      market: string;
      side: string;
      leverage: number;
    }
  | {
      messageType: "cancelOrder";
      userId: string;
      orderId: string;
    }
  | {
      messageType: "getDepth";
      userId: string;
      marketId: string;
    };
export type Order = {
  orderId: string;
  market: string;
  type: string;
  qty: number;
  margin: number;
  filledQty: number;
  remainingQty: number;
  leverage: number;
  orderType: string;
  price: number;
  status: string;
  createdAt: Date;
};
export type Position = {
  userId: string;
  market: string;
  type: string;
  qty: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
  averagePrice: number;
  pnl: number;
  status: "open" | "closed";
};

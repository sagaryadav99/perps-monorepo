import express from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { authmiddleware } from "./middleware/authmiddleware";
import { loopbackqueue } from "./loopbackfunction";
import { transform } from "../utils/transformfunc";
import cookieParser from "cookie-parser";
import cors from "cors";
const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get("/users", (req, res) => {
  res.json("get back users");
});
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(411).json({ message: "invalid credentials" });
    return;
  } else {
    try {
      const user = await prisma.user.create({ data: { username, password } });
      res.json({ message: "user created succesfully" });
    } catch (e) {
      console.log(e);
    }
  }
});
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) {
    res.json({ message: "user not found" });
    return;
  }
  if (user.password !== password) {
    res.status(401).json({ message: "password is incorrect try again" });
    return;
  }
  const token = jwt.sign({ userid: user.id }, process.env.JWT_SECRET!);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: `signed in successfully with userid ${user.id}`, token });
});
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    message: "logged out successfully",
  });
});
app.post("/onramp", authmiddleware, async (req, res) => {
  const userId = req.userid;
  if (!userId) {
    return;
  }
  const { amount } = req.body;
  try {
    const resp = await loopbackqueue({ messageType: "onRamp", userId, amount });
    res.json({
      message: "updated successfully",
      totalAmount: resp.totalAmount,
    });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});
app.post("/order", authmiddleware, async (req, res) => {
  const userId = req.userid;
  if (!userId) {
    return;
  }
  const { price, qty, type, market, side, leverage } = req.body;
  const orderId = crypto.randomUUID();
  try {
    const response = await loopbackqueue({
      messageType: "order",
      price,
      qty,
      type,
      market,
      side,
      userId,
      leverage,
      orderId,
    });
    res.json({
      fills: JSON.parse(response.fills as string),
      order: JSON.parse(response.order as string),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e });
  }
});
app.delete("/order", (req, res) => {
  //delete a pending order
});
app.get("/me", authmiddleware, async (req, res) => {
  //how much unlocked balance is available
  const userId = req.userid;
  if (!userId) {
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const result = await loopbackqueue({ messageType: "getBalance", userId });
    res.json({ username: user!.username, balance: Number(result.balance) });
  } catch (e) {
    console.log(e);
  }
});
app.get("/getDepth/:marketId", authmiddleware, async (req, res) => {
  const userId = req.userid;
  const { marketId } = req.params;
  if (!userId) {
    return;
  }
  if (!marketId || Array.isArray(marketId)) {
    return;
  }
  try {
    const result = await loopbackqueue({
      messageType: "getDepth",
      userId,
      marketId,
    });
    const parsedresult = JSON.parse(result.depth as string);
    const bids = transform(parsedresult.bids);
    const asks = transform(parsedresult.asks);
    res.json({ bids, asks });
  } catch (e) {
    console.log(e);
  }
});
app.get("/positions/open/:marketId", authmiddleware, async (req, res) => {
  const userid = req.userid;
  const { marketId } = req.params;
  if (!userid) {
    return;
  }
  if (!marketId || Array.isArray(marketId)) {
    return;
  }
  try {
    const result = await loopbackqueue({
      messageType: "getOpenPositions",
      userId: userid,
      marketId,
    });
    let response = JSON.parse(result.positions as string);
    res.json({ positions: response });
  } catch (e) {
    console.log(e);
  }
});
app.get("/candles/:symbol", authmiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval;

    if (
      interval !== "1m" &&
      interval !== "5m" &&
      interval !== "10m" &&
      interval !== "30m"
    ) {
      return res.status(400).json({
        error: "Invalid interval",
      });
    }

    const views = {
      "1m": "Candles1m",
      "5m": "Candles5m",
      "10m": "Candles10m",
      "30m": "Candles30m",
    } as const;

    const view = views[interval];

    const candles = await prisma.$queryRawUnsafe(
      `
        SELECT
          bucket,
          symbol,
          open,
          high,
          low,
          close
        FROM "${view}"
        WHERE symbol = $1
        ORDER BY bucket ASC
      `,
      symbol,
    );
    return res.json(candles);
  } catch (error) {
    console.error("Failed to fetch candles:", error);

    return res.status(500).json({
      error: "Failed to fetch candles",
    });
  }
});
app.get("/orders/open/:marketId", authmiddleware, async (req, res) => {
  const { marketId } = req.params;
  const userId = req.userid;
  if (!userId) {
    return;
  }
  const data = await prisma.order.findMany({
    where: {
      userId,
      market_id: marketId as string,
      status: "Open",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({ orders: data });
});
app.get("/orders/:marketId", authmiddleware, async (req, res) => {
  const userId = req.userid;
  const { marketId } = req.params;
  const data = await prisma.order.findMany({
    where: {
      userId,
      market_id: marketId as string,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  res.json({ allorders: data });
});
app.get("/trades", authmiddleware, async (req, res) => {
  try {
    const userId = req.userid;

    const fills = await prisma.fill.findMany({
      where: {
        OR: [
          {
            takerUserId: userId,
          },
          {
            makerUserId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const trades = fills.map((fill) => ({
      id: fill.id,
      market: fill.marketId,
      price: fill.price,
      qty: fill.qty,

      side:
        fill.takerUserId === userId
          ? fill.takerSide
          : fill.takerSide === "Long"
            ? "Short"
            : "Long",

      createdAt: fill.createdAt,
    }));

    return res.json({ trades });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch trade history",
    });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

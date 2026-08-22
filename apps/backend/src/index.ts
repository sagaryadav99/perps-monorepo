import express from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { authmiddleware } from "./middleware/authmiddleware";
import { loopbackqueue } from "./loopbackfunction";
import { transform } from "../utils/transformfunc";
import cookieParser from "cookie-parser";
import cors from "cors";
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
      //const user = await prisma.user.create({ data: { username, password } });
      console.log(username, password);
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
  //push to the outgoing queue
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
  //returns open positions for that marketId
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
    console.log(result);
    let response = JSON.parse(result.positions as string);
    console.log(response);
    res.json({ positions: response });
  } catch (e) {
    console.log(e);
  }
});
app.get("/positions/closed/:marketId", authmiddleware, (req, res) => {
  //returns closed positions for that marketId
});
app.get("/orders/open/:marketId", authmiddleware, (req, res) => {
  //returns open orders for tha marketid
});
app.get("/orders/:marketId", authmiddleware, (req, res) => {
  //returns all the orders for that market id
});
app.get("/fills", authmiddleware, (req, res) => {
  //returns all the fullfilled orders
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});

import { users } from "./seed";
export function cancelOrder(
  userId: string,
  orderId: string,
  remainingQty: number,
) {
  const user = users.find((x) => x.userId === userId);
  const currorder = user!.orders.find((x) => x.orderId === orderId);
  currorder!.status = "Cancelled";
}

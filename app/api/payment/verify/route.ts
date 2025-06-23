import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const {
  razorpay_order_id: razorpayOrderId,
  razorpay_payment_id: razorpayPaymentId,
  razorpay_signature: razorpaySignature,
} = req.body;

const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET!)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex");

if (generatedSignature === razorpaySignature) {
  return res.status(200).json({ success: true });
} else {
  return res.status(400).json({ success: false });
}
}

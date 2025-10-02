import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });
    console.log("Raw Arcjet decision:", decision); // Always log raw

    if (decision.isDenied()) {
      console.log("Denied:", {
        type: decision.reason?.toString(),
        remaining: decision.remaining,
        tokens: decision.tokens,
      });

      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ message: "Too many requests, please try again later." });
      }
      if (decision.reason.isBot()) {
        return res
          .status(403)
          .json({ message: "Bot detected, Access denied." });
      }
      return res.status(403).json({ message: "Access denied." });
    } else {
      console.log("Allowed:", {
        type: decision.reason?.toString(),
        remaining: decision.remaining,
        tokens: decision.tokens,
      });
      next();
    }
  } catch (error) {
    console.error("Arcjet error:", error);
    next(error);
  }
};

export default arcjetMiddleware;

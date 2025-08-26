import Router from "express"
import { createTransaction, getTransactionsByUserId, deleteTransaction, getSummaryByUserId } from "../controllers/transactionsController.js";

const router = Router();

router.post("/", createTransaction);

router.get("/:userId", getTransactionsByUserId);

router.delete("/:id", deleteTransaction);

router.get("/summary/:userId", getSummaryByUserId);

export default router;
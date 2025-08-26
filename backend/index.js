import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { sql } from "./config/db.js";

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
    console.log("Database intialized successfully");
  } catch (error) {
    console.log("Error initializing DB ", error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await sql`
            SELECT * FROM transactions WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;
    res
      .status(200)
      .json({ message: "All transactions fetched successfully", transactions });
  } catch (error) {
    console.log("Error fetching transaction ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
            INSERT INTO transactions(user_id, title, amount, category)
            VALUES(${user_id}, ${title}, ${amount}, ${category})
            RETURNING *
        `;

    console.log(transaction);
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: transaction[0],
    });
  } catch (error) {
    console.log("Error creating transaction ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *
        `;
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error deleting transaction ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const balanceResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId} 
        `;

    const incomeResult = await sql`
            SELECT COALESCE(SUM(amount) , 0) as income FROM transactions
            WHERE user_id = ${userId} AND amount > 0
        `;

    const expenseResult = await sql`
            SELECT COALESCE(SUM(amount) , 0) as expense FROM transactions
            WHERE user_id = ${userId} AND amount < 0
        `;

    res.status(200).json({
      message: "Account summary fetched successfully",
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
    });
  } catch (error) {
    console.log("Error fetching account summary ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});

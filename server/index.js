const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB 연결
mongoose
  .connect("mongodb+srv://bbakain:bgh902902!@cluster0.ltjtjuy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB에 연결됨"))
  .catch(err => console.error("❌ 연결 실패:", err));

// 모델 정의
const Todo = mongoose.model("Todo", {
  text: String,
  completed: Boolean,  // ✅ 완료 여부 추가!
  date: String // ✅ 날짜 필드 추가
});  

// GET: 모든 할 일 조회
app.get("/todos", async (req, res) => {
  const { date } = req.query;
  const filter = date ? { date } : {};
  const todos = await Todo.find(filter);
  res.json(todos);
});

// POST: 새 할 일 추가
app.post("/todos", async (req, res) => {
  const { text, date } = req.body;
  if (!text || !date) return res.status(400).json({ error: "text & date required" });

  const newTodo = new Todo({ text, date, completed: false });
  await newTodo.save();
  res.json(newTodo);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 완료 여부 수정 (PATCH)
app.patch("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
  
    try {
      const updated = await Todo.findByIdAndUpdate(
        id,
        { completed },
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: "Update failed" });
    }
  });

  // 개별 항목 삭제
  app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await Todo.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "삭제 실패" });
    }
  });

  // 전체 항목 삭제
  app.delete("/todos", async (req, res) => {
    try {
      await Todo.deleteMany({});
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "전체 삭제 실패" });
    }
  });

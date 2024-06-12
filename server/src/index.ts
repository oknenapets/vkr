import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { ServerSocket } from "./socket/";
import mongoose from "mongoose";
import { Category, Word } from "./schemes";
import { gameService } from "./services/GameService/";
const app = express();
const httpServer = http.createServer(app);

new ServerSocket(httpServer);
app.use(cors());
app.use(bodyParser.json());

app.post("/rooms", async (req, res) => {
  try {
    const {
      isCompetitive,
      category,
      maxRound,
      roundTime,
      themeSelectTime,
      isPrivate,
    } = req.body;

    const room = await gameService.createRoom(
      isCompetitive,
      category,
      maxRound,
      roundTime,
      themeSelectTime,
      isPrivate,
    );

    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка " });
  }
});

app.post("/rooms/free", async (req, res) => {
  try {
    const { isCompetitive } = req.body;
    const room = await gameService.quickRoom(isCompetitive);
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка" });
  }
});

app.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({
      name,
    });

    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Произошла ошибка при создании категории" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка" });
  }
});

app.post("/words", async (req, res) => {
  try {
    const { language, value, category } = req.body;
    const word = new Word({
      language,
      value,
      category,
    });

    await word.save();
    res.status(201).json({ word });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка при создании слова" });
  }
});

app.get("/words", async (req, res) => {
  try {
    const words = await Word.find().populate("language").populate("category");
    res.status(200).json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Произошла ошибка при чтении слов" });
  }
});

const start = async () => {
  try {
    const db = await mongoose.connect(url);
    httpServer.listen(3000, () => console.log("okay"));
  } catch (e) {
    console.log(e);
  }
};

start();

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AzureOpenAI } from "openai";

dotenv.config();

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  apiVersion: "2025-01-01-preview",
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/recommendBooks", async (req, res) => {
  try {
    const systemPrompt = `
당신은 감정 기반 책 추천 전문가입니다. 
사용자의 감정 키워드 또는 문장에 맞춰 
3권의 책을 추천해주세요. 

반환 형식은 JSON 배열로, 각 원소는 다음 속성을 가져야 합니다:
- title: 책 제목 (문자열)
- summary: 책 요약 (문자열)

예시:
[
  {"title": "책 제목1", "summary": "책 요약1"},
  {"title": "책 제목2", "summary": "책 요약2"},
  {"title": "책 제목3", "summary": "책 요약3"}
]
`;

    const resp = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: req.body.prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.9
    });

    const content = resp.choices[0].message.content;

    let books = [];
    try {
      books = JSON.parse(content);
    } catch (err) {
      console.error("JSON 파싱 실패:", err);
      // fallback: 그냥 텍스트 전체를 하나의 책 요약으로 보내기
      books = [{
        title: "추천 도서",
        summary: content.trim(),
      }];
    }

    res.json({ books });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Azure 호출 실패" });
  }
});

app.listen(5000, () => console.log("🚀 Server on http://localhost:5000"));




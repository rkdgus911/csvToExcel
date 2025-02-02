import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function POST(request: Request) {
  // 영문으로 있는 키 값을 한글로 변경해주기 위한 작업
  const headerMapping: { [key: string]: string } = {
    author: "작성자",
    title: "제목",
    content: "내용",
  };
  const csvFileData = await request.json();

  const foloderPath = path.join(process.cwd(), "csv");
  const filePath = path.join(foloderPath, "csv_test.csv");

  try {
    // 폴더가 존재하는 지 체크
    await fs.mkdir(foloderPath, { recursive: true });

    let csvString = "";

    // 파일 존재 여부 판단
    let fileExists = false;

    try {
      await fs.access(filePath);
      fileExists = true;
    } catch (error) {
      console.error("파일 없음", error);
      fileExists = false;
    }

    const values = Object.values(csvFileData);
    if (fileExists) {
      csvString += values.join(",") + "\r\n";
      await fs.appendFile(filePath, csvString, "utf8");
      return NextResponse.json({
        msg: "기존 파일에 텍스트 추가 성공했습니다.",
      });
    } else {
      const titles = Object.keys(csvFileData);
      const translatedTitles = titles.map(
        (title) => headerMapping[title] || title
      );
      csvString += translatedTitles.join(",") + "\r\n";
      csvString += values.join(",") + "\r\n";
      await fs.writeFile(filePath, csvString, "utf8");
      return NextResponse.json({
        msg: "CSV 파일 생성 성공했습니다.",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

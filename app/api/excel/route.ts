import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import xlsx from "xlsx-js-style";

export async function GET() {
  try {
    const fileName = "csv_test.csv";
    const filePath = path.join(process.cwd(), "csv", fileName);

    // 파일 존재를 확인합니다. csv_test.csv;
    await fs.access(filePath);
    const csvData = await fs.readFile(filePath, "utf8");

    const wb = xlsx.utils.book_new();
    const resultCsvData = csvData.split("\r\n").map((row) => row.split(","));

    // 해당 부분은 xlsx-js-style 참고하시는 걸 추천드립니다!
    const header = resultCsvData[0].map((v) => ({
      v,
      t: "s",
      s: {
        border: {
          top: { style: "thin", color: { rgb: "#000000" } },
          left: { style: "thin", color: { rgb: "#000000" } },
          bottom: { style: "thin", color: { rgb: "#000000" } },
          right: { style: "thin", color: { rgb: "#000000" } },
        },
        font: {
          bold: true,
          sz: 14,
          color: { rgb: "FFFFFF" },
        },
        alignment: {
          horizontal: "center",
        },
        fill: {
          fgColor: { rgb: "000000" },
        },
      },
    }));

    let body = resultCsvData.slice(1).map((row) =>
      row.map((v) => ({
        v,
        t: "s",
        s: {
          font: {
            sz: 14,
          },
          alignment: {
            horizontal: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "#000000" } },
            left: { style: "thin", color: { rgb: "#000000" } },
            bottom: { style: "thin", color: { rgb: "#000000" } },
            right: { style: "thin", color: { rgb: "#000000" } },
          },
        },
      }))
    );

    body = body.filter((row) => row.some((cell) => cell.v.trim() !== ""));

    const ws = xlsx.utils.aoa_to_sheet([header, ...body]);

    ws["!cols"] = [
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
    ];

    xlsx.utils.book_append_sheet(wb, ws, "엑셀 파일 다운로드 테스트 중");

    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // new Response를 사용해서 엑셀 파일을 buffer 형태로 응답하여 브라우저가 엑셀 파일로 인식하게 해여
    // attachment로 설정하여 사용자가 파일을 다운로드하게 합니다
    return new Response(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="csv_test.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      msg: "CSV 파일이 없습니다.",
    });
  }
}

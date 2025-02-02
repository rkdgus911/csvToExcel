"use client"; // 해당 부분을 작성하지 않으면 에러가 나옵니다!!
import { css } from "@emotion/css";
import axios from "axios";
import { useCallback, useState } from "react";

// 타입선언
interface FormDataType {
  author: string;
  title: string;
  content: string;
}

export default function Home() {
  // 상태 관리를 하기 위한 useState
  const [formData, setFormData] = useState<FormDataType>({
    author: "",
    title: "",
    content: "",
  });

  // 입력 받는 핸들러 부분
  const onChangeInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 등록 버튼 클릭 시 처리
  const onClickButtonSubmit = useCallback(async () => {
    try {
      const response = await axios({
        url: "/api/csvfile",
        method: "post",
        data: formData,
      });

      if (response.status === 200) {
        // 성공 시 폼 초기화
        setFormData({
          author: "",
          title: "",
          content: "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [formData]);

  // 엑셀 다운로드
  const onClickExcelDownload = useCallback(async () => {
    try {
      const response = await axios({
        url: "/api/excel",
        method: "get",
        responseType: "blob", // 응답을 blob형태로
      });

      if (response.status === 200) {
        // 해당 컴퓨터 시간말고 UTC시간으로 하기 위한 작업!
        // 현재 시간
        const currentTime = new Date();
        // UTC 시간 계산
        const utcTime =
          currentTime.getTime() + currentTime.getTimezoneOffset() * 60 * 1000;
        // UTC to KST (UTC + 9시간)
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const krCurr = new Date(utcTime + KR_TIME_DIFF);
        krCurr.setDate(krCurr.getDate());
        const year = krCurr.getFullYear();
        const month = ("0" + (krCurr.getMonth() + 1)).slice(-2);
        const day = ("0" + krCurr.getDate()).slice(-2);
        const hour = ("0" + krCurr.getHours()).slice(-2);
        const minutes = ("0" + krCurr.getMinutes()).slice(-2);
        const seconds = ("0" + krCurr.getSeconds()).slice(-2);
        const nowDate = year + month + day + hour + minutes + seconds;
        // Blokb객체를 사용하여 파일 다운로드 처리
        const blob = response.data;
        const link = document.createElement("a");
        const url = window.URL.createObjectURL(blob); // Blob 데이터를 URL로 변환
        link.href = url;
        link.download = `csv_to_excel_${nowDate}.xlsx`;
        link.click(); // 다운로드 시작
        window.URL.revokeObjectURL(url); // URL 객체 메모리 해제
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div>
      <ul
        className={css`
          list-style: none;
          padding: 0;
          & > li {
            margin-bottom: 10px;
            & > span {
              display: inline-block;
              min-width: 50px;
            }
          }
        `}
      >
        <li>
          <span>작성자</span>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={onChangeInputHandler}
          />
        </li>
        <li>
          <span>제목</span>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChangeInputHandler}
          />
        </li>
        <li>
          <span>내용</span>
          <input
            type="text"
            name="content"
            value={formData.content}
            onChange={onChangeInputHandler}
          />
        </li>
        <li>
          <button onClick={onClickButtonSubmit}>등록</button>
        </li>
        <li>
          <button onClick={onClickExcelDownload}>엑셀 다운로드</button>
        </li>
      </ul>
    </div>
  );
}

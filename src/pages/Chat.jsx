import React, { useEffect, useState } from "react";
import MessageBox from "../components/MessageBox";
import PrevButton from "../components/PrevButton";
import { MoonLoader } from "react-spinners";

const Chat = ({ ingredientList }) => {
  // logic
  const endpoint = process.env.REACT_APP_SERVER_ADDRESS;
  const [value, setValue] = useState("");

  const [messages, setMessages] = useState([]); // chatGPT와 사용자의 대화 메시지 배열
  const [isInfoLoading, setIsInfoLoading] = useState(true); // 최초 정보 요청시 로딩
  const [isMessageLoading, setIsMessageLoading] = useState(false); // 사용자와 메시지 주고 받을때 로딩
  const [infoMessages, setInfoMessages] = useState([]); // 초기 답변 대화 목록

  const hadleChange = (event) => {
    const { value } = event.target;
    setValue(value);
  };

  const sendMessage = async (userMessage) => {
    setIsMessageLoading(true);
    try {
      const response = await fetch(`${endpoint}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          messages: [...infoMessages, ...messages],
        }),
      });
      const result = await response.json();

      // chatGPT의 답변 추가
      const { role, content } = result.data;
      const assistantMessage = { role, content };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      // try 혹은 error 구문 이후 실행되는 곳
      setIsMessageLoading(false);
    }
  };

  const hadleSubmit = (event) => {
    event.preventDefault();
    // 유저 메시지 추가
    const userMessage = { role: "user", content: value.trim() };
    setMessages((prev) => [...prev, userMessage]);

    // 지금까지의 대화목록으로 api 호출
    sendMessage(userMessage);
    setValue("");
  };

  //최초 정보 세팅
  const sendInfo = async () => {
    //로딩 스피너 on
    setIsInfoLoading(true);
    try {
      const response = await fetch(`${endpoint}/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientList }),
      });
      const result = await response.json();

      //데이터가 잘 들어온 경우에만 다음 코드 실행
      if (!result.data) return;

      // arr.length -1 : 배열의 마지막 요소ㅢ index값
      const removeLastDataList = result.data.filter(
        (_, index, arr) => arr.length - 1 !== index
      );
      setInfoMessages(removeLastDataList); // 초기 기본답변 저장

      // 첫 assistant 답변 UI에 추가
      const { role, content } = result.data[result.data.length - 1];
      setMessages((prev) => [...prev, { role, content }]);
    } catch (error) {
      console.error(error);
    } finally {
      //로딩 스피너 off
      setIsInfoLoading(false);
    }
  };

  //페이지 로드시 딱 한번 실행
  useEffect(() => {
    sendInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // view
  return (
    <div className="w-full h-full px-6 pt-10 break-keep overflow-auto">
      {isInfoLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MoonLoader color="#46A195" />
          </div>
        </div>
      )}

      {/* START: 로딩 스피너 */}
      {/* START:뒤로가기 버튼 */}
      <PrevButton />
      {/* END:뒤로가기 버튼 */}
      <div className="h-full flex flex-col">
        {/* START:헤더 영역 */}
        <div className="-mx-6 -mt-10 py-7 bg-chef-green-500">
          <span className="block text-xl text-center text-white">
            맛있는 쉐프
          </span>
        </div>
        {/* END:헤더 영역 */}
        {/* START:채팅 영역 */}
        <div className="overflow-auto">
          <MessageBox messages={messages} isLoading={isMessageLoading} />
        </div>
        {/* END:채팅 영역 */}
        {/* START:메시지 입력 영역 */}
        <div className="mt-auto flex py-5 -mx-2 border-t border-gray-100">
          <form
            id="sendForm"
            className="w-full px-2 h-full"
            onSubmit={hadleSubmit}
          >
            <input
              className="w-full text-sm px-3 py-2 h-full block rounded-xl bg-gray-100 focus:"
              type="text"
              name="message"
              value={value}
              onChange={hadleChange}
            />
          </form>
          <button
            type="submit"
            form="sendForm"
            className="w-10 min-w-10 h-10 inline-block rounded-full bg-chef-green-500 text-none px-2 bg-[url('../public/images/send.svg')] bg-no-repeat bg-center"
          >
            보내기
          </button>
        </div>
        {/* END:메시지 입력 영역 */}
      </div>
    </div>
  );
};

export default Chat;

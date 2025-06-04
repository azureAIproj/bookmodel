// Recommend.tsx
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Book = {
  title: string;
  summary: string;
};

const keywordToCategory: Record<string, string> = {
  위로: '위로받고 싶어요', 안정: '위로받고 싶어요', 평온: '위로받고 싶어요', 공감: '위로받고 싶어요',
  사랑: '설레고 싶어요', 설렘: '설레고 싶어요', 기대: '설레고 싶어요', 낭만: '설레고 싶어요',
  호기심: '몰입하고 싶어요', 긴장: '몰입하고 싶어요', 탐험: '몰입하고 싶어요', 궁금증: '몰입하고 싶어요',
  철학: '생각하고 싶어요', 자아: '생각하고 싶어요', 성찰: '생각하고 싶어요', '지적 자극': '생각하고 싶어요',
  유머: '웃고 싶어요', 발랄함: '웃고 싶어요', 밝음: '웃고 싶어요', '따뜻한 일상': '웃고 싶어요',
};

const emotionDescriptions: Record<string, string> = {
  '위로받고 싶어요': '지치고 힘든 날, 따뜻한 문장과 이야기가 필요한 순간이에요.',
  '설레고 싶어요': '사랑과 설렘, 두근거림이 필요한 순간이네요.',
  '몰입하고 싶어요': '현실을 잊고 이야기 속으로 깊이 빠지고 싶은 감정이에요.',
  '생각하고 싶어요': '인생과 인간관계에 대해 깊이 생각하고 싶은 마음이 느껴져요.',
  '웃고 싶어요': '기분 전환이 필요하고 유쾌함을 원하는 순간이네요.',
  '행복해요': '기쁨과 긍정 에너지를 가득 느끼고 싶을 때 좋은 책을 추천해요.',
  '우울해요': '슬픔을 다독여줄 따뜻한 이야기가 필요한 순간이에요.',
  '화가 나요': '감정을 정리하고 평온을 되찾을 수 있는 글이 도움이 될 거예요.',
  '지루해요': '지루함을 날려줄 흥미진진한 이야기를 준비했어요.',
  '설레요': '기대감과 설렘을 이어갈 책들을 골라봤어요.',
};

function Recommend() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const emotionParam = queryParams.get('emotion') || '';
  const summary = queryParams.get('summary');
  const keywords = queryParams.get('keywords')?.split(',') || [];

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

 
  const emotionList = emotionParam.split(',').filter((e) => e.trim());

  // 초보 독서가 → keywords → 카테고리 추출
  const uniqueCategories = Array.from(
    new Set(keywords.map((k) => keywordToCategory[k]).filter(Boolean))
  );

  const effectRan = useRef(false); //useEffect가 처음 실행되었는지 확인하는 변수

    useEffect(() => {
       if (effectRan.current == true) return; // effectRan이 true면 리턴해서 중복 실행 방지
       effectRan.current = true;
              
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      setBooks([]);
    

      let prompt = '';
      if(keywords.length > 0) {
        prompt = `사용자의 감정 키워드: ${keywords.join(', ')}\n추천 도서 목록을 생성해주세요.`;
      }else if (emotionParam) {
        prompt = `사용자의 감정 문장: ${emotionParam}\n추천 도서 목록을 생성해주세요.`;
      }else{
        setError('추천할 도서가 없습니다. 감정 키워드나 문장을 입력해주세요.');
        setLoading(false);
        return;
      }

      // prompt가 비어있으면 API 호출 안 하도록 방어 코드 추가
      if (!prompt) {
         setError('추천할 도서가 없습니다. 감정 키워드나 문장을 입력해주세요.');
         setLoading(false);
         return;
      }

      try {
        // fetch URL은 다시 상대 경로 '/api/recommendBooks' 로!!
        const response = await fetch('/api/recommendBooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API 호출 실패: ${response.status}`); // 상태 코드도 같이 보여주면 좋아
        }

        const data = await response.json();

        if (data && Array.isArray(data.books)) {
          setBooks(data.books);
        } else {
          console.error("Unexpected response structure:", data);
          setError('서버 응답 형식이 예상과 다릅니다.');
          setBooks([]);
        }

      } catch (e: any) {
        console.error("Fetch error:", e);
        setError(e.message || '도서 추천 중 오류가 발생했습니다.');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    // useEffect가 실행될 때 fetchBooks 함수를 호출
    fetchBooks();

  }, []); //의존성 배열에 상태 업데이트 함수들도 넣어줘! (React 훅 규칙)

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fefae0', minHeight: '100vh' }}>
      <h2>📚 감정 기반 추천 도서</h2>

      {/* 초보 독서가의 요약 문장 */}
      {summary && (
        <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
          {summary}
        </p>
      )}

      {/* 초보 독서가: 키워드 기반 감정 카테고리 설명 */}
      {keywords.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {uniqueCategories.map((cat) => (
            <div key={cat} style={{ marginBottom: '1.5rem' }}>
              <h3>{cat}</h3>
              <p>{emotionDescriptions[cat] || '설명이 준비되지 않았어요.'}</p>
            </div>
          ))}
        </div>
      )}

      {/* 애독가: 감정 텍스트 기반 설명 */}
      {!summary && (
        <>
        {emotionList.length === 0 ? (//입력이 없을 시 입력이 없어 추천할 수 없다는 문구구
          <p>입력이 없어 추천할 수 있는 책이 없습니다.</p>
        ) : (
          <ul style={{ marginTop: '1rem' }}>
            {emotionList.map((emotion) => (
              <li key={emotion} style={{ marginBottom: '0.5rem' }}>
                <strong>{emotion}</strong> {emotionDescriptions[emotion] || ''}
                {/*emotionalDescriptions에서 해당 감정에 대한 설명을 가져와서 출력, 그러나 일기는 키값과 완전히 같을 가능성이 낮으므로 뒤에 설명이 없더라도 공백으로 나오게 설정*/}
              </li>
            ))}
          </ul>
        )}
      </>
  )}
      {/* 추천 도서 출력 */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📖 추천 도서 목록</h3>
        <ul>
          {books.map((book, idx) => (
            <li key={idx} style={{ marginBottom: '1rem' }}>
              <strong>{book.title}</strong>
              <p>{book.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Recommend;

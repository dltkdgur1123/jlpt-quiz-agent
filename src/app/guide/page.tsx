import { SiteHeader } from "@/components/layout/SiteHeader";

const sourceUrl = "https://www.jlpt.or.kr/html/information_02.html";

const guideCards = [
  {
    no: "01",
    title: "시험 당일 준비물",
    body: "신분증, HB연필 또는 샤프, 지우개를 준비하세요. 볼펜·사인펜으로 작성한 답안지는 채점이 어려울 수 있습니다.",
  },
  {
    no: "02",
    title: "규정 신분증 확인",
    body: "신분증 미지참 시 응시가 불가합니다. 모바일 신분증은 네트워크 문제에 대비해 실물 신분증 지참을 권장합니다.",
  },
  {
    no: "03",
    title: "전자기기 전원 차단",
    body: "휴대전화, 스마트워치 등 통신·촬영 기능이 있는 전자기기는 시험 중 전원이 꺼져 있어야 합니다.",
  },
];

const idRows = [
  { group: "일반인·대학생", ids: "주민등록증, 운전면허증, 기간 만료 전 여권, 공무원증, 장애인복지카드 등" },
  { group: "중·고등학생", ids: "기간 만료 전 여권, 학생증, 청소년증, 장애인복지카드, 주민등록증 등" },
  { group: "초등학생", ids: "기간 만료 전 여권, 주민등록등본/초본, 건강보험증, 청소년증 등" },
  { group: "군인·외국인", ids: "군인은 주민등록증·운전면허증·여권 등, 외국인은 여권·외국인등록증·국내거소신고증 등" },
];

const cautionItems = [
  "시험 중 휴대전화·스마트워치 벨소리, 진동, 알람음이 울리지 않도록 전원을 꺼두세요.",
  "사전, 교과서, 참고서, 컨닝페이퍼, 전자기기 사용이나 대리 시험은 부정행위로 처리될 수 있습니다.",
  "시험 감독의 지시에 따라야 하며, 시험 종료 후 문제지와 답안지를 반드시 제출해야 합니다.",
  "문제 내용이나 해답을 옮겨 적거나, 문제지·답안지를 촬영/반출/공개하면 안 됩니다.",
];

const afterExamItems = [
  "합격인정서는 합격 시 최초 1회만 발행되며 재발급되지 않습니다.",
  "성적증명서의 영문 이름 변경은 정해진 기간 이후 수수료가 발생할 수 있습니다.",
  "성적증명서 수령 주소가 바뀌면 주소 변경을 해야 하며, 미변경으로 인한 재발송·재발급에는 수수료가 부과될 수 있습니다.",
];

export default function GuidePage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page guide-page">
        <SiteHeader active="guide" />

        <section className="guide-hero" aria-labelledby="guide-title">
          <p className="section-eyebrow">EXAM GUIDE</p>
          <h1 id="guide-title">JLPT 수험안내</h1>
          <div className="guide-hero-actions">
            <a className="guide-secondary-link" href={sourceUrl} rel="noreferrer" target="_blank">공식 안내 원문 보기</a>
          </div>
        </section>

        <section className="guide-grid" aria-label="수험 안내 요약">
          {guideCards.map((card) => (
            <article className="dashboard-panel guide-panel" key={card.no}>
              <span>{card.no}</span>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-panel guide-level-panel" aria-labelledby="guide-id-title">
          <div className="dashboard-action-head">
            <div>
              <h2 id="guide-id-title">규정 신분증 요약</h2>
              <p>세부 인정 범위는 시험 회차와 공지에 따라 달라질 수 있으므로 공식 안내를 최종 기준으로 확인하세요.</p>
            </div>
            <a href={sourceUrl} rel="noreferrer" target="_blank">공식 기준 확인 →</a>
          </div>
          <div className="guide-level-list guide-id-list">
            {idRows.map((row) => (
              <div className="guide-level-row guide-id-row" key={row.group}>
                <strong>{row.group}</strong>
                <span>{row.ids}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="guide-two-column">
          <article className="dashboard-panel guide-check-panel" aria-labelledby="guide-caution-title">
            <h2 id="guide-caution-title">부정행위로 처리될 수 있는 경우</h2>
            <ul>
              {cautionItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="dashboard-panel guide-check-panel" aria-labelledby="guide-after-title">
            <h2 id="guide-after-title">성적·주소 관련 유의사항</h2>
            <ul>
              {afterExamItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>

        <section className="dashboard-panel guide-source-panel" aria-label="공식 안내 출처">
          <strong>출처</strong>
          <p>
            JLPT 서울실시위원회 `수험자 주의사항` 페이지를 참고했습니다. 실제 응시 전에는 반드시 공식 안내 원문과 시험장 공지를 다시 확인해주세요.
          </p>
        </section>
      </div>
    </main>
  );
}

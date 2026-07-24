"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";
type WeaknessBasis = "wrong-rate" | "unanswered" | "recent-miss";

type SettingsState = {
  defaultLevel: JlptLevel;
  includeUnansweredInWrongNote: boolean;
  weaknessBasis: WeaknessBasis;
};

type AccountState = {
  status: "loading" | "signed-out" | "signed-in";
  email: string | null;
};

const SETTINGS_STORAGE_KEY = "jlpt-quiz-user-settings";
const levels: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

const defaultSettings: SettingsState = {
  defaultLevel: "N5",
  includeUnansweredInWrongNote: true,
  weaknessBasis: "wrong-rate",
};

const weaknessOptions: Array<{ value: WeaknessBasis; label: string; helper: string }> = [
  {
    value: "wrong-rate",
    label: "오답률 우선",
    helper: "틀린 비율이 높은 영역부터 복습합니다.",
  },
  {
    value: "unanswered",
    label: "미응답 포함",
    helper: "빈 문제와 오답을 함께 취약 영역으로 봅니다.",
  },
  {
    value: "recent-miss",
    label: "최근 실수 우선",
    helper: "최근 모의고사에서 틀린 영역을 먼저 보여줍니다.",
  },
];

function readSettings(): SettingsState {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      defaultLevel: levels.includes(parsed.defaultLevel as JlptLevel) ? parsed.defaultLevel as JlptLevel : defaultSettings.defaultLevel,
      includeUnansweredInWrongNote: typeof parsed.includeUnansweredInWrongNote === "boolean"
        ? parsed.includeUnansweredInWrongNote
        : defaultSettings.includeUnansweredInWrongNote,
      weaknessBasis: weaknessOptions.some((option) => option.value === parsed.weaknessBasis)
        ? parsed.weaknessBasis as WeaknessBasis
        : defaultSettings.weaknessBasis,
    };
  } catch {
    return defaultSettings;
  }
}

export function SettingsClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [account, setAccount] = useState<AccountState>({ status: "loading", email: null });

  useEffect(() => {
    queueMicrotask(() => setSettings(readSettings()));
  }, []);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        setAccount({ status: data.session ? "signed-in" : "signed-out", email: data.session?.user.email ?? null });
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setAccount({ status: session ? "signed-in" : "signed-out", email: session?.user.email ?? null });
      });
      return () => data.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => setAccount({ status: "signed-out", email: null }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (saveState === "idle") return;
    const timer = window.setTimeout(() => setSaveState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [settings, saveState]);

  const selectedWeakness = useMemo(
    () => weaknessOptions.find((option) => option.value === settings.weaknessBasis) ?? weaknessOptions[0],
    [settings.weaknessBasis],
  );

  function updateSettings(next: Partial<SettingsState>) {
    setSettings((current) => ({ ...current, ...next }));
    setSaveState("saved");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setAccount({ status: "signed-out", email: null });
  }

  return (
    <div className="settings-layout">
      <section className="dashboard-panel settings-hero" aria-labelledby="settings-title">
        <p className="section-eyebrow">ACCOUNT SETTINGS</p>
        <h1 id="settings-title">설정</h1>
        <p>
          자주 푸는 JLPT 레벨과 복습 기준을 저장해두고,
          학습 기록 화면에서 같은 기준으로 이어서 확인합니다.
        </p>
      </section>

      <section className="settings-grid" aria-label="설정 항목">
        <article className="dashboard-panel settings-card settings-account-card">
          <div className="settings-card-head">
            <span>01</span>
            <div>
              <h2>계정</h2>
              <p>로그인 상태와 계정 이동을 확인합니다.</p>
            </div>
          </div>
          <div className="settings-account-box">
            <strong>{account.status === "signed-in" ? account.email ?? "로그인 계정" : "로그인이 필요합니다"}</strong>
            <span>
              {account.status === "loading"
                ? "계정 정보를 확인 중입니다."
                : account.status === "signed-in"
                  ? "학습 기록 저장과 오답노트 연결에 사용됩니다."
                  : "로그인하면 모의고사 기록과 오답노트를 저장할 수 있습니다."}
            </span>
          </div>
          <div className="settings-actions">
            {account.status === "signed-in" ? (
              <button className="settings-danger-button" type="button" onClick={signOut}>로그아웃</button>
            ) : (
              <Link className="figma-primary" href="/login">로그인하기</Link>
            )}
            <Link className="settings-secondary-button" href="/dashboard">학습 기록 보기</Link>
          </div>
        </article>

        <article className="dashboard-panel settings-card">
          <div className="settings-card-head">
            <span>02</span>
            <div>
              <h2>기본 JLPT 레벨</h2>
              <p>홈과 모의고사 시작 기준으로 사용할 레벨입니다.</p>
            </div>
          </div>
          <div className="settings-level-list" role="radiogroup" aria-label="기본 JLPT 레벨 선택">
            {levels.map((level) => (
              <button
                aria-checked={settings.defaultLevel === level}
                className="settings-level-button"
                data-selected={settings.defaultLevel === level}
                key={level}
                role="radio"
                type="button"
                onClick={() => updateSettings({ defaultLevel: level })}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="settings-inline-note">현재 기본값: <strong>{settings.defaultLevel}</strong></p>
        </article>

        <article className="dashboard-panel settings-card">
          <div className="settings-card-head">
            <span>03</span>
            <div>
              <h2>오답노트</h2>
              <p>복습할 문제에 미응답 문제를 함께 포함할지 정합니다.</p>
            </div>
          </div>
          <button
            aria-pressed={settings.includeUnansweredInWrongNote}
            className="settings-toggle-row"
            type="button"
            onClick={() => updateSettings({ includeUnansweredInWrongNote: !settings.includeUnansweredInWrongNote })}
          >
            <span>
              <strong>미응답 문제 포함</strong>
              <em>{settings.includeUnansweredInWrongNote ? "오답 + 미응답을 함께 복습합니다." : "틀린 문제만 오답노트에 모읍니다."}</em>
            </span>
            <i data-on={settings.includeUnansweredInWrongNote} aria-hidden="true" />
          </button>
        </article>

        <article className="dashboard-panel settings-card settings-wide-card">
          <div className="settings-card-head">
            <span>04</span>
            <div>
              <h2>취약 영역 기준</h2>
              <p>학습 기록에서 어떤 기준을 먼저 보여줄지 선택합니다.</p>
            </div>
          </div>
          <div className="settings-option-grid">
            {weaknessOptions.map((option) => (
              <button
                className="settings-option-card"
                data-selected={settings.weaknessBasis === option.value}
                key={option.value}
                type="button"
                onClick={() => updateSettings({ weaknessBasis: option.value })}
              >
                <strong>{option.label}</strong>
                <span>{option.helper}</span>
              </button>
            ))}
          </div>
          <p className="settings-inline-note">현재 기준: <strong>{selectedWeakness.label}</strong></p>
        </article>

        <article className="dashboard-panel settings-card settings-wide-card settings-info-card">
          <div className="settings-card-head">
            <span>05</span>
            <div>
              <h2>서비스 안내</h2>
              <p>점수와 공식성에 대한 기준을 확인합니다.</p>
            </div>
          </div>
          <ul>
            <li>출제 체감 score는 학습자 응답 기반 참고 지표입니다.</li>
            <li>공식 JLPT 출제 이력이나 합격 가능성을 의미하지 않습니다.</li>
            <li>실제 응시 전에는 공식 JLPT 안내와 시험장 공지를 확인해주세요.</li>
          </ul>
        </article>
      </section>

      <p className="settings-save-state" aria-live="polite">
        {saveState === "saved" ? "설정이 이 브라우저에 저장되었습니다." : "변경 사항은 이 브라우저에 자동 저장됩니다."}
      </p>
    </div>
  );
}

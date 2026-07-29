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
  nickname: string;
};

type SettingsAuthSession = {
  user?: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
} | null;

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

function nicknameFromSession(session: SettingsAuthSession): string {
  const metadata = session?.user?.user_metadata ?? {};
  const rawName = metadata.nickname ?? metadata.full_name ?? metadata.name ?? metadata.user_name;
  const email = session?.user?.email ?? null;

  return typeof rawName === "string" && rawName.trim()
    ? rawName.trim()
    : email?.split("@")[0] || "";
}

function normalizeSettings(raw: Partial<SettingsState>): SettingsState {
  return {
    defaultLevel: levels.includes(raw.defaultLevel as JlptLevel) ? raw.defaultLevel as JlptLevel : defaultSettings.defaultLevel,
    includeUnansweredInWrongNote: typeof raw.includeUnansweredInWrongNote === "boolean"
      ? raw.includeUnansweredInWrongNote
      : defaultSettings.includeUnansweredInWrongNote,
    weaknessBasis: weaknessOptions.some((option) => option.value === raw.weaknessBasis)
      ? raw.weaknessBasis as WeaknessBasis
      : defaultSettings.weaknessBasis,
  };
}

function settingsFromSession(session: SettingsAuthSession): SettingsState | null {
  const metadata = session?.user?.user_metadata ?? {};
  if (!metadata.jlpt_quiz_settings && !metadata.default_jlpt_level && !metadata.weakness_basis) return null;
  const saved = typeof metadata.jlpt_quiz_settings === "object" && metadata.jlpt_quiz_settings !== null
    ? metadata.jlpt_quiz_settings as Partial<SettingsState>
    : {};
  return normalizeSettings({
    ...saved,
    defaultLevel: (metadata.default_jlpt_level as JlptLevel | undefined) ?? saved.defaultLevel,
    weaknessBasis: (metadata.weakness_basis as WeaknessBasis | undefined) ?? saved.weaknessBasis,
  });
}

function readSettings(): SettingsState {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return normalizeSettings(parsed);
  } catch {
    return defaultSettings;
  }
}

export function SettingsClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [account, setAccount] = useState<AccountState>({ status: "loading", email: null, nickname: "" });
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaveState, setNicknameSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [nicknameMessage, setNicknameMessage] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSettings(readSettings());
      setSettingsLoaded(true);
    });
  }, []);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        const nickname = nicknameFromSession(data.session);
        const remoteSettings = settingsFromSession(data.session);
        if (remoteSettings) setSettings(remoteSettings);
        setAccount({ status: data.session ? "signed-in" : "signed-out", email: data.session?.user.email ?? null, nickname });
        setNicknameInput(nickname);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const nickname = nicknameFromSession(session);
        const remoteSettings = settingsFromSession(session);
        if (remoteSettings) setSettings(remoteSettings);
        setAccount({ status: session ? "signed-in" : "signed-out", email: session?.user.email ?? null, nickname });
        setNicknameInput(nickname);
      });
      return () => data.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => setAccount({ status: "signed-out", email: null, nickname: "" }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !settingsLoaded) return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (saveState === "idle") return;
    const timer = window.setTimeout(() => setSaveState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [settings, saveState, settingsLoaded]);

  const selectedWeakness = useMemo(
    () => weaknessOptions.find((option) => option.value === settings.weaknessBasis) ?? weaknessOptions[0],
    [settings.weaknessBasis],
  );

  async function persistAccountSettings(nextSettings: SettingsState) {
    if (account.status !== "signed-in") {
      setSaveState("saved");
      return;
    }

    setSaveState("saving");
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        jlpt_quiz_settings: nextSettings,
        default_jlpt_level: nextSettings.defaultLevel,
        weakness_basis: nextSettings.weaknessBasis,
      },
    });

    setSaveState(error ? "error" : "saved");
  }

  function updateSettings(next: Partial<SettingsState>) {
    const nextSettings = { ...settings, ...next };
    setSettings(nextSettings);
    void persistAccountSettings(nextSettings);
  }

  async function saveNickname() {
    if (account.status !== "signed-in" || nicknameSaveState === "saving") return;

    const trimmedNickname = nicknameInput.trim();
    if (!trimmedNickname) {
      setNicknameSaveState("error");
      setNicknameMessage("닉네임을 입력해주세요.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    setNicknameSaveState("saving");
    setNicknameMessage(null);

    const { data, error } = await supabase.auth.updateUser({ data: { nickname: trimmedNickname } });

    if (error) {
      setNicknameSaveState("error");
      setNicknameMessage(error.message);
      return;
    }

    const nextNickname = nicknameFromSession(data.user ? { user: data.user } : null) || trimmedNickname;
    setAccount((current) => ({ ...current, nickname: nextNickname }));
    setNicknameInput(nextNickname);
    setNicknameSaveState("saved");
    setNicknameMessage("프로필 이름이 저장되었습니다.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setAccount({ status: "signed-out", email: null, nickname: "" });
    setNicknameInput("");
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
            <strong>{account.status === "signed-in" ? account.nickname || account.email || "로그인 계정" : "로그인이 필요합니다"}</strong>
            <span>
              {account.status === "loading"
                ? "계정 정보를 확인 중입니다."
                : account.status === "signed-in"
                  ? account.email ?? "학습 기록 저장과 오답노트 연결에 사용됩니다."
                  : "로그인하면 모의고사 기록과 오답노트를 저장할 수 있습니다."}
            </span>
          </div>
          {account.status === "signed-in" ? (
            <div className="settings-nickname-form">
              <label htmlFor="settings-nickname">닉네임</label>
              <div>
                <input
                  id="settings-nickname"
                  type="text"
                  value={nicknameInput}
                  maxLength={24}
                  placeholder="표시할 닉네임"
                  onChange={(event) => {
                    setNicknameInput(event.target.value);
                    if (nicknameSaveState !== "idle") {
                      setNicknameSaveState("idle");
                      setNicknameMessage(null);
                    }
                  }}
                />
                <button type="button" onClick={saveNickname} disabled={nicknameSaveState === "saving"}>
                  {nicknameSaveState === "saving" ? "저장 중" : "저장"}
                </button>
              </div>
              {nicknameMessage ? <p data-state={nicknameSaveState}>{nicknameMessage}</p> : null}
            </div>
          ) : null}
          <div className="settings-actions">
            {account.status === "signed-in" ? (
              <button className="settings-danger-button" type="button" onClick={signOut}>로그아웃</button>
            ) : (
              <Link className="figma-primary" href="/login">로그인하기</Link>
            )}
            <Link className="settings-secondary-button" href="/dashboard">학습 기록 보기</Link>
          </div>
        </article>

        <article className="dashboard-panel settings-card settings-level-and-wrongnote-card">
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

          <div className="settings-wrongnote-embedded">
            <div className="settings-card-head">
              <span>03</span>
              <div>
                <h2>오답노트</h2>
                <p>실제로 풀고 틀린 문제만 모아 복습합니다.</p>
              </div>
            </div>
            <div className="settings-toggle-row settings-static-row" aria-label="오답노트 기준">
              <span>
                <strong>틀린 문제 전용</strong>
                <em>미응답 문제는 오답노트에 넣지 않습니다.</em>
              </span>
            </div>
          </div>
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
      </section>

      <p className="settings-save-state" aria-live="polite">
        {saveState === "saving"
          ? "계정 설정을 저장하는 중입니다."
          : saveState === "saved"
            ? account.status === "signed-in" ? "설정이 계정에 저장되었습니다." : "설정이 이 브라우저에 저장되었습니다."
            : saveState === "error"
              ? "계정 저장에 실패했습니다. 다시 시도해주세요."
              : account.status === "signed-in" ? "변경 사항은 계정에 자동 저장됩니다." : "변경 사항은 이 브라우저에 자동 저장됩니다."}
      </p>
    </div>
  );
}

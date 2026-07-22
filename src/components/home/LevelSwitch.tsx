"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type LevelOption = {
  level: string;
  title: string;
  time: string;
  href: string;
  description: string;
};

export function LevelSwitch({ levels }: { levels: LevelOption[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isLiquidMoving, setIsLiquidMoving] = useState(false);
  const [motionDirection, setMotionDirection] = useState<"left" | "right" | "none">("none");
  const activeIndicatorIndex = previewIndex ?? selectedIndex;
  const previousIndicatorIndexRef = useRef(activeIndicatorIndex);
  const selectedLevel = levels[selectedIndex] ?? levels[0];

  useEffect(() => {
    const previousIndex = previousIndicatorIndexRef.current;
    if (previousIndex === activeIndicatorIndex) return;

    setMotionDirection(activeIndicatorIndex > previousIndex ? "right" : "left");
    setIsLiquidMoving(true);
    previousIndicatorIndexRef.current = activeIndicatorIndex;

    const timer = window.setTimeout(() => setIsLiquidMoving(false), 460);
    return () => window.clearTimeout(timer);
  }, [activeIndicatorIndex]);

  const switchStyle = useMemo(
    () => ({ "--active-level-index": activeIndicatorIndex }) as React.CSSProperties,
    [activeIndicatorIndex],
  );

  return (
    <section className="home-start-console" aria-labelledby="level-title">
      <h2 id="level-title">JLPT 레벨 선택</h2>
      <div
        className="home-level-switch"
        onMouseLeave={() => setPreviewIndex(null)}
        onPointerLeave={() => setPreviewIndex(null)}
        role="tablist"
        aria-label="JLPT 레벨 선택"
        data-liquid-moving={isLiquidMoving ? "true" : undefined}
        data-motion-direction={motionDirection}
        style={switchStyle}
      >
        <span className="home-level-switch-indicator" aria-hidden="true" />
        {levels.map((item, index) => (
          <button
            aria-controls="home-selected-level-summary"
            aria-selected={index === selectedIndex}
            className="home-level-switch-item"
            data-selected={index === selectedIndex ? "true" : undefined}
            data-previewed={index === previewIndex ? "true" : undefined}
            id={`home-level-tab-${item.level.toLowerCase()}`}
            key={item.level}
            onClick={() => setSelectedIndex(index)}
            onBlur={() => setPreviewIndex(null)}
            onFocus={() => setPreviewIndex(index)}
            onMouseEnter={() => setPreviewIndex(index)}
            onPointerEnter={() => setPreviewIndex(index)}
            role="tab"
            type="button"
          >
            <strong>{item.level}</strong>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      <div
        aria-label="선택한 모의고사 요약"
        aria-labelledby={`home-level-tab-${selectedLevel.level.toLowerCase()}`}
        className="home-exam-summary"
        id="home-selected-level-summary"
        role="tabpanel"
      >
        <dl>
          <div>
            <dt>선택 레벨</dt>
            <dd>{selectedLevel.level} · {selectedLevel.title}</dd>
          </div>
          <div>
            <dt>구성</dt>
            <dd>문자·어휘 / 문법 / 독해</dd>
          </div>
          <div>
            <dt>예상 소요</dt>
            <dd>{selectedLevel.time}</dd>
          </div>
        </dl>
        <p>{selectedLevel.description}</p>
      </div>

      <Link className="home-start-button" href={selectedLevel.href}>
        <span>{selectedLevel.level} 모의고사 시작</span>
        <b aria-hidden="true">→</b>
      </Link>
    </section>
  );
}

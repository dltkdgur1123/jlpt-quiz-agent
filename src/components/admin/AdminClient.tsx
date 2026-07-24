"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminState = "loading" | "signed-out" | "forbidden" | "admin";

export function AdminClient() {
  const [state, setState] = useState<AdminState>("loading");

  useEffect(() => {
    let isCancelled = false;

    async function checkAdmin() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        if (!isCancelled) setState("signed-out");
        return;
      }

      const response = await fetch("/api/auth/admin-status", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const payload = response.ok ? await response.json() as { isAdmin?: boolean } : { isAdmin: false };

      if (!isCancelled) setState(payload.isAdmin ? "admin" : "forbidden");
    }

    checkAdmin();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (state === "loading") {
    return <p className="admin-status">관리자 권한을 확인하고 있습니다.</p>;
  }

  if (state === "signed-out") {
    return (
      <div className="admin-status-card">
        <strong>로그인이 필요합니다.</strong>
        <p>관리자 계정으로 로그인한 뒤 다시 접근해주세요.</p>
        <Link href="/login?next=/admin">로그인하기</Link>
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="admin-status-card">
        <strong>관리자 권한이 없습니다.</strong>
        <p>등록된 관리자 이메일 계정만 접근할 수 있습니다.</p>
        <Link href="/">홈으로 이동</Link>
      </div>
    );
  }

  return (
    <section className="admin-panel-card">
      <p className="section-eyebrow">Admin</p>
      <h1>관리자 콘솔</h1>
      <p>관리자 권한이 확인되었습니다. 다음 단계에서 문제 검수, 데이터 업로드, 운영 지표 기능을 연결합니다.</p>
    </section>
  );
}
